module.exports = {
    root: true,
    parser: '@typescript-eslint/parser',
    parserOptions: {
        project: './tsconfig.json',
    },
    plugins: [
        '@typescript-eslint',
    ],
    extends: [
        'plugin:@typescript-eslint/recommended',
    ],
    env: {
        'node': true,
        'es6': true,
    },
    rules: {
        'indent': [2, 4],
        'no-empty-function': [2],
        'no-var': [2],
        'keyword-spacing': [2],
        'space-infix-ops': [2],
        'arrow-spacing': [2],
        'no-shadow': [2],
        'comma-dangle': [2, 'always-multiline'],
        'quotes': [2, 'single'],

        '@typescript-eslint/semi': [2],


    },
};
