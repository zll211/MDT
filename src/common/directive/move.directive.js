import {EventEmitter} from '../service/EventEmitter';

const emitter = new EventEmitter();
// 使用方式： v-move或v-move = 'fixed';
export const moveDirective = {
  // 只调用一次，指令第一次绑定到元素时调用。在这里可以进行一次性的初始化设置。
  bind(el, binding, vnode) {
    el.style.position = binding.value || 'fixed';
    el.style.cursor = 'move';
    el.style.zIndex = '9999';
  },
  // 当被绑定的元素插入到 DOM 中时……
  inserted(el, binding, vnode) {
    // 聚焦元素
    let point = {x: 0, y: 0};
    let left = 0;
    let top = 0;
    const position = el.style.position;
    emitter.$on('resize', (e) => {
      const {left: oldLeft, width, top: oldTop, height} = el.getBoundingClientRect();
      if (window.document.body.clientWidth < oldLeft + width) {
        el.style.left = window.document.body.clientWidth - width + 'px';
      }
      if (window.document.body.clientHeight < oldTop + height) {
        el.style.top = window.document.body.clientHeight - height + 'px';
      }
    }, true, window);
    emitter.$on('mousedown', (e) => {
      top = el.offsetTop;
      left = el.offsetLeft;
      point = {x: e.x, y: e.y};
      emitter.$on('selectstart', () => 1);
      emitter.$on('dragstart', () => 1);
      emitter.$on('mousemove', (e) => {
        let {x, y} = e;
        let containerWidth = el.getBoundingClientRect().width;
        let containerHeight = el.getBoundingClientRect().height;
        // 如果el的position是'fixed'的，则直接获取body的区域大小
        // 不是则向上查找元素区域
        const boundingClientRect = position === 'fixed' ?
          document.body.getBoundingClientRect() :
          getElementBoundingClientRect(el.parentElement);
        const maxWidth = boundingClientRect.width;
        const maxHeight = boundingClientRect.height;
        const maxLeft = boundingClientRect.left;
        const maxTop = boundingClientRect.top;
        if (y < maxTop) {
          y = maxTop;
        }
        if (y > maxTop + maxHeight) {
          y = maxTop + maxHeight;
        }
        if (x < maxLeft) {
          x = maxLeft;
        }
        if (x > maxLeft + maxWidth) {
          x = maxLeft + maxWidth;
        }
        const distX = x - point.x;
        const distY = y - point.y;
        left += distX;
        top += distY;
        if (left < 0) {
          left = 0;
        }
        if (top < 0) {
          top = 0;
        }
        if (top > maxHeight - containerHeight) {
          top = maxHeight - containerHeight;
        }
        if (left > maxWidth - containerWidth) {
          left = maxWidth - containerWidth;
        }
        el.style.left = left + 'px';
        el.style.top = top + 'px';
        point = {x: x, y: y};
      });
      emitter.$on('mouseup', (e) => {
        emitter.$off('selectstart');
        emitter.$off('dragstart');
        emitter.$off('mousemove');
        emitter.$off('mouseup');
      });
    }, true, el);
  },
  update() {
  },
  // 指令所在组件的 VNode 及其子 VNode 全部更新后调用。
  componentUpdated() {
  },
  // 只调用一次，指令与元素解绑时调用。
  unbind() {
    emitter.$off('resize');
    emitter.$off('mousedown');
  },
};

function getElementBoundingClientRect(el) {
  const position = window.getComputedStyle(el, null).position;
  if (position === 'fixed' || position === 'relative' || position === 'absolute') {
    return el.getBoundingClientRect();
  }
  if (el.parentElement === document.body) {
    return document.body.getBoundingClientRect();
  }
  return getElementBoundingClientRect(el.parentElement);
}
