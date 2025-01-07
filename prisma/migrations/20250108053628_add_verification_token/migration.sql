-- CreateEnum
CREATE TYPE "transaction_status" AS ENUM ('PENDING', 'COMPLETED', 'FAILED');

-- CreateEnum
CREATE TYPE "transaction_type" AS ENUM ('FINE', 'PAYMENT');

-- CreateEnum
CREATE TYPE "user_role" AS ENUM ('ADMIN', 'MEMBER');

-- CreateTable
CREATE TABLE "users" (
    "id" UUID NOT NULL DEFAULT gen_random_uuid(),
    "email" VARCHAR(255) NOT NULL,
    "password" VARCHAR(255) NOT NULL,
    "name" VARCHAR(255) NOT NULL,
    "role" "user_role" DEFAULT 'MEMBER',
    "is_verified" BOOLEAN DEFAULT false,
    "is_active" BOOLEAN DEFAULT true,
    "verification_token" VARCHAR(255),
    "created_at" TIMESTAMPTZ(6) DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMPTZ(6) DEFAULT CURRENT_TIMESTAMP,
    "deleted_at" TIMESTAMPTZ(6),

    CONSTRAINT "users_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "books" (
    "id" UUID NOT NULL DEFAULT gen_random_uuid(),
    "isbn" VARCHAR(13) NOT NULL,
    "title" VARCHAR(255) NOT NULL,
    "copies" INTEGER DEFAULT 1,
    "created_at" TIMESTAMPTZ(6) DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMPTZ(6) DEFAULT CURRENT_TIMESTAMP,
    "deleted_at" TIMESTAMPTZ(6),

    CONSTRAINT "books_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "authors" (
    "id" UUID NOT NULL DEFAULT gen_random_uuid(),
    "name" VARCHAR(255) NOT NULL,
    "created_at" TIMESTAMPTZ(6) DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMPTZ(6) DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "authors_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "categories" (
    "id" UUID NOT NULL DEFAULT gen_random_uuid(),
    "name" VARCHAR(255) NOT NULL,
    "created_at" TIMESTAMPTZ(6) DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMPTZ(6) DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "categories_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "borrowed_books" (
    "id" UUID NOT NULL DEFAULT gen_random_uuid(),
    "user_id" UUID NOT NULL,
    "book_id" UUID NOT NULL,
    "borrow_date" TIMESTAMPTZ(6) DEFAULT CURRENT_TIMESTAMP,
    "due_date" TIMESTAMPTZ(6) NOT NULL,
    "return_date" TIMESTAMPTZ(6),
    "created_at" TIMESTAMPTZ(6) DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "borrowed_books_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "transactions" (
    "id" UUID NOT NULL DEFAULT gen_random_uuid(),
    "user_id" UUID NOT NULL,
    "amount" DECIMAL(10,2) NOT NULL,
    "status" "transaction_status" NOT NULL,
    "type" "transaction_type" NOT NULL,
    "created_at" TIMESTAMPTZ(6) DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "transactions_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "authors_books" (
    "book_id" UUID NOT NULL,
    "author_id" UUID NOT NULL,

    CONSTRAINT "authors_books_pkey" PRIMARY KEY ("book_id","author_id")
);

-- CreateTable
CREATE TABLE "categories_books" (
    "book_id" UUID NOT NULL,
    "category_id" UUID NOT NULL,

    CONSTRAINT "categories_books_pkey" PRIMARY KEY ("book_id","category_id")
);

-- CreateIndex
CREATE UNIQUE INDEX "users_email_key" ON "users"("email");

-- CreateIndex
CREATE INDEX "idx_users_email" ON "users"("email");

-- CreateIndex
CREATE UNIQUE INDEX "books_isbn_key" ON "books"("isbn");

-- CreateIndex
CREATE INDEX "idx_books_isbn" ON "books"("isbn");

-- CreateIndex
CREATE UNIQUE INDEX "categories_name_key" ON "categories"("name");

-- CreateIndex
CREATE INDEX "idx_borrowed_books_book" ON "borrowed_books"("book_id");

-- CreateIndex
CREATE INDEX "idx_borrowed_books_user" ON "borrowed_books"("user_id");

-- CreateIndex
CREATE INDEX "idx_transactions_user" ON "transactions"("user_id");

-- CreateIndex
CREATE INDEX "idx_authors_books_author" ON "authors_books"("author_id");

-- CreateIndex
CREATE INDEX "idx_authors_books_book" ON "authors_books"("book_id");

-- CreateIndex
CREATE INDEX "idx_categories_books_book" ON "categories_books"("book_id");

-- CreateIndex
CREATE INDEX "idx_categories_books_category" ON "categories_books"("category_id");

-- AddForeignKey
ALTER TABLE "borrowed_books" ADD CONSTRAINT "borrowed_books_book_id_fkey" FOREIGN KEY ("book_id") REFERENCES "books"("id") ON DELETE NO ACTION ON UPDATE NO ACTION;

-- AddForeignKey
ALTER TABLE "borrowed_books" ADD CONSTRAINT "borrowed_books_user_id_fkey" FOREIGN KEY ("user_id") REFERENCES "users"("id") ON DELETE NO ACTION ON UPDATE NO ACTION;

-- AddForeignKey
ALTER TABLE "transactions" ADD CONSTRAINT "fk_user" FOREIGN KEY ("user_id") REFERENCES "users"("id") ON DELETE CASCADE ON UPDATE NO ACTION;

-- AddForeignKey
ALTER TABLE "authors_books" ADD CONSTRAINT "fk_author" FOREIGN KEY ("author_id") REFERENCES "authors"("id") ON DELETE CASCADE ON UPDATE NO ACTION;

-- AddForeignKey
ALTER TABLE "authors_books" ADD CONSTRAINT "fk_book" FOREIGN KEY ("book_id") REFERENCES "books"("id") ON DELETE CASCADE ON UPDATE NO ACTION;

-- AddForeignKey
ALTER TABLE "categories_books" ADD CONSTRAINT "fk_book" FOREIGN KEY ("book_id") REFERENCES "books"("id") ON DELETE CASCADE ON UPDATE NO ACTION;

-- AddForeignKey
ALTER TABLE "categories_books" ADD CONSTRAINT "fk_category" FOREIGN KEY ("category_id") REFERENCES "categories"("id") ON DELETE CASCADE ON UPDATE NO ACTION;
