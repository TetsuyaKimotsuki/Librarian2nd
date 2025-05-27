// テスト用ユーザーseedスクリプト
// 実行: npx ts-node prisma/seed.ts
import { PrismaClient } from '@prisma/client';
import * as bcrypt from 'bcryptjs';

const prisma = new PrismaClient();

async function main() {
    const users = [
        {
            email: 'taro.yamada@sigo-ri.co.jp',
            password: await bcrypt.hash('taro123', 10),
            name: '山田 太郎',
            role: 'admin',
        },
        {
            email: 'hanako.suzuki@sigo-ri.co.jp',
            password: await bcrypt.hash('hanako123', 10),
            name: '鈴木 花子',
            role: 'user',
        },
        {
            email: 'ichiro.sato@sigo-ri.co.jp',
            password: await bcrypt.hash('ichiro123', 10),
            name: '佐藤 一郎',
            role: 'user',
        },
        {
            email: 'yuko.tanaka@sigo-ri.co.jp',
            password: await bcrypt.hash('yuko123', 10),
            name: '田中 優子',
            role: 'user',
        },
        {
            email: 'kenji.kobayashi@sigo-ri.co.jp',
            password: await bcrypt.hash('kenji123', 10),
            name: '小林 健二',
            role: 'user',
        },
    ];

    for (const user of users) {
        await prisma.user.upsert({
            where: { email: user.email },
            update: {},
            create: user,
        });
    }

    // --- Bookデータ生成 ---
    const books = [
      // 重複本（購入時期・登録者違い）
      {
        title: 'リーダブルコード',
        author: 'ダスティン・ボズウェル',
        isbn: '978-4873115658',
        location: '3F 技術書棚',
        memo: '2024年度新刊\n技術書',
        purchasedAt: new Date('2024-04-01'),
        registeredBy: 'taro.yamada@sigo-ri.co.jp',
      },
      {
        title: 'リーダブルコード',
        author: 'ダスティン・ボズウェル',
        isbn: '978-4873115658',
        location: '3F 技術書棚',
        memo: '2025年度再購入',
        purchasedAt: new Date('2025-03-15'),
        registeredBy: 'hanako.suzuki@sigo-ri.co.jp',
      },
      // 同著者の別書籍
      {
        title: 'テスト駆動開発',
        author: 'ケント・ベック',
        isbn: '978-4274217883',
        location: '3F 技術書棚',
        memo: 'TDDのバイブル',
        purchasedAt: new Date('2023-12-10'),
        registeredBy: 'ichiro.sato@sigo-ri.co.jp',
      },
      {
        title: 'エクストリームプログラミング',
        author: 'ケント・ベック',
        isbn: '978-4274064067',
        // location: '3F 技術書棚',
        memo: 'locationは未指定',
        purchasedAt: new Date('2022-11-05'),
        registeredBy: 'kenji.kobayashi@sigo-ri.co.jp',
      },
      // 著者バリエーション
      {
        title: '達人に学ぶSQL徹底指南書',
        author: 'ミック',
        isbn: '978-4798142470',
        location: '3F DB棚',
        memo: '',
        purchasedAt: new Date('2023-08-01'),
        registeredBy: 'yuko.tanaka@sigo-ri.co.jp',
      },
      {
        title: 'Web API: The Good Parts',
        author: '山田 祥寛',
        isbn: '978-4798150734',
        location: '3F Web棚',
        memo: '購入日不明',
        // purchasedAt: new Date('2024-01-20'), default値 2000-01-01 が入る
        registeredBy: 'taro.yamada@sigo-ri.co.jp',
      },
      // ...（ここにさらに25冊分、著者・タイトル・登録者・購入日等をバリエーション豊かに追加）
    ]

    // ダミーデータを30冊まで拡張
    // 個別データと被る著者・タイトルは除外
    const authorList = [
      'Joel Spolsky', 'Martin Fowler', 'Robert C. Martin', 'Steve McConnell',
      'Paul Graham', 'Eric Evans', 'Bjarne Stroustrup', 'Brian W. Kernighan',
      'Andrew Hunt', 'David Thomas', 'Joshua Bloch', 'Donald Knuth',
      'Jeff Atwood', 'Yukihiro Matsumoto', 'Guido van Rossum', 'Linus Torvalds'
    ];
    const titleList = [
      'プログラマのためのSQL', 'Clean Code', 'Code Complete',
      'The Pragmatic Programmer', 'Domain-Driven Design', 'Effective Java', 'The Art of Computer Programming',
      'Refactoring', 'Working Effectively with Legacy Code', 'Programming Pearls', 'Structure and Interpretation of Computer Programs',
      'Coders at Work', 'UNIXプログラミング環境', 'オブジェクト指向における再利用のためのデザインパターン', 'Linuxカーネルのしくみ'
    ];
    while (books.length < 30) {
      const idx = books.length;
      books.push({
        title: titleList[idx % titleList.length] + (idx >= titleList.length ? `（第${Math.floor(idx / titleList.length) + 1}版）` : ''),
        author: authorList[idx % authorList.length],
        isbn: `978-4${(idx + 10000000000).toString()}`,
        location: ['3F 技術書棚', '2F 一般書棚', '4F 新刊棚'][idx % 3],
        memo: idx % 5 === 0 ? '注目の新刊' : '',
        purchasedAt: new Date(2023, idx % 12, 1 + (idx % 28)),
        registeredBy: users[idx % users.length].email,
      })
    }

    for (const book of books) {
      await prisma.book.create({ data: book })
    }
}

main()
    .catch((e) => {
        console.error(e);
        process.exit(1);
    })
    .finally(async () => {
        await prisma.$disconnect();
    });
