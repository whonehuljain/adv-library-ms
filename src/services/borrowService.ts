import prisma from '../config/prismaClient';
import { CustomError } from '../middlewares/errorHandler';
import { addDays } from 'date-fns';


const BORROW_LIMIT = 3;
const BORROW_DURATION_DAYS = 14;
const FINE_PER_DAY = 1.00;

export class BorrowService {
  static async borrowBook(userId: string, isbn: string) {

    return await prisma.$transaction(async (tx) => {
      
      const user = await tx.user.findFirst({
        where: { 
          id: userId,
          is_verified: true,
          is_active: true,
          deleted_at: null
        }
      });

      if (!user) {
        throw new CustomError('User must be verified and active to borrow books', 403);
      }

     
      const activeBorrows = await tx.borrowedBook.count({
        where: {
          user_id: userId,
          return_date: null
        }
      });

      if (activeBorrows >= BORROW_LIMIT) {
        throw new CustomError(`You cannot borrow more than ${BORROW_LIMIT} books at a time`, 400);
      }

      const book = await tx.book.findFirst({
        where: {
          isbn,
          deleted_at: null,
          copies: {
            gt: 0
          }
        }
      });

      if (!book) {
        throw new CustomError('Book not available', 404);
      }

      const existingBorrow = await tx.borrowedBook.findFirst({
        where: {
          user_id: userId,
          book_id: book.id,
          return_date: null
        }
      });

      if (existingBorrow) {
        throw new CustomError('You already have this book borrowed', 400);
      }

      const dueDate = addDays(new Date(), BORROW_DURATION_DAYS);
      
      const borrowRecord = await tx.borrowedBook.create({
        data: {
          user_id: userId,
          book_id: book.id,
          due_date: dueDate
        }
      });

      await tx.book.update({
        where: { id: book.id },
        data: { copies: { decrement: 1 } }
      });

      return borrowRecord;
    });
  }

  static async returnBook(userId: string, borrowedBookId: string) {
    return await prisma.$transaction(async (tx) => {

      const borrowRecord = await tx.borrowedBook.findFirst({
        where: {
          id: borrowedBookId,
          user_id: userId,
          return_date: null
        },
        include: {
          books: true
        }
      });

      if (!borrowRecord) {
        throw new CustomError('Borrow record not found', 404);
      }

      const now = new Date();
      const dueDate = new Date(borrowRecord.due_date);
      let fine = 0;


      if (now > dueDate) {
        const daysLate = Math.ceil((now.getTime() - dueDate.getTime()) / (1000 * 60 * 60 * 24));
        fine = daysLate * FINE_PER_DAY;

        if (fine > 0) {
          await tx.transaction.create({
            data: {
              user_id: userId,
              amount: fine,
              type: 'FINE',
              status: 'PENDING'
            }
          });
        }
      }

      const returnedBook = await tx.borrowedBook.update({
        where: { id: borrowedBookId },
        data: { return_date: now }
      });

      await tx.book.update({
        where: { id: borrowRecord.book_id },
        data: { copies: { increment: 1 } }
      });

      return {
        returnedBook,
        fine: fine > 0 ? fine : null
      };
    });
  }
}
