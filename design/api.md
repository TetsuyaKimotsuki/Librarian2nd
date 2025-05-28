## POST /api/auth/login

#### 概要
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
```yaml
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
    "email": "user@example.com",
    "name": "山田 太郎"
  }
}
```

#### レスポンス（失敗時）
- 共通エラーハンドリング仕様を参照 ([400](#400-bad-request))

#### 備考
- ハッシュ化して保存されたパスワードと突き合わせます
- JWTの有効期限は1時間
- レスポンスのuser情報は今後拡張の可能性あり

---

## GET /api/auth/me

#### 概要
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
```yaml
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
- 共通エラーハンドリング仕様を参照 ([401](#401-unauthorized))

#### 備考
- JWTトークンの有効性を検証するために使用できます
- ユーザー情報の項目は今後拡張の可能性あり

---

## GET /api/books/all

#### 概要
書籍一覧を無条件に全件取得する。

#### リクエストヘッダ
Authorization: Bearer [JWTトークン]

#### パスパラメータ
なし

#### クエリパラメータ
なし

#### リクエストボディ
なし

#### リクエスト例
```yaml
GET /api/books/all
Authorization: Bearer xxxxx.yyyyy.zzzzz
```

#### レスポンス（成功時）
```json
{
  "books": [
    {
      "id": "b1a2c3d4-...",
      "title": "リーダブルコード",
      "author": "ダスティン・ボズウェル",
      "isbn": "978-4873115658",
      "location": "3F 技術書棚",
      "memo": "2024年度新刊\n技術書",
      "purchasedAt": "2024-04-01",
      "registeredBy": "user1@example.com",
      "updatedAt": "2024-05-22T10:00:00Z"
    }
    // ...
  ]
}
```

#### レスポンス（失敗時）
- 共通エラーハンドリング仕様を参照（[401](#401-unauthorized)）

#### 備考
- 認証必須（JWTトークン）

---

## GET /api/books

#### 概要
検索条件にヒットする書籍一覧を取得する。
ページ番号と、ページサイズの指定により、ページネーションが可能。

#### リクエストヘッダ
Authorization: Bearer [JWTトークン]

#### パスパラメータ
なし

#### クエリパラメータ
- keyword: キーワード検索（タイトル、著者名、備考、購入者のemail/nameへの部分一致）
- purchased_from: 購入日の開始日（YYYY-MM-DD形式、デフォルト: 2000-01-01）
- purchased_to: 購入日の終了日（YYYY-MM-DD形式、デフォルト: 2099-12-31）
- page: ページ番号（デフォルトは1）
- per_page: 1ページあたりの表示件数（デフォルトは10）

#### リクエストボディ
なし

#### リクエスト例
```yaml
GET /api/books?keyword=リーダブル&purchased_from=2024-01-01&purchased_to=2024-12-31&page=1&per_page=10
Authorization: Bearer xxxxx.yyyyy.zzzzz
```

#### レスポンス（成功時）
```json
{
  "books": [
    {
      "id": "b1a2c3d4-...",
      "title": "リーダブルコード",
      "author": "ダスティン・ボズウェル",
      "isbn": "978-4873115658",
      "location": "3F 技術書棚",
      "memo": "2024年度新刊\n技術書",
      "purchasedAt": "2024-04-01",
      "registeredBy": "user1@example.com",
      "updatedAt": "2024-05-22T10:00:00Z"
    }
    // ...
  ],
  "total": 100, // 検索結果の総件数
  "page": 1, // 取得したページ番号
  "per_page": 10 // ページに含まれる件数
}
```

#### レスポンス（失敗時）
- 共通エラーハンドリング仕様を参照（[400](#400-bad-request), [401](#401-unauthorized)）
- purchased_from > purchased_to の場合は 400 Bad Request を返却し、`message` フィールドで理由を返す

#### 備考
- 認証必須（JWTトークン）
- purchasedAtの降順で並びます

---

## POST /api/books

#### 概要
新しい書籍情報を登録する。

#### リクエストヘッダ
Authorization: Bearer [JWTトークン]

#### パスパラメータ
なし

#### クエリパラメータ
なし

#### リクエストボディ
| パラメータ     | 型      | 必須 | 制約・バリデーション例           | 説明                |
|----------------|---------|------|----------------------------------|---------------------|
| title          | string  | ○    | 最大255文字                      | 書籍タイトル        |
| author         | string  | ○    | 最大255文字                      | 著者名              |
| isbn           | string  |      | ISBN-10またはISBN-13形式         | ISBN                |
| location       | string  |      | 最大255文字                      | 保管場所            |
| memo           | string  |      | 最大1000文字                     | 備考・メモ          |
| purchasedAt    | string  |      | YYYY-MM-DD形式                   | 購入日（省略時は2000-01-01）|

#### リクエスト例
```yaml
POST /api/books
Authorization: Bearer xxxxx.yyyyy.zzzzz
{
  "title": "リーダブルコード",
  "author": "ダスティン・ボズウェル",
  "isbn": "978-4873115658",
  "location": "3F 技術書棚",
  "memo": "2024年度新刊 技術書",
  "purchasedAt": "2024-04-01"
}
```

#### レスポンス（成功時）
```json
{
  "book": {
    "id": "b1a2c3d4-...",
    "title": "リーダブルコード",
    "author": "ダスティン・ボズウェル",
    "isbn": "978-4873115658",
    "location": "3F 技術書棚",
    "memo": "2024年度新刊 技術書",
    "purchasedAt": "2024-04-01",
    "registeredBy": "user1@example.com",
    "updatedAt": "2025-05-27T10:00:00Z"
  }
}
```

#### レスポンス（失敗時）
- 共通エラーハンドリング仕様を参照（[400](#400-bad-request), [401](#401-unauthorized)）

#### 備考
- 認証必須（JWTトークン）
- 登録者（registeredBy）は認証ユーザーのemailで自動設定
- purchasedAt未指定時は「2000-01-01」として登録

---

## PUT /api/books/{bookId}

#### 概要
指定した書籍IDの書籍情報を編集（更新）する。

#### リクエストヘッダ
Authorization: Bearer [JWTトークン]

#### パスパラメータ
- bookId: string（UUID形式、必須）

#### クエリパラメータ
なし

#### リクエストボディ
| パラメータ     | 型      | 必須 | 制約・バリデーション例           | 説明                |
|----------------|---------|------|----------------------------------|---------------------|
| title          | string  | ○    | 最大255文字                      | 書籍タイトル        |
| author         | string  | ○    | 最大255文字                      | 著者名              |
| isbn           | string  |      | ISBN-10またはISBN-13形式         | ISBN                |
| location       | string  |      | 最大255文字                      | 保管場所            |
| memo           | string  |      | 最大1000文字                     | 備考・メモ          |
| purchasedAt    | string  |      | YYYY-MM-DD形式                   | 購入日（省略時は2000-01-01）|

#### リクエスト例
```yaml
PUT /api/books/b1a2c3d4-...
Authorization: Bearer xxxxx.yyyyy.zzzzz
{
  "title": "リーダブルコード",
  "author": "ダスティン・ボズウェル",
  "isbn": "978-4873115658",
  "location": "3F 技術書棚",
  "memo": "2024年度新刊 技術書",
  "purchasedAt": "2024-04-01"
}
```

#### レスポンス（成功時）
```json
{
  "book": {
    "id": "b1a2c3d4-...",
    "title": "リーダブルコード",
    "author": "ダスティン・ボズウェル",
    "isbn": "978-4873115658",
    "location": "3F 技術書棚",
    "memo": "2024年度新刊 技術書",
    "purchasedAt": "2024-04-01",
    "registeredBy": "user1@example.com",
    "updatedAt": "2025-05-28T10:00:00Z"
  }
}
```

#### レスポンス（失敗時）
- 共通エラーハンドリング仕様を参照（[400](#400-bad-request), [401](#401-unauthorized)）
- 指定したbookIdが存在しない場合は404 Not Foundを返却し、`message`フィールドで理由を返す

#### 備考
- 認証必須（JWTトークン）
- updatedAtは自動的に現在時刻で更新される
- registeredByは変更不可

---

## GET /api/books/{bookId}

#### 概要
指定した書籍IDの書籍情報（詳細）を取得する。

#### リクエストヘッダ
Authorization: Bearer [JWTトークン]

#### パスパラメータ
- bookId: string（UUID形式、必須）

#### クエリパラメータ
なし

#### リクエストボディ
なし

#### リクエスト例
```yaml
GET /api/books/b1a2c3d4-...
Authorization: Bearer xxxxx.yyyyy.zzzzz
```

#### レスポンス（成功時）
```json
{
  "book": {
    "id": "b1a2c3d4-...",
    "title": "リーダブルコード",
    "author": "ダスティン・ボズウェル",
    "isbn": "978-4873115658",
    "location": "3F 技術書棚",
    "memo": "2024年度新刊 技術書",
    "purchasedAt": "2024-04-01",
    "registeredBy": "user1@example.com",
    "updatedAt": "2025-05-28T10:00:00Z"
  }
}
```

#### レスポンス（失敗時）
- 共通エラーハンドリング仕様を参照（[400](#400-bad-request), [401](#401-unauthorized)）
- 指定したbookIdが存在しない場合は404 Not Foundを返却し、`message`フィールドで理由を返す

#### 備考
- 認証必須（JWTトークン）

---

## DELETE /api/books/{bookId}

#### 概要
指定した書籍IDの書籍情報を削除する。

#### リクエストヘッダ
Authorization: Bearer [JWTトークン]

#### パスパラメータ
- bookId: string（UUID形式、必須）

#### クエリパラメータ
なし

#### リクエストボディ
なし

#### リクエスト例
```yaml
DELETE /api/books/b1a2c3d4-...
Authorization: Bearer xxxxx.yyyyy.zzzzz
```

#### レスポンス（成功時）
```json
{
  "message": "deleted"
}
```

#### レスポンス（失敗時）
- 共通エラーハンドリング仕様を参照（[400](#400-bad-request), [401](#401-unauthorized)）
- 指定したbookIdが存在しない場合は404 Not Foundを返却し、`message`フィールドで理由を返す

#### 備考
- 認証必須（JWTトークン）

---

## 共通エラーハンドリング

本API群では、以下のエラー応答を全APIで共通的に返す場合があります。

### 400 Bad Request
- 必須パラメータ不足、バリデーションエラー等のリクエスト不備時
- レスポンス例:
```json
{
  "message": "email, passwordは必須です"
}
```

### 401 Unauthorized
- 認証失敗、トークン不正・期限切れ等

### 500 Internal Server Error
- サーバー側の予期せぬエラー時
- レスポンス例:
```json
{
  "message": "Internal Server Error"
}
```

### 備考
- 400エラーの詳細メッセージはAPIごとに異なる場合がありますが、原則として `message` フィールドで返却します。
- これらの共通エラーは各API仕様の「失敗時」欄には省略する場合があります。
