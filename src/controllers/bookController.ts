import { Request, Response, NextFunction } from 'express';
import { BookService } from '../services/bookService';

const bookService = new BookService();

export class BookController {
  async createBook(req: Request, res: Response, next: NextFunction) {
    try {
      const book = await bookService.createBook(req.body);
      res.status(201).json({
        success: true,
        data: book
      });
    } catch (error) {
      next(error);
    }
  }

  async updateBook(req: Request, res: Response, next: NextFunction) {
    try {
      const { id } = req.params;
      const book = await bookService.updateBook(id, req.body);
      res.json({
        success: true,
        data: book
      });
    } catch (error) {
      next(error);
    }
  }

  async deleteBook(req: Request, res: Response, next: NextFunction) {
    try {
      const { id } = req.params;
      const result = await bookService.deleteBook(id);
      res.json({
        success: true,
        data: result
      });
    } catch (error) {
      next(error);
    }
  }

  async getBook(req: Request, res: Response, next: NextFunction) {
    try {
      const { id } = req.params;
      const book = await bookService.getBookById(id);
      res.json({
        success: true,
        data: book
      });
    } catch (error) {
      next(error);
    }
  }

  async searchBooks(req: Request, res: Response, next: NextFunction) {
    try {
      const books = await bookService.searchBooks(req.query);
      res.json({
        success: true,
        data: books
      });
    } catch (error) {
      next(error);
    }
  }
}