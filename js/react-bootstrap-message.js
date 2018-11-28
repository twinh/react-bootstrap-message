// From https://github.com/ant-design/ant-design/blob/master/components/message/index.tsx
// 1. Removes icon dependence
// 2. Adds onClick to remove notice

import React from 'react';
import ReactDOM from 'react-dom';
import Notification from 'rc-notification';

let defaultDuration = 2; /* global Promise */
let defaultTop = 0;
let messageInstance = 0;
let key = 1;
let prefixCls = 'message';
let transitionName = 'message-pop';
let getContainer = 0;
let maxCount = 0;

function getMessageInstance(callback) {
  if (messageInstance) {
    callback(messageInstance);
    return;
  }
  Notification.newInstance({
    prefixCls: prefixCls,
    transitionName: transitionName,
    style: {top: defaultTop},
    getContainer: getContainer,
    maxCount: maxCount
  }, function (instance) {
    if (messageInstance) {
      callback(messageInstance);
      return;
    }
    messageInstance = instance;
    callback(instance);
  });
}

function notice(args) {
  const duration = args.duration !== undefined ? args.duration : defaultDuration;
  const target = key++;

  const closePromise = new Promise(function (resolve) {
    const callback = () => {
      if (typeof args.onClose === 'function') {
        args.onClose();
      }
      return resolve(true);
    };
    getMessageInstance(function (instance) {
      instance.notice({
        key: target,
        duration: duration,
        style: {}, // 移除默认的样式
        content: <div className={"message-content message-content-" + args.type}>{args.content}</div>,
        onClose: callback,
        onClick: () => {
          if (args.type !== 'loading') {
            instance.removeNotice(target);
            callback();
          }
        }
      });
    });
  });
  const result = function result() {
    if (messageInstance) {
      messageInstance.removeNotice(target);
    }
  };
  result.then = function (filled, rejected) {
    return closePromise.then(filled, rejected);
  };
  result.promise = closePromise;
  return result;
};

const api = {
  open: notice,
  destroy: function destroy() {
    if (messageInstance) {
      messageInstance.destroy();
      messageInstance = null;
    }
  }
};

['success', 'danger', 'warning', 'info'].forEach((type) => {
  api[type] = function (content, duration, onClose) {
    if (typeof duration === 'function') {
      onClose = duration;
      duration = undefined;
    }
    return api.open({content: content, duration: duration, type: type, onClose: onClose});
  };
});

api.loading = (content = <>
  <i className="message-loading-icon"/>
  <div>加载中...</div>
</>) => {
  api.open({content: content, duration: 0, type: 'loading'});
};

export default api;
