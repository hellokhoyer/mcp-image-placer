module.exports = {
  root: true,
  parser: '@typescript-eslint/parser',
  parserOptions: {
    ecmaVersion: 2022,
    sourceType: 'module',
  },
  plugins: [
    '@typescript-eslint'
  ],
  extends: [
    'eslint:recommended'
    // '@typescript-eslint/recommended' // Disabled due to module resolution issues
  ],
  env: {
    node: true,
    es2022: true
  },
  rules: {
    // General code quality rules
    'no-console': ['warn', { allow: ['warn', 'error'] }],
    'prefer-const': 'error',
    'no-var': 'error',
    'object-shorthand': 'error',
    'prefer-template': 'error',
    'no-duplicate-imports': 'error',
    'no-unused-vars': ['error', { 
      argsIgnorePattern: '^_',
      varsIgnorePattern: '^_',
      ignoreRestSiblings: true 
    }]
  },
  overrides: [
    {
      files: ['**/*.test.ts', '**/*.spec.ts'],
      env: {
        jest: true
      },
      rules: {
        '@typescript-eslint/no-explicit-any': 'off',
        '@typescript-eslint/no-non-null-assertion': 'off',
        'no-console': 'off'
      }
    },
    {
      files: ['src/cli/**/*.ts'],
      rules: {
        'no-console': 'off' // CLI files can use console
      }
    },
    {
      files: ['src/utils/logger.ts'],
      rules: {
        'no-console': 'off' // Logger utility needs console methods
      }
    },
    {
      files: ['src/errors/**/*.ts'],
      rules: {
        'no-unused-vars': 'off' // TypeScript constructor parameter properties
      }
    }
  ],
  ignorePatterns: [
    'dist/',
    'coverage/',
    'node_modules/',
    '*.js',
    '!.eslintrc.cjs'
  ]
};
