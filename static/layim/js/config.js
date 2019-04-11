/**
  扩展一个config模块
**/

layui.define(function(exports){ //提示：模块也可以依赖其它模块，如：layui.define('layer', callback);
  var obj = {
    videoToolName: 'facetime',
    baseURL: '/api/im/'
  };

  //输出test接口
  exports('config', obj);
});
