module.exports = {
  'presets': [
    [
      '@babel/preset-env',
      {
        'modules': false,
        'targets': {
          // 'browsers': ' >1%, ie >=11, not dead', 在package.json已配置
        },
        'useBuiltIns': 'usage',
      },
    ],
  ],
  'plugins': [
    [
      '@babel/plugin-proposal-pipeline-operator',
      {
        'proposal': 'minimal',
      },
    ],
    '@babel/plugin-proposal-object-rest-spread',
    '@babel/plugin-proposal-optional-chaining',
    '@babel/plugin-proposal-function-bind',
    '@babel/plugin-proposal-do-expressions',
    // 修复在@babel/plugin-syntax-dynamic-import插件下无法识别import()语法
    /* 'dynamic-import-webpack',*/
    // bug webpack高版本无法识别import()语法*/
    '@babel/plugin-syntax-dynamic-import',
    '@babel/plugin-syntax-import-meta',
    '@babel/plugin-proposal-class-properties',
    '@babel/plugin-proposal-json-strings',
    [
      '@babel/plugin-proposal-decorators',
      {
        'legacy': true,
      },
    ],
    '@babel/plugin-proposal-function-sent',
    '@babel/plugin-proposal-export-namespace-from',
    '@babel/plugin-proposal-numeric-separator',
    '@babel/plugin-proposal-throw-expressions',
  ],
  'comments': false,
  'env': {},
};
