module.exports = {
   parser: '@typescript-eslint/parser',
   extends: ['plugin:@typescript-eslint/recommended'],
   parserOptions: {
      project: ['./tsconfig.json'],
      ecmaVersion: 2020,
      sourceType: 'module',
   },
   rules: {
      // 'react/jsx-filename-extension': 'off',
      //You can override any rules you want
   },
};
