## POST /api/auth/login

### 概要
ユーザーのログイン認証を行い、JWTトークンを発行する。

#### リクエストヘッダ
なし

#### パスパラメータ
なし

#### クエリパラメータ
なし

#### リクエストボディ
| パラメータ | 型     | 必須 | 制約・バリデーション例         | 説明                |
|------------|--------|------|-------------------------------|---------------------|
| email      | string | ○    | Email形式、最大255文字         | ユーザーのメールアドレス |
| password   | string | ○    | 8～64文字、英数字記号混在可     | パスワード          |

#### リクエスト例
```json
GET /api/auth/login
{
  "email": "user@example.com",
  "password": "password123"
}
```

#### レスポンス（成功時）
```json
{
  "token": "xxxxx.yyyyy.zzzzz",
  "user": {
    "id": 1,
    "email": "user@example.com",
    "name": "山田 太郎"
  }
}
```

#### レスポンス（失敗時）
- 401 Unauthorized

#### 備考
- ハッシュ化して保存されたパスワードと突き合わせます
- JWTの有効期限は1時間
- レスポンスのuser情報は今後拡張の可能性あり

---

## GET /api/auth/me

### 概要
現在の認証ユーザー情報を取得する。

#### リクエストヘッダ
Authorization: Bearer [JWTトークン]

#### パスパラメータ
なし

#### クエリパラメータ
なし

#### リクエストボディ
なし

#### リクエスト例
```json
GET /api/auth/me
Authorization: Bearer xxxxx.yyyyy.zzzzz
```

#### レスポンス（成功時）
```json
{
  "id": 1,
  "email": "user@example.com",
  "name": "山田 太郎"
}
```

#### レスポンス（失敗時）
- 401 Unauthorized

#### 備考
- JWTトークンの有効性を検証するために使用できます
- ユーザー情報の項目は今後拡張の可能性あり
