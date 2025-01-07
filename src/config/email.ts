import nodemailer from 'nodemailer';
import { CustomError } from '../middlewares/errorHandler';

export const emailConfig = {
  from: process.env.EMAIL_FROM || 'library@example.com',
  transport: nodemailer.createTransport({
    host: process.env.EMAIL_HOST || 'smtp.gmail.com',
    port: parseInt(process.env.EMAIL_PORT || '587'),
    secure: process.env.EMAIL_SECURE === 'true',
    auth: {
      user: process.env.EMAIL_USER,
      pass: process.env.EMAIL_PASSWORD,
    },
  }),
};