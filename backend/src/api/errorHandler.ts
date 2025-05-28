import type { Context } from 'hono'
import { ZodError } from 'zod'

export function errorHandler(err: unknown, c: Context) {
    // バリデーションエラーは400
    if (err instanceof ZodError) {
        const msg = err.errors.map(e => `${e.path[0]}: ${e.message}`).join(', ')
        return c.json({ message: msg }, 400)
    }
    // 予期せぬエラーは500
    console.error(`予期せぬエラー：${err}`)
    return c.json({ message: 'Internal Server Error' }, 500)
}
