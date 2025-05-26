import type { MiddlewareHandler } from 'hono';
import { requireFields } from '../tools/validator.js';

/**
 * バリデーションミドルウェア
 * - リクエストボディの必須フィールドをチェック
 * - 失敗時: 400 Bad Request
 */
export const paramValidation = (fields: string[]): MiddlewareHandler => async (c, next) => {
  const [isValid, missingFields] = await requireFields(c, fields);
  if (!isValid) {
    return c.json(
      { message: `${missingFields.join(', ')} は必須です` },
      400
    );
  }
  await next();
};
