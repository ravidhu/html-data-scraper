module.exports = {
    require: [
        "tests/typescript.js", // ts-node/register is done here with tsconfig-tests.json
        "source-map-support/register"
    ],
    extension: ['ts'],
    timeout: 30000,
    color: true,
    exit: true,
}
