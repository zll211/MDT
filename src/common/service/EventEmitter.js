/**
 * 事件类
 * @class
 */
export class EventEmitter {
  /**
   * 构造函数
   * @constructs
   */
  constructor() {
    this.eventList = [];
  }

  /**
   * 触发自定义事件
   * @param {string} eventName
   * @param {any} data
   * @param {Document|Element} [target = document]
   */
  $emit(eventName, data, target = document) {
    const customEvent = new CustomEvent(eventName, {
      bubbles: true,
      detail: data,
    });
    target.dispatchEvent(customEvent);
  }

  /**
   * 监听事件
   * @param {string} eventName
   * @param {requestCallback} callback
   * @param {boolean|Object} [options = true]
   * @param {Document|Element} [target = document]
   */
  $on(eventName, callback, options = true, target = document) {
    target.addEventListener(eventName, callback, options);
    this.eventList.push({
      target: target,
      eventName: eventName,
      callback: callback,
      options: options,
    });
  }

  /**
   * 监听事件,只监听一次，之后销毁
   * @param {string} eventName
   * @param {requestCallback} callback
   * @param {boolean|Object} [options = true]
   * @param {Document|Element} [target = document]
   */
  $once(eventName, callback, options = true, target = document) {
    const _callback = (e) => {
      callback(e);
      target.removeEventListener(eventName, _callback, options);
    };
    target.addEventListener(eventName, _callback, options);
  }

  /**
   * 注销事件
   * @param {string=} eventName
   * @param {requestCallback=} callback
   * @param {boolean|Object} [options = true]
   * @param {Document|Element} [target = document]
   */
  $off(eventName, callback, options, target = document) {
    let eventList = [];
    if (eventName && callback && options) {
      eventList = this.eventList.filter((ev) =>
        ev.target === target && ev.eventName === eventName &&
        ev.options === options && ev.callback === callback);
    } else if (eventName && callback) {
      eventList = this.eventList.filter((ev) =>
        ev.target === target && ev.eventName === eventName &&
        ev.callback === callback);
    } else if (eventName) {
      eventList = this.eventList.filter((ev) =>
        ev.target === target && ev.eventName === eventName);
    } else {
      eventList = [...this.eventList];
    }
    eventList.forEach((ev) => {
      ev.target.removeEventListener(ev.eventName, ev.callback, ev.options);
      const index = this.eventList.findIndex((e) => e === ev);
      if (~index) this.eventList.splice(index, 1);
    });
  }

  /**
   * 监听事件
   * @param {string} eventName
   * @param {requestCallback} callback
   * @param {boolean|Object} [options = true]
   * @param {Document|Element} [target = document]
   */
  addHandler(eventName, callback, options, target = document) {
    target.addEventListener(eventName, callback, options);
    this.eventList.push({
      target: target,
      eventName: eventName,
      callback: callback,
      options: options,
    });
  }

  /**
   * 注销事件
   * @param {string} eventName
   * @param {requestCallback} callback
   * @param {boolean|Object} [options = true]
   * @param {Document|Element} [target = document]
   */
  removeHandler(eventName, callback, options, target = document) {
    target.removeEventListener(eventName, callback, options);
    const index = this.eventList.findIndex((ev) =>
      ev.target === target && ev.eventName === eventName &&
      ev.options === options && ev.callback === callback);
    if (~index) {
      this.eventList.splice(index, 1);
    }
  }

  /**
   * 销毁事件
   */
  destroy() {
    this.$off();
  }
}
