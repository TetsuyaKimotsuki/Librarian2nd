// テスト用ユーザーseedスクリプト
// 実行: npx ts-node prisma/seed.ts
import { PrismaClient } from '@prisma/client';
import * as bcrypt from 'bcryptjs';

const prisma = new PrismaClient();

async function main() {
    const users = [
        {
            email: 'taro.yamada@ogis-ri.co.jp',
            password: await bcrypt.hash('taro123', 10),
            name: '山田 太郎',
            role: 'admin',
        },
        {
            email: 'hanako.suzuki@ogis-ri.co.jp',
            password: await bcrypt.hash('hanako123', 10),
            name: '鈴木 花子',
            role: 'user',
        },
        {
            email: 'ichiro.sato@ogis-ri.co.jp',
            password: await bcrypt.hash('ichiro123', 10),
            name: '佐藤 一郎',
            role: 'user',
        },
        {
            email: 'yuko.tanaka@ogis-ri.co.jp',
            password: await bcrypt.hash('yuko123', 10),
            name: '田中 優子',
            role: 'user',
        },
        {
            email: 'kenji.kobayashi@ogis-ri.co.jp',
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
}

main()
    .catch((e) => {
        console.error(e);
        process.exit(1);
    })
    .finally(async () => {
        await prisma.$disconnect();
    });
