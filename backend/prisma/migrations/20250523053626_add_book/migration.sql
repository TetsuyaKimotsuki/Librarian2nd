-- CreateTable
CREATE TABLE "Book" (
    "id" TEXT NOT NULL,
    "title" TEXT NOT NULL,
    "author" TEXT NOT NULL,
    "isbn" TEXT,
    "location" TEXT,
    "memo" TEXT,
    "purchasedAt" TIMESTAMP(3),
    "registeredBy" TEXT NOT NULL,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "Book_pkey" PRIMARY KEY ("id")
);

-- AddForeignKey
ALTER TABLE "Book" ADD CONSTRAINT "Book_registeredBy_fkey" FOREIGN KEY ("registeredBy") REFERENCES "User"("email") ON DELETE RESTRICT ON UPDATE CASCADE;
