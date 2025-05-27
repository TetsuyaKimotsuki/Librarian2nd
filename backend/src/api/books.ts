import { PrismaClient } from '@prisma/client';
import { Hono } from 'hono';
import { jwtGuardian } from '../middleware/guardian.js';
import { isValidDateFormat, isWithinRange } from '../tools/validator.js';

const prisma = new PrismaClient();
const books = new Hono();
books.use('*', jwtGuardian);

// GET /api/books/all
books.get('/all', async (c) => {
    // 認証済みユーザー情報はc.get('user')で取得可能
    // 書籍一覧取得
    const booksList = await prisma.book.findMany({
        orderBy: { purchasedAt: 'desc' },
    });
    return c.json({ books: booksList });
});

// GET /api/books
books.get('/', async (c) => {
    const { keyword, purchased_from, purchased_to, page, per_page } = c.req.query();
    const parsedPage = page ? parseInt(page, 10) : 1;
    const parsedPerPage = per_page ? parseInt(per_page, 10) : 10;
    const purchasedFrom = purchased_from || '2000-01-01';
    const purchasedTo = purchased_to || '2099-12-31';

    // バリデーション
    if (purchased_from && !isValidDateFormat(purchased_from)) {
        return c.json({ message: 'purchased_from is invalid format' }, 400);
    }
    if (purchased_to && !isValidDateFormat(purchased_to)) {
        return c.json({ message: 'purchased_to is invalid format' }, 400);
    }
    if (page && !isWithinRange(parsedPage, 1, 1000)) {
        return c.json({ message: 'page must be between 1 and 1000' }, 400);
    }
    if (per_page && !isWithinRange(parsedPerPage, 1, 100)) {
        return c.json({ message: 'per_page must be between 1 and 100' }, 400);
    }

    const where: any = {
        AND: [
            keyword
                ? {
                      OR: [
                          { title: { contains: keyword } },
                          { author: { contains: keyword } },
                          { memo: { contains: keyword } },
                          { registeredBy: { contains: keyword } },
                      ],
                  }
                : undefined,
            { purchasedAt: { gte: new Date(purchasedFrom) } },
            { purchasedAt: { lte: new Date(purchasedTo) } },
        ].filter(Boolean),
    };

    const [booksList, total] = await Promise.all([
        prisma.book.findMany({
            where,
            orderBy: { purchasedAt: 'desc' },
            skip: (parsedPage - 1) * parsedPerPage,
            take: parsedPerPage,
        }),
        prisma.book.count({ where }),
    ]);

    return c.json({
        books: booksList,
        total,
        page: parsedPage,
        per_page: parsedPerPage,
    });
});

export default books
