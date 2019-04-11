/* eslint-disable */
var fs = require('fs');
var argv = process.argv;
var path = argv[2];
var moduleName = argv[3];
const dirPath = `${path}/${moduleName}`;
const upperCaseModule = `${moduleName.substr(0, 1).toUpperCase()}${moduleName.substr(1)}`;
fs.mkdirSync(`${dirPath}`);
fs.writeFileSync(`${dirPath}/${moduleName}.vue`,
`<template>
  <div class="${moduleName}-container"></div>
</template>

<script src="./${moduleName}.component.js"></script>
<style lang="scss" src="./${moduleName}.scss"></style>
`
);
fs.writeFileSync(`${dirPath}/${moduleName}.component.js`,
`import ${upperCaseModule}Service from './${moduleName}.service';
export default {
  data() {
    return {};
  },
  created() {

  },
  mounted() {

  },
  methods: {

  },
};
`
);
fs.writeFileSync(`${dirPath}/${moduleName}.route.js`,
`export const ${moduleName}Route = [
  {
    path: '/${moduleName}',
    component: () => import(/* webpackChunkName: "${moduleName}" */ './${moduleName}'),
    name: '${moduleName}',
    beforeEnter: (to, from, next) => {
      next();
    },
    // show: true,
  },
];
`
);
fs.writeFileSync(`${dirPath}/${moduleName}.service.js`,
`import Vue from 'vue';
import {baseUrl} from 'src/config/utils';
export default class ${upperCaseModule}Service {}
`
);
fs.writeFileSync(`${dirPath}/${moduleName}.scss`,
`.${moduleName}-container{}
`
);