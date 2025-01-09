# Adv. Library management system

Steps to set up locally:

### 1. Clone the Repository

```bash
git clone https://github.com/whonehuljain/adv-library-ms.git
cd adv-library-ms
```

### 2. Install Dependencies

```bash
npm install
```

### 3. Database Setup

1. Create a PostgreSQL database:
```sql
CREATE DATABASE library_db in postgresql
```

2. The tables will be automatically created by Prisma migrations.

### 4. Environment Configuration

1. Create a `.env` file in the root directory similar to .env.example:
```env
# Database
DATABASE_URL="postgresql://username:password@localhost:5432/library_db"

# Server
PORT=8000
NODE_ENV=development

# JWT
JWT_SECRET=your_jwt_secret_key
JWT_EXPIRES_IN=24h

# Email (for email verification test, using mailtrap)
EMAIL_HOST= # SMTP host ("sandbox.smtp.mailtrap.io")
EMAIL_PORT= # SMTP port (2525)
EMAIL_USER= # SMTP username
EMAIL_PASSWORD= # SMTP password
EMAIL_SECURE= # Use secure connection (true/false)
```

Replace the placeholder values with your actual configuration.

### 5. Database Migration

Run Prisma migrations to create database tables:

```bash
npx prisma migrate dev
```

### 6. Run the Application

For development:
```bash
npm run dev
```

For production:
```bash
npm start
```

The server will start on `http://localhost:8000` (or the port you specified in .env)

Then you can test the following endpoints from postman:

### Authentication Endpoints

```
POST /auth/register - Register a new user
POST /auth/login - User login
GET /auth/verify/:token - Verify email
```

### Book Management Endpoints

```
GET /books - Get all books
GET /books/:id - Get specific book
POST /books - Create new book (Admin only)
PUT /books/:id - Update book (Admin only)
DELETE /books/:id - Delete book (Admin only)
```

### User Management Endpoints

```
GET /users/profile - Get user profile
GET /users/:userId/details - Get user details (Admin only)
PATCH /users/:userId/toggle-status - Toggle user status (Admin only)
```

### Borrowing Endpoints

```
POST /borrow/borrow - Borrow a book
POST /borrow/return - Return a book
```

### Payment Endpoints

```
GET /payment/fines/pending - Get pending fines
POST /payment/fines/pay - Pay a fine
GET /payment/history - Get payment history
```

### Analytics Endpoints

```
GET /analytics/books/most-borrowed - Get most borrowed books
GET /analytics/reports/monthly - Get monthly report
GET /analytics/reports/yearly-trends - Get yearly trends
```

