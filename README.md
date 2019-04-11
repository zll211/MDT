# MDT多学科会诊平台

### 安装与启动 ###
```
npm install

// development
npm run server:hot

// production

npm start或npm run build:prod
```

### 目录结构 ###

```
├── config
│   ├── utils.js
│   ├── webpack.base.conf.js
│   ├── webpack.dev.conf.js
│   ├── webpack.prod.conf.js
│   └── webpack.test.conf.js
├── babel.config.js
├── index.html
├── package.json
├── .eslintrc.js
├── .eslintgnore
├── README.md
└── src
    ├── App.vue
    ├── assets
    │   ├── fonts
    │   └── images
    ├── common
    │   ├── components
    │   ├── directive
    │   ├── filter
    │   └── service
    ├── config
    ├── main.js
    ├── page
    │   ├── base
    │   │   ├── 404
    │   │   ├── error
    │   │   ├── login
    │   │   └── register
    │   └── main
    ├── polyfill.js
    ├── router
    ├── store
    └── style
```

其中`common`目录下存放公共的组件指令服务等，`assets`目录下存放图片与字体等资源文件
`page`目录下面放项目代码，把与业务相关的页面放`main`目录下，`config`目录下为全局的配置文件
`style`目录为全局的样式，

代码规范以eslintrc.js文件定义为准

具体代码规范参见 [./node_module/eslint-config-google]和[./node_module/eslint-plugin-vue]

eslint规则文档[https://eslint.org/docs/rules/]











