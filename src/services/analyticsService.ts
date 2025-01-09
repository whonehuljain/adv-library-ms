import { PrismaClient } from '@prisma/client';
import { startOfMonth, endOfMonth, subMonths, format } from 'date-fns';
import { Decimal } from '@prisma/client/runtime/library';

const prisma = new PrismaClient();

export class AnalyticsService {
  static async getMostBorrowedBooks(startDate?: Date, endDate?: Date) {
    const dateFilter = startDate && endDate ? {
      borrow_date: {
        gte: startDate,
        lte: endDate
      }
    } : {};

    const bookStats = await prisma.borrowedBook.groupBy({
      by: ['book_id'],
      where: dateFilter,
      _count: {
        book_id: true
      }
    });

    const bookDetails = await Promise.all(
      bookStats.map(async (stat) => {
        const book = await prisma.book.findUnique({
          where: { id: stat.book_id },
          include: {
            authors_books: {
              include: {
                authors: true
              }
            },
            categories_books: {
              include: {
                categories: true
              }
            }
          }
        });

        return {
          book_details: {
            id: book?.id,
            title: book?.title,
            isbn: book?.isbn,
            authors: book?.authors_books.map(ab => ab.authors.name),
            categories: book?.categories_books.map(cb => cb.categories.name)
          },
          borrow_count: stat._count.book_id
        };
      })
    );

    return bookDetails.sort((a, b) => b.borrow_count - a.borrow_count);
  }

  static async getMonthlyReport(month?: Date) {
    const targetMonth = month || new Date();
    const startDate = startOfMonth(targetMonth);
    const endDate = endOfMonth(targetMonth);

    const [
      totalBorrows,
      totalReturns,
      totalNewUsers,
      totalFines,
      totalPayments,
      activeUsers,
      overdueBooks
    ] = await Promise.all([
      // Total borrows this month
      prisma.borrowedBook.count({
        where: {
          borrow_date: {
            gte: startDate,
            lte: endDate
          }
        }
      }),

      // Total returns this month
      prisma.borrowedBook.count({
        where: {
          return_date: {
            gte: startDate,
            lte: endDate
          }
        }
      }),

      // New users this month
      prisma.user.count({
        where: {
          created_at: {
            gte: startDate,
            lte: endDate
          }
        }
      }),

      // Total fines generated
      prisma.transaction.aggregate({
        where: {
          type: 'FINE',
          created_at: {
            gte: startDate,
            lte: endDate
          }
        },
        _sum: {
          amount: true
        }
      }),

      // Total payments received
      prisma.transaction.aggregate({
        where: {
          type: 'PAYMENT',
          status: 'COMPLETED',
          created_at: {
            gte: startDate,
            lte: endDate
          }
        },
        _sum: {
          amount: true
        }
      }),

      // Active users (users who borrowed at least one book)
      prisma.borrowedBook.groupBy({
        by: ['user_id'],
        where: {
          borrow_date: {
            gte: startDate,
            lte: endDate
          }
        }
      }),

      // Overdue books
      prisma.borrowedBook.count({
        where: {
          due_date: {
            lt: new Date()
          },
          return_date: null
        }
      })
    ]);

    // Category-wise borrowing stats
    const categoryStats = await prisma.borrowedBook.findMany({
      where: {
        borrow_date: {
          gte: startDate,
          lte: endDate
        }
      },
      include: {
        books: {
          include: {
            categories_books: {
              include: {
                categories: true
              }
            }
          }
        }
      }
    });

    const categoryBorrows = categoryStats.reduce((acc, borrow) => {
      borrow.books.categories_books.forEach(cb => {
        const category = cb.categories.name;
        acc[category] = (acc[category] || 0) + 1;
      });
      return acc;
    }, {} as Record<string, number>);

    return {
      period: {
        start_date: startDate,
        end_date: endDate,
        month: format(targetMonth, 'MMMM yyyy')
      },
      borrowing_stats: {
        total_borrows: totalBorrows,
        total_returns: totalReturns,
        overdue_books: overdueBooks,
        category_distribution: categoryBorrows
      },
      user_stats: {
        new_users: totalNewUsers,
        active_users: activeUsers.length
      },
      financial_stats: {
        total_fines_generated: totalFines._sum.amount || new Decimal(0),
        total_payments_received: totalPayments._sum.amount || new Decimal(0),
        pending_amount: (totalFines._sum.amount || new Decimal(0))
          .minus(totalPayments._sum.amount || new Decimal(0))
      }
    };
  }

  static async getYearlyTrends() {
    const months = Array.from({ length: 12 }, (_, i) => {
      const date = subMonths(new Date(), i);
      return {
        start: startOfMonth(date),
        end: endOfMonth(date),
        month: format(date, 'MMMM yyyy')
      };
    }).reverse();

    const trends = await Promise.all(
      months.map(async ({ start, end, month }) => {
        const [borrows, returns, fines] = await Promise.all([
          prisma.borrowedBook.count({
            where: {
              borrow_date: {
                gte: start,
                lte: end
              }
            }
          }),
          prisma.borrowedBook.count({
            where: {
              return_date: {
                gte: start,
                lte: end
              }
            }
          }),
          prisma.transaction.aggregate({
            where: {
              type: 'FINE',
              created_at: {
                gte: start,
                lte: end
              }
            },
            _sum: {
              amount: true
            }
          })
        ]);

        return {
          month,
          borrows,
          returns,
          fines: fines._sum.amount || 0
        };
      })
    );

    return trends;
  }
}