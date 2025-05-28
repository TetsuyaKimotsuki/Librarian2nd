import { afterAll, beforeAll, describe, expect, it } from 'vitest'
import prisma from '../prisma/client.js'
import { app } from '../src/index.js'

// テスト用ユーザー情報
const validUser = {
    email: 'hanako.suzuki@sigo-ri.co.jp',
    password: 'hanako123',
    name: '鈴木 花子'
}

// JWT取得用のヘルパー
async function getToken() {
    const req = new Request('http://localhost/api/auth/login', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
            email: validUser.email,
            password: validUser.password
        })
    })
    const res = await app.fetch(req)
    const body = await res.json()
    return body.token
}

describe('GET /api/books/all', () => {
    it('認証ヘッダがない場合は401を返す', async () => {
        const req = new Request('http://localhost/api/books/all', {
            method: 'GET'
        })
        const res = await app.fetch(req)
        expect(res.status).toBe(401)
    })

    it('不正なトークンの場合は401を返す', async () => {
        const req = new Request('http://localhost/api/books/all', {
            method: 'GET',
            headers: { 'Authorization': 'Bearer invalidtoken' }
        })
        const res = await app.fetch(req)
        expect(res.status).toBe(401)
    })

    it('正しいトークンの場合は書籍一覧を返す', async () => {
        const token = await getToken()
        const req = new Request('http://localhost/api/books/all', {
            method: 'GET',
            headers: { 'Authorization': `Bearer ${token}` }
        })
        const res = await app.fetch(req)
        expect(res.status).toBe(200)
        const body = await res.json()
        expect(Array.isArray(body.books)).toBe(true)
        expect(body.books.length).toBe(30)
        expect(body.books[0]).toHaveProperty('title')
        expect(body.books[0]).toHaveProperty('author')
        expect(body.books[0]).toHaveProperty('isbn')
        expect(body.books[0]).toHaveProperty('location')
        expect(body.books[0]).toHaveProperty('memo')
        expect(body.books[0]).toHaveProperty('purchasedAt')
        expect(body.books[0]).toHaveProperty('registeredBy')
    })
})

