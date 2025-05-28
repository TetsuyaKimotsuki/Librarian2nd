-- CreateTable
CREATE TABLE "User" (
    "email" VARCHAR(255) NOT NULL,
    "password" VARCHAR(255) NOT NULL,
    "name" VARCHAR(255) NOT NULL,
    "role" VARCHAR(32) NOT NULL,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "User_pkey" PRIMARY KEY ("email")
);

-- CreateTable
CREATE TABLE "Book" (
    "id" UUID NOT NULL,
    "title" VARCHAR(255) NOT NULL,
    "author" VARCHAR(255) NOT NULL,
    "isbn" VARCHAR(32),
    "location" VARCHAR(255),
    "memo" TEXT,
    "purchasedAt" TIMESTAMP(3) DEFAULT '2000-01-01 00:00:00 +00:00',
    "registeredBy" VARCHAR(255) NOT NULL,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "Book_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "User_email_key" ON "User"("email");

-- AddForeignKey
ALTER TABLE "Book" ADD CONSTRAINT "Book_registeredBy_fkey" FOREIGN KEY ("registeredBy") REFERENCES "User"("email") ON DELETE RESTRICT ON UPDATE CASCADE;
