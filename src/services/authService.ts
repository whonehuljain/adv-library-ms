import bcrypt from 'bcryptjs';
import prisma from '../config/prismaClient';
import { generateToken, verifyToken } from '../config/jwt';
import { CustomError } from '../middlewares/errorHandler';

import { EmailService } from './emailService';

export class AuthService {


  async register(data: {
    email: string;
    password: string;
    name: string;
    role?: 'ADMIN' | 'MEMBER';
  }) {
    const existingUser = await prisma.user.findUnique({
      where: { email: data.email }
    });

    if (existingUser) {
      throw new CustomError('Email already registered');
    }

    const hashedPassword = await bcrypt.hash(data.password, 10);
    const verificationToken = generateToken({ email: data.email });

    const user = await prisma.user.create({
      data: {
        ...data,
        password: hashedPassword,
        verification_token: verificationToken
      }
    });



    //send mail
    await this.sendVerificationEmail(user.email, verificationToken, user.name);

    return {
      id: user.id,
      email: user.email,
      name: user.name,
      role: user.role
    };
  }

  async login(email: string, password: string) {
    const user = await prisma.user.findUnique({
      where: { email }
    });

    if (!user) {
      throw new CustomError('Invalid credentials');
    }

    const isValidPassword = await bcrypt.compare(password, user.password);
    if (!isValidPassword) {
      throw new CustomError('Invalid credentials');
    }


    if (!user.is_verified) {
      throw new CustomError('Verify your email first');
    }

    const token = generateToken({
      id: user.id,
      email: user.email,
      role: user.role
    });

    return {
      token,
      user: {
        id: user.id,
        email: user.email,
        name: user.name,
        role: user.role
      }
    };
  }

  async verifyEmail(token: string) {
    try {
      const decoded = verifyToken(token);
      const user = await prisma.user.update({
        where: { email: decoded.email },
        data: { is_verified: true }
      });


      
      await this.emailService.sendEmail(
        user.email,
        'Welcome to Our Library!',
        this.emailService.getWelcomeEmailTemplate(user.name)
      );

      return {
        message: 'Email verified successfully',
        user: {
          id: user.id,
          email: user.email,
          name: user.name
        }
      };
    } catch (error) {
      throw new CustomError('Invalid or expired verification token');
    }
  }


  private emailService: EmailService;

  constructor() {
    this.emailService = EmailService.getInstance();
  }

  private async sendVerificationEmail(email: string, token: string, name: string) {

    const verificationLink = `${process.env.APP_URL || 'http://localhost:' + process.env.PORT}/auth/verify/${token}`;


    try {
      await this.emailService.sendEmail(
        email,
        'Verify Your Email Address',
        this.emailService.getVerificationEmailTemplate(name, verificationLink)
      );
    } catch (error) {

      console.error('Failed to send verification email:', error);

    }
  }
}
