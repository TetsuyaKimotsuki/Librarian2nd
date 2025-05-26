import { defineConfig } from 'vitest/config';

export default defineConfig({
    test: {
        globalSetup: './test/testcontainers-setup.ts',
        env: {
             TEST: "postgresql://postgres:mysecretpassword@localhost:4344/librariandb",
        },
    },
});
