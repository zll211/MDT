module.exports = {
  root: true,
  // parser: "babel-eslint",
  parserOptions: {
    parser: "babel-eslint",
    ecmaVersion: 9,
    sourceType: 'module'
  },
  env: {
    browser: true,
    node: true,
    es6: true
  },
  extends: ['eslint:recommended', 'plugin:vue/essential', 'google'],
  // required to lint *.vue files
  //eslint-plugin-html， 允许eslint检测html中的js
  plugins: [
    // 'html'
    'vue',
  ],
  // check if imports actually resolve
  settings: {

  },
  // add your custom rules here
  rules: {
    // allow paren-less arrow functions
    'arrow-parens': 0,
    // allow async-await
    'generator-star-spacing': 0,
    // allow debugger during development
    'no-debugger': process.env.NODE_ENV === 'production' ? 2 : 1,
    'no-console': process.env.NODE_ENV === 'production' ? 2 : 1,
    /*'max-len': [0, {
      code: 80,
    }],*/
    'linebreak-style': [0, 'windows'],
    'require-jsdoc': "off",
    'max-len': [2, 160, 4, {"ignoreUrls": true}],
    'comma-dangle': 'off'
  }
};
