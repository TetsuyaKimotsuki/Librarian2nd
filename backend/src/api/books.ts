import { PrismaClient } from '@prisma/client'
import { Hono } from 'hono'
import { z, ZodError } from 'zod'
import { jwtGuardian } from '../middleware/guardian.js'

const prisma = new PrismaClient()
const books = new Hono()
books.use('*', jwtGuardian)

// GET /api/books/all
books.get('/all', async (c) => {
    // 認証済みユーザー情報はc.get('user')で取得可能
    // 書籍一覧取得
    const booksList = await prisma.book.findMany({
        orderBy: { purchasedAt: 'desc' },
    })
    return c.json({ books: booksList })
})

// GET /api/books
const bookSearchSchema = z.object({
    keyword: z.string().optional(),
    purchased_from: z.coerce.date().optional().nullable().default(new Date('2000-01-01')),
    purchased_to: z.coerce.date().optional().nullable().default(new Date('2099-12-31')),
    page: z.coerce.number().int().min(1).max(1000).optional().default(1),
    per_page: z.coerce.number().int().min(1).max(100).optional().default(10),
}).refine(
    (data) => !data.purchased_from || !data.purchased_to || data.purchased_from <= data.purchased_to,
    {
        message: 'purchased_fromはpurchased_to以前の日付を指定してください', path: ['purchased_from'],
    }
)
books.get('/', async (c) => {
    try {
        const query = bookSearchSchema.parse(c.req.query())
        const { keyword, purchased_from, purchased_to, page, per_page } = query

        const where: any = {
            AND: [
                keyword
                    ? {
                        OR: [
                            { title: { contains: keyword } },
                            { author: { contains: keyword } },
                            { memo: { contains: keyword } },
                            // registeredBy（email）部分一致
                            { registeredBy: { contains: keyword } },
                            // User.name部分一致（リレーション検索）
                            { user: { name: { contains: keyword } } },
                        ],
                    }
                    : undefined,
                { purchasedAt: { gte: purchased_from } },
                { purchasedAt: { lte: purchased_to } },
            ].filter(Boolean),
        }

        const [booksList, total] = await Promise.all([
            prisma.book.findMany({
                where,
                orderBy: { purchasedAt: 'desc' },
                skip: (page - 1) * per_page,
                take: per_page,
            }),
            prisma.book.count({ where }),
        ])

        return c.json({
            books: booksList,
            total,
            page,
            per_page,
        })
    } catch (error) {
        if (error instanceof ZodError) {
            return c.json({ message: error.errors }, 400)
        }
        return c.json({ message: 'Internal Server Error' }, 500)
    }
})

export default books