describe('GET /api/books', () => {
    let token: string
    beforeAll(async () => {
        token = await getToken()
    })

    // --- 正常系 ---
    it('キーワード検索（keywordパラメータ）で部分一致する書籍のみ返す', async () => {
        const req = new Request('http://localhost/api/books?keyword=山田', {
            method: 'GET',
            headers: { 'Authorization': `Bearer ${token}` }
        })
        const res = await app.fetch(req)
        expect(res.status).toBe(200)
        const body = await res.json()
        expect(Array.isArray(body.books)).toBe(true)
        expect(body.books.length).toBeGreaterThan(0)
        for (const book of body.books) {
            expect(
                book.title.includes('山田') ||
                book.author.includes('山田') ||
                book.memo.includes('山田') ||
                book.registeredBy === 'taro.yamada@sigo-ri.co.jp' // registeredByから「山田 太郎」を引ける場合はこうなるはず
            ).toBe(true)
        }
    })

    it('キーワードが空文字の場合は全件返す', async () => {
        const req = new Request('http://localhost/api/books?per_page=100&keyword=', {
            method: 'GET',
            headers: { 'Authorization': `Bearer ${token}` }
        })
        const res = await app.fetch(req)
        expect(res.status).toBe(200)
        const body = await res.json()
        expect(Array.isArray(body.books)).toBe(true)
        expect(body.total).toBe(body.books.length)
    })

    it('購入日from-to検索（purchased_from, purchased_to）で範囲内のみ返す', async () => {
        const req = new Request('http://localhost/api/books?purchased_from=2024-04-01&purchased_to=2024-04-30', {
            method: 'GET',
            headers: { 'Authorization': `Bearer ${token}` }
        })
        const res = await app.fetch(req)
        expect(res.status).toBe(200)
        const body = await res.json()
        for (const book of body.books) {
            expect(book.purchasedAt >= '2024-04-01').toBe(true)
            expect(book.purchasedAt <= '2024-04-30').toBe(true)
        }
    })

    it('全パラメータ省略時はデフォルト値で正常に返す', async () => {
        const req = new Request('http://localhost/api/books', {
            method: 'GET',
            headers: { 'Authorization': `Bearer ${token}` }
        })
        const res = await app.fetch(req)
        expect(res.status).toBe(200)
        const body = await res.json()
        expect(body.page).toBe(1)
        expect(body.per_page).toBe(10)
        expect(Array.isArray(body.books)).toBe(true)
    })

    it('ページング指定時に正しい件数・ページ番号・per_pageが返る', async () => {
        const req = new Request('http://localhost/api/books?page=2&per_page=5', {
            method: 'GET',
            headers: { 'Authorization': `Bearer ${token}` }
        })
        const res = await app.fetch(req)
        expect(res.status).toBe(200)
        const body = await res.json()
        expect(body.page).toBe(2)
        expect(body.per_page).toBe(5)
        expect(body.books.length).toBeLessThanOrEqual(5)
    })

    it('検索条件に一致しない場合は空リストを返す', async () => {
        const req = new Request('http://localhost/api/books?keyword=存在しないキーワード', {
            method: 'GET',
            headers: { 'Authorization': `Bearer ${token}` }
        })
        const res = await app.fetch(req)
        expect(res.status).toBe(200)
        const body = await res.json()
        expect(Array.isArray(body.books)).toBe(true)
        expect(body.books.length).toBe(0)
        expect(body.total).toBe(0)
    })

    it('購入日範囲指定なしの場合は全期間が対象になる', async () => {
        const req = new Request('http://localhost/api/books', {
            method: 'GET',
            headers: { 'Authorization': `Bearer ${token}` }
        })
        const res = await app.fetch(req)
        expect(res.status).toBe(200)
        const body = await res.json()
        // purchasedAtが2000-01-01～2099-12-31の範囲内
        for (const book of body.books) {
            expect(book.purchasedAt >= '2000-01-01').toBe(true)
            expect(book.purchasedAt <= '2099-12-31').toBe(true)
        }
    })

    it('レスポンスのbooks配列に必要なプロパティが全て含まれる', async () => {
        const req = new Request('http://localhost/api/books', {
            method: 'GET',
            headers: { 'Authorization': `Bearer ${token}` }
        })
        const res = await app.fetch(req)
        expect(res.status).toBe(200)
        const body = await res.json()
        for (const book of body.books) {
            expect(book).toHaveProperty('id')
            expect(book).toHaveProperty('title')
            expect(book).toHaveProperty('author')
            expect(book).toHaveProperty('isbn')
            expect(book).toHaveProperty('location')
            expect(book).toHaveProperty('memo')
            expect(book).toHaveProperty('purchasedAt')
            expect(book).toHaveProperty('registeredBy')
            expect(book).toHaveProperty('updatedAt')
        }
    })

    it('total, page, per_pageが正しく返る', async () => {
        const req = new Request('http://localhost/api/books?page=1&per_page=3', {
            method: 'GET',
            headers: { 'Authorization': `Bearer ${token}` }
        })
        const res = await app.fetch(req)
        expect(res.status).toBe(200)
        const body = await res.json()
        expect(typeof body.total).toBe('number')
        expect(body.page).toBe(1)
        expect(body.per_page).toBe(3)
    })

    // --- 異常系 ---
    const invalidParams = [
        // purchased_from, purchased_to
        { name: 'purchased_fromがYYYY-MM-DD形式でない場合は400を返す', qs: 'purchased_from=20240401', msg: 'purchased_from' },
        { name: 'purchased_toがYYYY-MM-DD形式でない場合は400を返す', qs: 'purchased_to=20240401', msg: 'purchased_to' },
        { name: 'purchased_fromが不正な日付の場合は400を返す', qs: `purchased_from=2099-13-31`, msg: 'purchased_from' },
        { name: 'purchased_toが不正な日付の場合は400を返す', qs: `purchased_to=2000-01-00`, msg: 'purchased_to' },
        { name: 'purchased_from > purchased_to の場合は400を返す', qs: 'purchased_from=2024-05-01&purchased_to=2024-04-01', msg: 'purchased_from' },
        // page
        { name: 'pageが1未満の場合は400を返す', qs: 'page=0', msg: 'page' },
        { name: 'pageが数値でない場合は400を返す', qs: 'page=abc', msg: 'page' },
        { name: 'pageが小数の場合は400を返す', qs: 'page=1.5', msg: 'page' },
        { name: 'pageが1000を超える場合は400を返す', qs: 'page=1001', msg: 'page' },
        // per_page
        { name: 'per_pageが1未満の場合は400を返す', qs: 'per_page=0', msg: 'per_page' },
        { name: 'per_pageが数値でない場合は400を返す', qs: 'per_page=abc', msg: 'per_page' },
        { name: 'per_pageが小数の場合は400を返す', qs: 'per_page=2.5', msg: 'per_page' },
        { name: 'per_pageが100を超える場合は400を返す', qs: 'per_page=101', msg: 'per_page' },
    ]

    it.each(invalidParams)('$name', async ({ qs, msg }) => {
        const req = new Request(`http://localhost/api/books?${qs}`, {
            method: 'GET',
            headers: { 'Authorization': `Bearer ${token}` }
        })
        const res = await app.fetch(req)
        expect(res.status).toBe(400)
        const body = await res.json()
        expect(body).toHaveProperty('message')
        expect(JSON.stringify(body.message)).toContain(msg)
    })
})

