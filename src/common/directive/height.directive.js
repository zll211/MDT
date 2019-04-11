import {EventEmitter} from '../service/EventEmitter';

const emitter = new EventEmitter();
// v-height
// 默认高度为当前元素的父元素高度

// v-height = el
// 当前元素的高度设置为el的高度

// v-height = 60
// 当前元素的高度设置为父元素高度+60px

// v-height = {el: el, distY: 60}
// 当前元素的高度设置为el的高度+60px
export const heightDirective = {
  // 只调用一次，指令第一次绑定到元素时调用。在这里可以进行一次性的初始化设置。
  bind(el, binding, vnode) {
  },
  // 当被绑定的元素插入到 DOM 中时……
  inserted(el, binding, vnode) {
    const {element, distY} = getEffectiveValue(el, binding.value);
    isRightElement(element)
      .then(() => {
        el.style.height = element.getBoundingClientRect().height + distY + 'px';
        emitter.$on('resize', () => {
          el.style.height = element.getBoundingClientRect().height + distY + 'px';
        }, true, window);
      });
  },
  update(el, binding, vnode) {
    const {element, distY} = getEffectiveValue(el, binding.value);
    isRightElement(element)
      .then(() => {
        el.style.height = element.getBoundingClientRect().height + distY + 'px';
        emitter.$off('resize', undefined, undefined, window);
        emitter.$on('resize', () => {
          el.style.height = element.getBoundingClientRect().height + distY + 'px';
        }, true, window);
      });
  },
  // 指令所在组件的 VNode 及其子 VNode 全部更新后调用。
  componentUpdated() {
  },
  // 只调用一次，指令与元素解绑时调用。
  unbind() {
    emitter.$off('resize', undefined, undefined, window);
  },
};

async function isRightElement(el) {
  if (!(el instanceof HTMLElement)) {
    if (DOMError) {
      throw new DOMError('TypeMismatchError', 'params is not a HTMLElement');
    } else {
      throw new Error('params is not a HTMLElement');
    }
  } else {
    return true;
  }
}

function isObject(obj) {
  return Object.prototype.toString.call(obj) === '[object Object]';
}

function isNumber(val) {
  return typeof val === 'number';
}

function getEffectiveValue(el, val) {
  let element = el.parentElement;
  let distY = 0;
  if (!val) {
    element = el.parentElement;
    distY = 0;
  } else if (val instanceof HTMLElement) {
    element = val;
    distY = 0;
  } else if (isNumber(val)) {
    element = el.parentElement;
    distY = val;
  } else if (isObject(val)) {
    element = val?.el || el.parentElement;
    distY = val?.distY || 0;
  }
  return {element, distY};
}
