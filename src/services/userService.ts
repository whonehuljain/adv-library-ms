import prisma from '../config/prismaClient';
import { CustomError } from '../middlewares/errorHandler';


export const getAllUsers = async (filters?: {
  name?: string;
  email?: string;
  role?: 'ADMIN' | 'MEMBER';
  isActive?: boolean;
  isVerified?: boolean;
}) => {
  return await prisma.user.findMany({
    where: {
      deleted_at: null,
      ...(filters?.name && {
        name: {
          contains: filters.name,
          mode: 'insensitive'
        }
      }),
      ...(filters?.email && {
        email: {
          contains: filters.email,
          mode: 'insensitive'
        }
      }),
      ...(filters?.role && { role: filters.role }),
      ...(filters?.isActive !== undefined && { is_active: filters.isActive }),
      ...(filters?.isVerified !== undefined && { is_verified: filters.isVerified })
    },
    select: {
      id: true,
      email: true,
      name: true,
      role: true,
      is_verified: true,
      is_active: true,
      created_at: true,
    },
  });
};

export const getUserById = async (userId: string) => {
  const user = await prisma.user.findUnique({
    where: { id: userId, deleted_at: null },
    select: {
      id: true,
      email: true,
      name: true,
      role: true,
      is_verified: true,
      is_active: true,
      created_at: true,
    },
  });

  if (!user) {
    throw new CustomError('User not found', 404);
  }

  return user;
};

export const getUserBorrowedBooks = async (userId: string) => {
  const borrowedBooks = await prisma.borrowedBook.findMany({
    where: {
      user_id: userId,
      return_date: null,
    },
    include: {
      books: {
        include: {
          authors_books: {
            include: {
              authors: true,
            },
          },
          categories_books: {
            include: {
              categories: true,
            },
          },
        },
      },
    },
  });

  return borrowedBooks;
};

export const getUserFines = async (userId: string) => {


  const fines = await prisma.transaction.findMany({
    where: {
      user_id: userId,
      type: 'FINE',
    },
    orderBy: {
      created_at: 'desc',
    },
  });

  const totalUnpaidFines = await prisma.transaction.aggregate({
    where: {
      user_id: userId,
      type: 'FINE',
      status: 'PENDING',
    },
    _sum: {
      amount: true,
    },
  });


  return {
    fines,
    totalUnpaidFines: totalUnpaidFines._sum.amount || 0,
  };
};

export const toggleUserStatus = async (userId: string) => {
  const user = await prisma.user.findUnique({
    where: { id: userId, deleted_at: null },
  });

  if (!user) {
    throw new CustomError('User not found', 404);
  }

  const updatedUser = await prisma.user.update({
    where: { id: userId },
    data: {
      is_active: !user.is_active,
    },
    select: {
      id: true,
      email: true,
      name: true,
      role: true,
      is_verified: true,
      is_active: true,
      created_at: true,
    },
  });

  return updatedUser;
};


export const getUserDetailsByAdmin = async (userId: string) => {

    
    const user = await getUserById(userId);
  
    const currentBorrowedBooks = await getUserBorrowedBooks(userId);
  
    const borrowingHistory = await prisma.borrowedBook.findMany({
      where: {
        user_id: userId,
        return_date: { not: null },
      },
      include: {
        books: {
          include: {
            authors_books: {
              include: {
                authors: true,
              },
            },
            categories_books: {
              include: {
                categories: true,
              },
            },
          },
        },
      },
      orderBy: {
        borrow_date: 'desc',
      },
    });

  
    const { fines: transactions, totalUnpaidFines } = await getUserFines(userId);


    const borrowingStats = {
      totalBorrowedBooks: borrowingHistory.length + currentBorrowedBooks.length,
      currentlyBorrowed: currentBorrowedBooks.length,
      returnedOnTime: borrowingHistory.filter(book => 
        new Date(book.return_date!) <= new Date(book.due_date)
      ).length,
      returnedLate: borrowingHistory.filter(book => 
        new Date(book.return_date!) > new Date(book.due_date)
      ).length,
    };
  
    const paymentStats = {
      totalFines: transactions.reduce((sum, t) => sum + Number(t.amount), 0),
      totalPaid: transactions
        .filter(t => t.status === 'COMPLETED')
        .reduce((sum, t) => sum + Number(t.amount), 0),
      pendingAmount: Number(totalUnpaidFines) || 0,
    };
  
    return {
      userInfo: user,
      currentBorrowings: currentBorrowedBooks,
      borrowingHistory,
      transactions,
      statistics: {
        borrowing: borrowingStats,
        payments: paymentStats,
      },
    };
  };