describe('POST /api/books', () => {
    let token: string
    beforeAll(async () => {
        token = await getToken()
    })

    // vitestの同じテストファイル内のテストは、シングルスレッドで上から順番（記述順）に実行される、とのこと
    // なので生成された書籍データのidを保持しておいて、afterAllで削除することで、DB状態を維持します
    const createdBookIds: string[] = [];

    // POST /api/books用の共通リクエスト生成関数
    function makePostBookRequest(token: string, body: any) {
        return new Request('http://localhost/api/books', {
            method: 'POST',
            headers: {
                'Authorization': `Bearer ${token}`,
                'Content-Type': 'application/json'
            },
            body: JSON.stringify(body)
        })
    }

    // --- 正常系 ---
    it('必須項目のみ指定で登録できる', async () => {
        const req = makePostBookRequest(token, {
            title: 'テストタイトル',
            author: 'テスト著者'
        })
        const res = await app.fetch(req)
        expect(res.status).toBe(200)
        const body = await res.json()
        expect(body.book).toHaveProperty('id')
        expect(body.book.title).toBe('テストタイトル')
        expect(body.book.author).toBe('テスト著者')
        expect(body.book.purchasedAt).toBe('2000-01-01')
        expect(body.book.registeredBy).toBe(validUser.email)
        expect(body.book).toHaveProperty('updatedAt')
        createdBookIds.push(body.book.id)
    })

    it('全項目指定で登録できる', async () => {
        const req = makePostBookRequest(token, {
            title: '完全指定タイトル',
            author: '完全指定著者',
            isbn: '978-1234567890',
            location: '1F 棚',
            memo: '改行\nテスト',
            purchasedAt: '2024-05-27'
        })
        const res = await app.fetch(req)
        expect(res.status).toBe(200)
        const body = await res.json()
        expect(body.book.title).toBe('完全指定タイトル')
        expect(body.book.author).toBe('完全指定著者')
        expect(body.book.isbn).toBe('978-1234567890')
        expect(body.book.location).toBe('1F 棚')
        expect(body.book.memo).toBe('改行\nテスト')
        expect(body.book.purchasedAt).toBe('2024-05-27')
        createdBookIds.push(body.book.id)
    })

    it('isbnに数字のみ/数字+ハイフンで登録できる', async () => {
        const validIsbns = ['9781234567890', '978-1-2345-6789-0']
        for (const isbn of validIsbns) {
            const req = makePostBookRequest(token, {
                title: 'isbnテスト',
                author: '著者',
                isbn
            })
            const res = await app.fetch(req)
            expect(res.status).toBe(200)
            const body = await res.json()
            expect(body.book.isbn).toBe(isbn)
            createdBookIds.push(body.book.id)
        }
    })

    it('memoに改行や長文を指定して登録できる', async () => {
        const longMemo = 'a'.repeat(1000) + '\n改行テスト'
        const req = makePostBookRequest(token, {
            title: 'memo長文',
            author: '著者',
            memo: longMemo
        })
        const res = await app.fetch(req)
        expect(res.status).toBe(200)
        const body = await res.json()
        expect(body.book.memo).toBe(longMemo)
        createdBookIds.push(body.book.id)
    })

    // --- 異常系 ---
    const invalidCases = [
        { name: 'title未指定', body: { author: 'a' }, msg: 'title' },
        { name: 'author未指定', body: { title: 'a' }, msg: 'author' },
        { name: 'titleが空文字', body: { title: '', author: 'a' }, msg: 'title' },
        { name: 'authorが空文字', body: { title: 'a', author: '' }, msg: 'author' },
        { name: 'titleが256文字以上', body: { title: 'a'.repeat(256), author: 'a' }, msg: 'title' },
        { name: 'authorが256文字以上', body: { title: 'a', author: 'a'.repeat(256) }, msg: 'author' },
        { name: 'isbnに数字・ハイフン以外が含まれる', body: { title: 'a', author: 'a', isbn: '978-abc-123' }, msg: 'isbn' },
        { name: 'locationが256文字以上', body: { title: 'a', author: 'a', location: 'a'.repeat(256) }, msg: 'location' },
        { name: 'purchasedAtがYYYY-MM-DD形式でない', body: { title: 'a', author: 'a', purchasedAt: '20240527' }, msg: 'purchasedAt' },
        { name: 'purchasedAtが不正な日付', body: { title: 'a', author: 'a', purchasedAt: '2024-02-30' }, msg: 'purchasedAt' },
    ]
    it.each(invalidCases)('$name', async ({ body, msg }) => {
        const req = makePostBookRequest(token, body)
        const res = await app.fetch(req)
        expect(res.status).toBe(400)
        const resBody = await res.json()
        expect(resBody).toHaveProperty('message')
        expect(JSON.stringify(resBody.message)).toContain(msg)
    })

    // --- その他 ---
    it('同じ内容で複数回登録した場合、別IDで登録される', async () => {
        const bookData = { title: '重複テスト', author: '著者' }
        const req1 = makePostBookRequest(token, bookData)
        const req2 = makePostBookRequest(token, bookData)
        const res1 = await app.fetch(req1)
        const res2 = await app.fetch(req2)
        expect(res1.status).toBe(200)
        expect(res2.status).toBe(200)
        const body1 = await res1.json()
        const body2 = await res2.json()
        expect(body1.book.id).not.toBe(body2.book.id)
        createdBookIds.push(body1.book.id)
        createdBookIds.push(body2.book.id)
    })

    // 増えてしまった登録データを削除
    afterAll(async () => {
        for (const id of createdBookIds) {
            try {
                await prisma.book.delete({ where: { id } })
            } catch (e) {
                // 既に削除済み等は無視
            }
        }
    })
})

