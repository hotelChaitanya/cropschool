/** @type {import('jest').Config} */
module.exports = {
    testEnvironment: 'jsdom',
    setupFilesAfterEnv: ['<rootDir>/src/test-setup.ts'],
    moduleNameMapper: {
        '^@/(.*)$': '<rootDir>/src/$1',
    },
    transform: {
        '^.+\\.(ts|tsx)$': ['ts-jest', {
            tsconfig: {
                jsx: 'react-jsx',
            },
        }],
    },
    moduleFileExtensions: ['ts', 'tsx', 'js', 'jsx', 'json'],
    testMatch: [
        '<rootDir>/src/**/__tests__/**/*.(ts|tsx|js)',
        '<rootDir>/src/**/?(*.)(spec|test).(ts|tsx|js)',
    ],
    collectCoverageFrom: [
        'src/**/*.(ts|tsx)',
        '!src/**/*.d.ts',
        '!src/test-setup.ts',
        '!src/index.ts',
    ],
    modulePathIgnorePatterns: ['<rootDir>/dist/'],
};