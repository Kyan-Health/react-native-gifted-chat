import js from '@eslint/js'
import typescript from '@typescript-eslint/eslint-plugin'
import typescriptParser from '@typescript-eslint/parser'
import react from 'eslint-plugin-react'
import reactHooks from 'eslint-plugin-react-hooks'
import json from 'eslint-plugin-json'
import jest from 'eslint-plugin-jest'
import stylistic from '@stylistic/eslint-plugin'

export default [
  js.configs.recommended,
  {
    files: ['**/*.{js,jsx,ts,tsx}'],
    languageOptions: {
      parser: typescriptParser,
      ecmaVersion: 'latest',
      sourceType: 'module',
      parserOptions: {
        ecmaFeatures: {
          jsx: true,
        },
      },
      globals: {
        describe: 'readonly',
        test: 'readonly',
        jest: 'readonly',
        expect: 'readonly',
        fetch: 'readonly',
        navigator: 'readonly',
        __DEV__: 'readonly',
        XMLHttpRequest: 'readonly',
        FormData: 'readonly',
        React$Element: 'readonly',
        requestAnimationFrame: 'readonly',
        setTimeout: 'readonly',
        clearTimeout: 'readonly',
        setInterval: 'readonly',
        clearInterval: 'readonly',
        window: 'readonly',
        document: 'readonly',
        console: 'readonly',
        process: 'readonly',
        Buffer: 'readonly',
        module: 'readonly',
        require: 'readonly',
        exports: 'readonly',
        __dirname: 'readonly',
        __filename: 'readonly',
      },
    },
    plugins: {
      '@typescript-eslint': typescript,
      'react': react,
      'react-hooks': reactHooks,
      '@stylistic': stylistic,
      'json': json,
      'jest': jest,
    },
    settings: {
      react: {
        version: 'detect',
      },
    },
    rules: {
      ...typescript.configs.recommended.rules,
      ...react.configs.recommended.rules,
      ...reactHooks.configs.recommended.rules,
      'react/react-in-jsx-scope': 'off',
      'react/no-unknown-property': 'off',
      'react/prop-types': 'off',
      'react/display-name': 'off',
      'indent': [
        'error',
        2,
        {
          SwitchCase: 1,
          VariableDeclarator: 'first',
          ignoredNodes: ['TemplateLiteral'],
        },
      ],
      'template-curly-spacing': 'off',
      'linebreak-style': ['off', 'unix'],
      'quotes': ['error', 'single'],
      'jsx-quotes': ['error', 'prefer-single'],
      '@stylistic/semi': ['error', 'never'],
      '@stylistic/member-delimiter-style': [
        'error',
        {
          multiline: {
            delimiter: 'none',
            requireLast: true,
          },
          singleline: {
            delimiter: 'comma',
            requireLast: false,
          },
        },
      ],
      'comma-dangle': [
        'error',
        {
          arrays: 'always-multiline',
          objects: 'always-multiline',
          imports: 'always-multiline',
          exports: 'never',
          functions: 'never',
        },
      ],
      'arrow-parens': ['error', 'as-needed'],
      'no-func-assign': 'off',
      'no-class-assign': 'off',
      'no-useless-escape': 'off',
      'curly': [2, 'multi', 'consistent'],
      'react-hooks/exhaustive-deps': [
        'warn',
        {
          additionalHooks:
            '(useAnimatedStyle|useSharedValue|useAnimatedGestureHandler|useAnimatedScrollHandler|useAnimatedProps|useDerivedValue|useAnimatedRef|useAnimatedReact|useAnimatedReaction)',
        },
      ],
      'no-unused-vars': 'off',
      '@typescript-eslint/no-unused-vars': ['error', { argsIgnorePattern: '^_' }],
      'brace-style': ['error', '1tbs', { allowSingleLine: false }],
      'nonblock-statement-body-position': ['error', 'below'],
      '@stylistic/jsx-closing-bracket-location': ['error', 'line-aligned'],
      'no-unreachable': 'error',
    },
  },
  {
    files: ['tests/**/*'],
    languageOptions: {
      globals: {
        ...jest.environments.globals.globals,
      },
    },
    rules: {
      ...jest.configs.recommended.rules,
    },
  },
  {
    files: ['**/*.json'],
    rules: {
      ...json.configs.recommended.rules,
    },
  },
  {
    ignores: ['lib/', 'node_modules/', 'coverage/', '*.d.ts'],
  },
]