// バリデーション共通化ヘルパー
import type { Context } from 'hono';

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

/**
 * 日付形式のチェック
 * @param dateString チェックする日付文字列
 * @returns {boolean} 有効な日付形式の場合はtrue
 */
export function isValidDateFormat(dateString: string): boolean {
    if (!/^\d{4}-\d{2}-\d{2}$/.test(dateString)) {
        return false;
    }
    const date = new Date(dateString);
    if (isNaN(date.getTime())) {
        return false;
    }
    return date.toISOString().slice(0, 10) === dateString;
}

/**
 * 数値範囲のチェック
 * @param value チェックする数値
 * @param min 最小値
 * @param max 最大値
 * @returns {boolean} 数値が範囲内の場合はtrue
 */
export function isWithinRange(value: number, min: number, max: number): boolean {
    return value >= min && value <= max;
}