describe('PUT /api/books/{bookId}', () => {
    let token: string
    let bookId: string
    const initialBook = {
        title: '編集前タイトル',
        author: '編集前著者',
        isbn: '123-4567890123',
        location: '編集前棚',
        memo: '編集前メモ',
        purchasedAt: '2024-05-01'
    }
    beforeAll(async () => {
        token = await getToken()
        // 事前に1件登録しておく
        const req = new Request('http://localhost/api/books', {
            method: 'POST',
            headers: {
                'Authorization': `Bearer ${token}`,
                'Content-Type': 'application/json'
            },
            body: JSON.stringify(initialBook)
        })
        const res = await app.fetch(req)
        const body = await res.json()
        bookId = body.book.id
    })
    afterAll(async () => {
        // テストで作成した書籍を削除
        try {
            await prisma.book.delete({ where: { id: bookId } })
        } catch (e) {}
    })

    // PUT /api/books/{bookId}用の共通リクエスト生成関数
    function makePutBookRequest(token: string, bookId: string, body: any) {
        return new Request(`http://localhost/api/books/${bookId}`, {
            method: 'PUT',
            headers: {
                'Authorization': `Bearer ${token}`,
                'Content-Type': 'application/json'
            },
            body: JSON.stringify(body)
        })
    }

    // --- 正常系 ---
    it('全項目を更新できる', async () => {
        const update = {
            title: '編集後タイトル',
            author: '編集後著者',
            isbn: '987-6543210987',
            location: '編集後棚',
            memo: '編集後メモ',
            purchasedAt: '2025-05-28'
        }
        const req = makePutBookRequest(token, bookId, update)
        const res = await app.fetch(req)
        expect(res.status).toBe(200)
        const body = await res.json()
        expect(body.book.title).toBe(update.title)
        expect(body.book.author).toBe(update.author)
        expect(body.book.isbn).toBe(update.isbn)
        expect(body.book.location).toBe(update.location)
        expect(body.book.memo).toBe(update.memo)
        expect(body.book.purchasedAt).toBe(update.purchasedAt)
        expect(body.book.registeredBy).toBe(validUser.email)
        expect(body.book).toHaveProperty('updatedAt')
    })

    it('必須項目のみで更新できる', async () => {
        const update = {
            title: '必須のみ編集',
            author: '必須のみ著者'
        }
        const req = makePutBookRequest(token, bookId, update)
        const res = await app.fetch(req)
        expect(res.status).toBe(200)
        const body = await res.json()
        expect(body.book.title).toBe(update.title)
        expect(body.book.author).toBe(update.author)
        expect(body.book.purchasedAt).toBe('2000-01-01')
    })

    it('isbnに数字のみ/数字+ハイフンで更新できる', async () => {
        const validIsbns = ['9781234567890', '978-1-2345-6789-0']
        for (const isbn of validIsbns) {
            const req = makePutBookRequest(token, bookId, {
                title: 'isbn編集',
                author: '著者',
                isbn
            })
            const res = await app.fetch(req)
            expect(res.status).toBe(200)
            const body = await res.json()
            expect(body.book.isbn).toBe(isbn)
        }
    })

    it('memoに改行や長文を指定して更新できる', async () => {
        const longMemo = 'b'.repeat(1000) + '\n編集メモ'
        const req = makePutBookRequest(token, bookId, {
            title: 'memo編集',
            author: '著者',
            memo: longMemo
        })
        const res = await app.fetch(req)
        expect(res.status).toBe(200)
        const body = await res.json()
        expect(body.book.memo).toBe(longMemo)
    })

    // --- 異常系 ---
    const invalidCases = [
        { name: '存在しないbookId', id: '00000000-0000-0000-0000-000000000000', body: { title: 'a', author: 'a' }, status: 404, msg: 'Not Found' },
        { name: 'title未指定', id: null, body: { author: 'a' }, status: 400, msg: 'title' },
        { name: 'author未指定', id: null, body: { title: 'a' }, status: 400, msg: 'author' },
        { name: 'titleが空文字', id: null, body: { title: '', author: 'a' }, status: 400, msg: 'title' },
        { name: 'authorが空文字', id: null, body: { title: 'a', author: '' }, status: 400, msg: 'author' },
        { name: 'titleが256文字以上', id: null, body: { title: 'a'.repeat(256), author: 'a' }, status: 400, msg: 'title' },
        { name: 'authorが256文字以上', id: null, body: { title: 'a', author: 'a'.repeat(256) }, status: 400, msg: 'author' },
        { name: 'isbnに数字・ハイフン以外が含まれる', id: null, body: { title: 'a', author: 'a', isbn: '978-abc-123' }, status: 400, msg: 'isbn' },
        { name: 'locationが256文字以上', id: null, body: { title: 'a', author: 'a', location: 'a'.repeat(256) }, status: 400, msg: 'location' },
        { name: 'purchasedAtがYYYY-MM-DD形式でない', id: null, body: { title: 'a', author: 'a', purchasedAt: '20240527' }, status: 400, msg: 'purchasedAt' },
        { name: 'purchasedAtが不正な日付', id: null, body: { title: 'a', author: 'a', purchasedAt: '2024-02-30' }, status: 400, msg: 'purchasedAt' },
    ]
    it.each(invalidCases)('$name', async ({ id, body, status, msg }) => {
        const targetId = id || bookId
        const req = makePutBookRequest(token, targetId, body)
        const res = await app.fetch(req)
        expect(res.status).toBe(status)
        const resBody = await res.json()
        expect(JSON.stringify(resBody.message)).toContain(msg)
    })

    // --- その他 ---
    it('registeredByは変更不可（リクエストで指定しても無視される）', async () => {
        const req = makePutBookRequest(token, bookId, {
            title: 'registeredBy編集',
            author: '著者',
            registeredBy: 'malicious@example.com'
        })
        const res = await app.fetch(req)
        expect(res.status).toBe(200)
        const body = await res.json()
        expect(body.book.registeredBy).toBe(validUser.email)
    })

    it('更新後、DBの内容が正しく書き換わっている', async () => {
        const update = {
            title: 'DB反映テスト',
            author: 'DB反映著者',
            isbn: '111-2222222222',
            location: 'DB棚',
            memo: 'DBメモ',
            purchasedAt: '2025-05-28'
        }
        const req = makePutBookRequest(token, bookId, update)
        const res = await app.fetch(req)
        expect(res.status).toBe(200)
        // DBから直接取得して検証
        const dbBook = await prisma.book.findUnique({ where: { id: bookId } })
        expect(dbBook).not.toBeNull()
        if (dbBook) {
            expect(dbBook.title).toBe(update.title)
            expect(dbBook.author).toBe(update.author)
            expect(dbBook.isbn).toBe(update.isbn)
            expect(dbBook.location).toBe(update.location)
            expect(dbBook.memo).toBe(update.memo)
            expect(dbBook.purchasedAt?.toISOString().slice(0, 10)).toBe(update.purchasedAt)
        }
    })
})
