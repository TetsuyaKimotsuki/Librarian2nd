import { Hono } from 'hono'
import { z } from 'zod'
import prisma from '../../prisma/client.js'
import { jwtGuardian, roleGuardian } from '../middleware/guardian.js'

const books = new Hono()
books.use('*', jwtGuardian)

// GET /api/books/all
books.get('/all', async (c) => {
    // 認証済みユーザー情報はc.get('user')で取得可能
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
})

// POST/PUT /api/books のリクエストスキーマが共通なので一本化
const pushBookSchema = z.object({
    title: z.string().min(1, 'titleは必須です').max(255),
    author: z.string().min(1, 'authorは必須です').max(255),
    isbn: z.string().regex(/^[0-9\-]+$/, 'isbnは数字とハイフンのみ').max(32).optional().or(z.literal('').transform(() => undefined)),
    location: z.string().max(255).optional(),
    memo: z.string().optional(),
    purchasedAt: z.string().optional().default('2000-01-01')
        .refine(
            (val) => !val || /^\d{4}-\d{2}-\d{2}$/.test(val),
            { message: 'purchasedAtはYYYY-MM-DD形式で指定してください' }
        )
        .refine(
            (val) => {
                const date = new Date(val);
                return !isNaN(date.getTime()) && date.toISOString().slice(0, 10) === val;
            },
            { message: 'purchasedAtが不正な日付です' }
        ),
})

// POST /api/books
books.post('/', async (c) => {
    const body = await c.req.json()
    const parsed = pushBookSchema.parse(body)
    const user = c.get('user')
    const book = await prisma.book.create({
        data: {
            title: parsed.title,
            author: parsed.author,
            isbn: parsed.isbn || undefined,
            location: parsed.location || undefined,
            memo: parsed.memo || undefined,
            purchasedAt: new Date(parsed.purchasedAt),
            registeredBy: user.email,
        }
    })
    const bookJson = {
        ...book,
        purchasedAt: book.purchasedAt!.toISOString().slice(0, 10)
    }
    return c.json({ book: bookJson })
})

// PUT /api/books/:bookId
books.put('/:bookId', async (c) => {
    const { bookId } = c.req.param()
    // UUID形式バリデーションを追加
    const uuidSchema = z.string().uuid({ message: 'bookIdはUUID形式で指定してください' })
    uuidSchema.parse(bookId)
    const body = await c.req.json()
    const parsed = pushBookSchema.parse(body)
    const existing = await prisma.book.findUnique({ where: { id: bookId } })
    if (!existing) {
        return c.json({ message: 'Not Found' }, 404)
    }
    const updated = await prisma.book.update({
        where: { id: bookId },
        data: {
            title: parsed.title,
            author: parsed.author,
            isbn: parsed.isbn || undefined,
            location: parsed.location || undefined,
            memo: parsed.memo || undefined,
            purchasedAt: new Date(parsed.purchasedAt),
            updatedAt: new Date(),
        }
    })
    const bookJson = {
        ...updated,
        purchasedAt: updated.purchasedAt?.toISOString().slice(0, 10)
    }
    return c.json({ book: bookJson })
})

// GET /api/books/:bookId
books.get('/:bookId', async (c) => {
    // UUID形式バリデーション
    const { bookId } = c.req.param()
    const uuidSchema = z.string().uuid({ message: 'bookIdはUUID形式で指定してください' })
    uuidSchema.parse(bookId)
    // 取得
    const book = await prisma.book.findUnique({ where: { id: bookId } })
    if (!book) {
        return c.json({ message: 'Not Found' }, 404)
    }
    // purchasedAtをYYYY-MM-DD形式で返す
    const bookJson = {
        ...book,
        purchasedAt: book.purchasedAt?.toISOString().slice(0, 10)
    }
    return c.json({ book: bookJson })
})

// DELETE /api/books/:bookId
books.delete('/:bookId', roleGuardian(['admin']), async (c) => {
    const { bookId } = c.req.param()
    const uuidSchema = z.string().uuid({ message: 'bookIdはUUID形式で指定してください' })
    uuidSchema.parse(bookId)
    // 既存チェック
    const existing = await prisma.book.findUnique({ where: { id: bookId } })
    if (!existing) {
        return c.json({ message: 'Not Found' }, 404)
    }
    await prisma.book.delete({ where: { id: bookId } })
    return c.json({ message: 'deleted' })
})

export default books
