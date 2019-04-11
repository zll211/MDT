const baseRoutes = [
  '/404', '/login', '/error', '/register',
];
let baseUrl = '';
let baseImgPath;

if (process.env.NODE_ENV === 'development') {
  baseUrl = '/api';
  baseImgPath = '';
} else {
  baseUrl = window.location.origin + '/api';
  baseImgPath = '';
}

const formatDate = (date, type = '/') => {
  const {toString} = Object.prototype;
  if (!date) return;
  if (date::toString() !== '[Object Date]') {
    date = new Date(date);
  }
  const year = date.getFullYear();
  const month = date.getMonth() + 1;
  const day = date.getDate();
  return [year, month, day].map(formatNumber).join(type);
};

const formatDateTime = (date, type = '-') => {
  if (!date) return;
  return formatDate(date, type) + ' ' + formatTime(date);
};

const formatTime = (date) => {
  const {toString} = Object.prototype;
  if (!date) return;
  if (date::toString() !== '[Object Date]') {
    date = new Date(date);
  }
  const hour = date.getHours();
  const minute = date.getMinutes();
  const second = date.getSeconds();
  return [hour, minute, second].map(formatNumber).join(':');
};

const formatNumber = n => {
  n = n.toString();
  return n[1] ? n : '0' + n;
};

const encodeQueryData = (data) => {
  const {hasOwnProperty} = Object.prototype;
  let ret = [];
  for (let d in data) {
    if (data::hasOwnProperty(d)) {
      ret.push(encodeURIComponent(d) + '=' + encodeURIComponent(data[d]));
    }
  }
  return ret.join('&');
};

const areaArrToString = (areaIndexArr, areaArr) => {
  if (!areaArr && !Array.isArray(areaArr)) return '';
  let areaIndex = areaIndexArr.splice(0, 1)[0];
  if (areaIndex) {
    const area = areaArr.find((item) => item.value === areaIndex);
    if (area) {
      return area.label + areaArrToString(areaIndexArr, area.children);
    }
  }
  return '';
};

const deepClone = (source) => {
  const targetObj = source.constructor === Array ? [] : {}; // 判断复制的目标是数组还是对象
  for (let keys in source) { // 遍历目标
    if (source.hasOwnProperty(keys)) {
      if (source[keys] && typeof source[keys] === 'object') { // 如果值是对象，就递归一下
        targetObj[keys] = source[keys].constructor === Array ? [] : {};
        targetObj[keys] = deepClone(source[keys]);
      } else { // 如果不是，就直接赋值
        targetObj[keys] = source[keys];
      }
    }
  }
  return targetObj;
};

const debounce = (func, delay) => {
  let timer;
  return function(...args) {
    if (timer) clearTimeout(timer);
    timer = setTimeout(() => {
      // eslint-disable-next-line no-invalid-this
      func.apply(this, args);
    }, delay);
  };
};

const flatteningURLArray = (list, permission, newList = [], parentPath = '') => {
  list.forEach((item) => {
    if (item?.children?.length > 0) {
      flatteningURLArray(item.children, permission, newList, item.path);
    }
    if (item.auth) {
      if (permission.indexOf(item.auth) > -1 || item.auth === 'all') {
        if (/^\//.test(item.path)) {
          newList.push(item.path);
        } else {
          newList.push(parentPath + '/' + item.path);
        }
      }
    }
  });
  return newList;
};

const parseDate = (value, format) => {
  let vs = value.split(/[^ymdhs\d]/i);
  let fs = format.split(/[^ymdhs\d]/i);
  if (vs.length !== fs.length) return false;
  let d = new Date();
  d.setHours(0);
  d.setMinutes(0);
  d.setSeconds(0);
  d.setMilliseconds(0);
  for (let i = 0, il = vs.length; i < il; i++) {
    switch (fs[i]) {
      case 'YYYY':
        d.setFullYear(parseInt(vs[i]));
        break;
      case 'yyyy':
        d.setYear(parseInt(vs[i]));
        break;
      case 'MM':
        d.setMonth(parseInt(vs[i]) - 1);
        break;
      case 'dd':
      case 'DD':
        d.setDate(parseInt(vs[i]));
        break;
      case 'hh':
      case 'HH':
        d.setHours(parseInt(vs[i]));
        break;
      case 'mm':
        d.setMinutes(parseInt(vs[i]));
        break;
      case 'ss':
        d.setSeconds(parseInt(vs[i]));
        break;
      case 'SS':
        d.setMilliseconds(parseInt(vs[i]));
        break;
    }
  }
  return d;
};

const unsubscribe = subscription => {
  if (subscription) subscription.unsubscribe();
};

export {
  baseRoutes,
  baseUrl,
  baseImgPath,
  encodeQueryData,
  formatNumber,
  formatTime,
  formatDate,
  formatDateTime,
  deepClone,
  debounce,
  flatteningURLArray,
  parseDate,
  areaArrToString,
  unsubscribe,
};
