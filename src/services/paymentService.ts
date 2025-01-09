import { Decimal } from '@prisma/client/runtime/library';
import prisma from '../config/prismaClient';
import { CustomError } from '../middlewares/errorHandler';
import { format } from 'date-fns';


export class PaymentService {
    static async getUserPendingFines(userId: string) {
        const pendingFines = await prisma.transaction.findMany({
          where: {
            user_id: userId,
            type: 'FINE',
            status: 'PENDING'
          },
          orderBy: {
            created_at: 'desc'
          }
        });
      
        if (pendingFines.length === 0) {
          return {
            message: "No pending fines",
            fines: [],
            total_amount: 0
          };
        }
      
        const totalAmount = pendingFines.reduce((sum, fine) => {
          return sum.plus(fine.amount);
        }, new Decimal(0));
      
        return {
          fines: pendingFines,
          total_amount: totalAmount
        };
      }

      static async processPayment(userId: string, fineId: string, paymentMethod: string) {
        return await prisma.$transaction(async (tx) => {
 
          const pendingFine = await tx.transaction.findFirst({
            where: {
              id: fineId,
              user_id: userId,
              type: 'FINE',
              status: 'PENDING'
            }
          });
      
          if (!pendingFine) {
            throw new CustomError('Fine not found or already paid', 404);
          }
      
          //could connect to a payment gateway here
          
          try {
            const paymentTransaction = await tx.transaction.create({
              data: {
                user_id: userId,
                amount: pendingFine.amount,
                type: 'PAYMENT',
                status: 'COMPLETED'
              }
            });
      

            const updatedFine = await tx.transaction.update({
              where: { id: fineId },
              data: { status: 'COMPLETED' }
            });

            const invoice = await this.generateInvoice(
              userId, 
              updatedFine, 
              paymentTransaction, 
              paymentMethod
            );
      
            return {
              success: true,
              payment: paymentTransaction,
              fine: updatedFine,
              invoice
            };
      
          } catch (error) {

            await tx.transaction.create({
              data: {
                user_id: userId,
                amount: pendingFine.amount,
                type: 'PAYMENT',
                status: 'FAILED'
              }
            });
      
            throw new CustomError('Payment processing failed', 400);
          }
        });
      }

  static async generateInvoice(
    userId: string,
    fineTransaction: any,
    paymentTransaction: any,
    paymentMethod: string
  ) {

    const user = await prisma.user.findUnique({
      where: { id: userId }
    });

    if (!user) {
      throw new CustomError('User not found', 404);
    }

    const invoiceNumber = `INV-${format(new Date(), 'yyyyMMdd')}-${paymentTransaction.id.slice(0, 8)}`;


    const invoice = {
      invoice_number: invoiceNumber,
      date: new Date(),
      user_details: {
        name: user.name,
        email: user.email
      },
      payment_details: {
        amount: fineTransaction.amount,
        payment_method: paymentMethod,
        payment_date: paymentTransaction.created_at,
        transaction_id: paymentTransaction.id
      },
      fine_details: {
        fine_date: fineTransaction.created_at,
        fine_id: fineTransaction.id
      },
      library_details: {
        name: "Library Name",
        address: "Library Address",
        email: "library@example.com"
      },
      status: 'PAID'
    };

    console.log('Generated Invoice:', invoice);
    return invoice;
  }

  static async getPaymentHistory(userId: string) {
    const payments = await prisma.transaction.findMany({
      where: {
        user_id: userId,
        type: 'PAYMENT',
      },
      orderBy: {
        created_at: 'desc'
      }
    });

    return payments;
  }
}