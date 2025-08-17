import resolve from '@rollup/plugin-node-resolve';
import commonjs from '@rollup/plugin-commonjs';
import typescript from '@rollup/plugin-typescript';
import dts from 'rollup-plugin-dts';
import peerDepsExternal from 'rollup-plugin-peer-deps-external';
import { readFileSync } from 'fs';

const packageJson = JSON.parse(readFileSync('./package.json', 'utf8'));

export default [
    {
        input: 'src/index.ts',
        output: [
            {
                file: packageJson.main,
                format: 'cjs',
                sourcemap: true,
            },
            {
                file: packageJson.module,
                format: 'esm',
                sourcemap: true,
            },
        ],
        plugins: [
            peerDepsExternal(),
            resolve({
                browser: true,
            }),
            commonjs(),
            typescript({
                tsconfig: './tsconfig.json',
                exclude: ['**/*.stories.tsx', '**/*.test.tsx'],
            }),
        ],
        external: ['react', 'react-dom', 'react-native', 'framer-motion'],
    },
    {
        input: 'dist/index.d.ts',
        output: [{ file: 'dist/index.d.ts', format: 'esm' }],
        plugins: [dts()],
    },
];
