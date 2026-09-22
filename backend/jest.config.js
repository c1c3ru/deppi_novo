module.exports = {
  preset: 'ts-jest',
  testEnvironment: 'node',
  testMatch: ['**/*.test.ts'],
  resetMocks: true,
  // htmlparser2 e a árvore de pacotes dom* que ele usa (dependências do
  // sanitize-html) são distribuídos só como ESM. O Node 22 do runtime e do CI
  // consegue carregá-los de um require(), mas o Jest roda em CommonJS puro,
  // então esses pacotes precisam ser transpilados aqui.
  transform: {
    '^.+\\.tsx?$': 'ts-jest',
    '^.+\\.js$': [
      'ts-jest',
      { tsconfig: { allowJs: true, module: 'CommonJS' } },
    ],
  },
  transformIgnorePatterns: [
    '/node_modules/(?!(htmlparser2|entities|domhandler|domutils|dom-serializer|domelementtype)/)',
  ],
};
