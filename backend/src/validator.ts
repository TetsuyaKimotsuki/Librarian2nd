// バリデーション共通化ヘルパー
import type { Context } from 'hono'

/**
 * 必須パラメータの存在チェック
 * @param c HonoのContext
 * @param fields チェックするフィールド名配列
 * @returns { [boolean, string[]] } [true:OK/false:NG, 欠落フィールド配列]
 */
export async function requireFields(c: Context, fields: string[]): Promise<[boolean, string[]]> {
    const body = await c.req.json()
    const missing = fields.filter(f => body[f] === undefined || body[f] === null)
    return [missing.length === 0, missing]
}
