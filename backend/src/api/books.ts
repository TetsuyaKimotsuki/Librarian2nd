import { PrismaClient } from '@prisma/client'
import { Hono } from 'hono'
import { z, ZodError } from 'zod'
import { jwtGuardian } from '../middleware/guardian.js'
import { paramValidation } from '../middleware/validation.js'
import { isValidDateFormat } from '../tools/validator.js'

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

// POST /api/books
const postBookSchema = z.object({
    title: z.string().min(1, 'titleは必須です').max(255),
    author: z.string().min(1, 'authorは必須です').max(255),
    isbn: z.string().regex(/^[0-9\-]+$/, 'isbnは数字とハイフンのみ').max(32).optional().or(z.literal('').transform(() => undefined)),
    location: z.string().max(255).optional(),
    memo: z.string().optional(),
    purchasedAt: z.string().optional(),
})
books.post('/', paramValidation(['title', 'author']), async (c) => {
    try {
        const body = await c.req.json()
        // Zodバリデーション
        const parsed = postBookSchema.parse(body)
        // purchasedAtのバリデーション
        let purchasedAt = parsed.purchasedAt || '2000-01-01'
        if (purchasedAt && !isValidDateFormat(purchasedAt)) {
            return c.json({ message: 'purchasedAtはYYYY-MM-DD形式で指定してください' }, 400)
        }
        // 日付の論理チェック
        const dateObj = new Date(purchasedAt)
        if (isNaN(dateObj.getTime())) {
            return c.json({ message: 'purchasedAtが不正な日付です' }, 400)
        }
        // 登録者email
        const user = c.get('user')
        // 登録
        const book = await prisma.book.create({
            data: {
                title: parsed.title,
                author: parsed.author,
                isbn: parsed.isbn || undefined,
                location: parsed.location || undefined,
                memo: parsed.memo || undefined,
                purchasedAt: dateObj,
                registeredBy: user.email,
            }
        })
        // 日付をYYYY-MM-DDで返すよう整形
        const bookJson = {
            ...book,
            purchasedAt: book.purchasedAt ? book.purchasedAt.toISOString().slice(0, 10) : undefined
        }
        return c.json({ book: bookJson })
    } catch (error) {
        if (error instanceof ZodError) {
            const msg = error.errors.map(e => `${e.path[0]}: ${e.message}`).join(', ')
            return c.json({ message: msg }, 400)
        }
        return c.json({ message: 'Internal Server Error' }, 500)
    }
})

export default books
