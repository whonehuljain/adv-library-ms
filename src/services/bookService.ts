import prisma from '../config/prismaClient';
import { CustomError } from '../middlewares/errorHandler';
import { Book, Author, Category } from '@prisma/client';

interface BookWithRelations extends Book {
  authors_books: {
    authors: Author;
  }[];
  categories_books: {
    categories: Category;
  }[];
  borrowed_books: {
    return_date: Date | null;
  }[];
}

export class BookService {
  async createBook(data: {
    isbn: string;
    title: string;
    copies: number;
    authors: string[];
    categories: string[];
  }) {
    const existingBook = await prisma.book.findUnique({
      where: { isbn: data.isbn }
    });

    if (existingBook) {
      throw new CustomError('book with this isbn exists');
    }

    const result = await prisma.$transaction(async (tx) => {

      
      const book = await tx.book.create({
        data: {
          isbn: data.isbn,
          title: data.title,
          copies: data.copies
        }
      });
      console.log("Book created");



      await tx.authorsOnBooks.createMany({
        data: data.authors.map(authorId => ({
          book_id: book.id,
          author_id: authorId
        }))
      });
      console.log("authors connected");

      
      await tx.categoriesOnBooks.createMany({
        data: data.categories.map(categoryId => ({
          book_id: book.id,
          category_id: categoryId
        }))
      });
      console.log("categories connected");

      // bookID = book.id;
      // console.log(bookID);
      return book.id;
    });
    console.log("result", result);

    return this.getBookById(result);
  }

  async updateBook(id: string, data: Partial<{
    isbn: string;
    title: string;
    copies: number;
    authors: string[];
    categories: string[];
  }>) {
    const book = await prisma.book.findUnique({
      where: { id }
    });

    if (!book) {
      throw new CustomError('Book not found');
    }

    if (data.isbn && data.isbn !== book.isbn) {
      const existingBook = await prisma.book.findUnique({
        where: { isbn: data.isbn }
      });

      if (existingBook) {
        throw new CustomError('book with this isbn already exists');
      }
    }

    const result = await prisma.$transaction(async (tx) => {
      
      const updatedBook = await tx.book.update({
        where: { id },
        data: {
          isbn: data.isbn,
          title: data.title,
          copies: data.copies
        }
      });

      
      if (data.authors) {
        
        await tx.authorsOnBooks.deleteMany({
          where: { book_id: id }
        });

        await tx.authorsOnBooks.createMany({
          data: data.authors.map(authorId => ({
            book_id: id,
            author_id: authorId
          }))
        });
      }

      if (data.categories) {
        await tx.categoriesOnBooks.deleteMany({
          where: { book_id: id }
        });

        await tx.categoriesOnBooks.createMany({
          data: data.categories.map(categoryId => ({
            book_id: id,
            category_id: categoryId
          }))
        });
      }

      return id;
    });

    return this.getBookById(result);
  }

  async deleteBook(id: string) {
    const book = await prisma.book.findUnique({
      where: { id }
    });

    if (!book) {
      throw new CustomError('book not found');
    }

    //soft delete
    await prisma.book.update({
      where: { id },
      data: { deleted_at: new Date() }
    });

    return { message: 'deleted successfully' };
  }

  async getBookById(id: string) {

    console.log(id);
    const book = await prisma.book.findUnique({
      where: { 
        id,
        deleted_at: null
      },
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
        },
        borrowed_books: {
          where: {
            return_date: null
          }
        }
      }
    }) as BookWithRelations | null;

    if (!book) {
      throw new CustomError('book not found');
    }

    const availableCopies = (book.copies ?? 0) - book.borrowed_books.length;

    return {
      ...book,
      authors: book.authors_books.map(ab => ab.authors),
      categories: book.categories_books.map(cb => cb.categories),
      available_copies: availableCopies,
      _count: {
        borrowed: book.borrowed_books.length
      }
    };
  }

  async searchBooks(params: {
    isbn?: string;
    title?: string;
    author?: string;
    category?: string;
    available?: boolean;
  }) {
    const whereClause: any = {
      deleted_at: null
    };

    if (params.isbn) {
      whereClause.isbn = params.isbn;
    }

    if (params.title) {
      whereClause.title = {
        contains: params.title,
        mode: 'insensitive'
      };
    }

    const books = await prisma.book.findMany({
      where: whereClause,
      include: {
        authors_books: {
          include: {
            authors: true
          },
          ...(params.author && {
            where: {
              authors: {
                name: {
                  contains: params.author,
                  mode: 'insensitive'
                }
              }
            }
          })
        },
        categories_books: {
          include: {
            categories: true
          },
          ...(params.category && {
            where: {
              categories: {
                name: {
                  contains: params.category,
                  mode: 'insensitive'
                }
              }
            }
          })
        },
        borrowed_books: {
          where: {
            return_date: null
          }
        }
      }
    }) as BookWithRelations[];

    const formattedBooks = books.map(book => {
      const availableCopies = (book.copies ?? 0) - book.borrowed_books.length;
      return {
        ...book,
        authors: book.authors_books.map(ab => ab.authors),
        categories: book.categories_books.map(cb => cb.categories),
        available_copies: availableCopies,
        _count: {
          borrowed: book.borrowed_books.length
        }
      };
    });

    if (params.available !== undefined) {
      return formattedBooks.filter(book => 
        params.available ? 
          book.available_copies > 0 : 
          book.available_copies === 0
      );
    }

    return formattedBooks;
  }
}