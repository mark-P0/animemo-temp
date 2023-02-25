/**
 * - Prefer the `eslint.config.cjs` (_flat config_) format over traditional `.eslintrc.cjs`
 *   to be uniform with other config files.
 * - `.cjs` format used over `.js` as other config files have finicky ESM compliance
 * - ESLint (and VSCode extension) still only expects `.js` files; for e.g. `.cjs`, they must be specified explicitly.
 *   - In the CLI
 *     ```sh
 *     ESLINT_USE_FLAT_CONFIG=true npx eslint -c eslint.config.mjs .
 *     ```
 *   - In VSCode
 *     ```json
 *     "eslint": {
 *       "experimental": {
 *         "useFlatConfig": true
 *       },
 *       "options": {
 *         "overrideConfigFile": "eslint.config.cjs"
 *       }
 *     }
 *     ```
 *
 * https://eslint.org/docs/latest/use/configure/configuration-files-new
 * https://github.com/microsoft/vscode-eslint/issues/1518#issuecomment-1352281966
 */

const { FlatCompat } = require('@eslint/eslintrc');

/**
 * Existing ESLint plugins, configs have finicky support for flat configs,
 * and there are not much documentation for their use, so the
 * backward-compatible approach was preferred here.
 *
 * Essentially converts `.eslintrc*`-style configs into flat variant.
 *
 * https://eslint.org/blog/2022/08/new-config-system-part-2/#backwards-compatibility-utility
 */
const compat = new FlatCompat({ baseDirectory: __dirname });

const configs = [
  /**
   * Via bare `npm init @eslint/config`
   * https://eslint.org/docs/latest/use/getting-started#quick-start
   */
  ...compat.config({
    env: {
      browser: true,
      es2021: true,
      node: true,
    },
    extends: ['eslint:recommended'],
    overrides: [],
    parserOptions: {
      ecmaVersion: 'latest',
      sourceType: 'module',
    },
    rules: {},
  }),

  /**
   * https://typescript-eslint.io/getting-started/#step-2-configuration
   */
  ...compat.config({
    extends: ['plugin:@typescript-eslint/recommended'],
    parser: '@typescript-eslint/parser',
    plugins: ['@typescript-eslint'],
    root: true,
    overrides: [
      {
        /**
         * TS endorses the `import foo = require("foo")` syntax.
         * However these shouldn't be enforced on CommonJS files;
         * the syntax is not even valid.
         */
        files: ['*.cjs'],
        rules: { '@typescript-eslint/no-var-requires': 'off' },
      },
    ],
  }),

  /**
   * https://github.com/jsx-eslint/eslint-plugin-react#configuration-legacy-eslintrc
   */
  ...compat.config({
    extends: ['plugin:react/recommended', 'plugin:react/jsx-runtime'],
  }),

  /**
   * https://prettier.io/docs/en/integrating-with-linters.html
   * https://github.com/prettier/eslint-config-prettier#installation
   */
  ...compat.config({
    extends: ['prettier'],
  }),
];

module.exports = configs;
