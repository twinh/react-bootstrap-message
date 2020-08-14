// From https://github.com/ant-design/ant-design/blob/master/components/message/index.tsx
// 1. Removes icon dependence
// 2. Adds onClick to remove notice

import React from 'react';
import ReactDOM from 'react-dom';
import Notification from 'rc-notification';

let defaultDuration = 3; /* global Promise */
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
    style: {}, // 移除默认的样式
    getContainer: getContainer,
    maxCount: maxCount,
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
        content: <div className={'message-content message-content-' + args.type}>{args.content}</div>,
        onClose: callback,
        onClick: () => {
          if (args.type !== 'loading') {
            instance.removeNotice(target);
            callback();
          }
        },
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
}

const api = {
  open: notice,
  config: function config(options) {
    if (options.top !== undefined) {
      defaultTop = options.top;
      messageInstance = null; // delete messageInstance for new defaultTop
    }
    if (options.duration !== undefined) {
      defaultDuration = options.duration;
    }
    if (options.prefixCls !== undefined) {
      prefixCls = options.prefixCls;
    }
    if (options.getContainer !== undefined) {
      getContainer = options.getContainer;
    }
    if (options.transitionName !== undefined) {
      transitionName = options.transitionName;
      messageInstance = null; // delete messageInstance for new transitionName
    }
    if (options.maxCount !== undefined) {
      maxCount = options.maxCount;
      messageInstance = null;
    }
  },
  destroy: function destroy() {
    if (messageInstance) {
      messageInstance.destroy();
      messageInstance = null;
    }
  },
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

const loadingOptions = {
  tpl: (content) => <>'   '<i className="message-loading-icon"/>'   '<div>{content}</div>' '</>,
  text: '加载中...',
  duration: 0,
  type: 'loading',
};

let count = 0;
let loading;

function showLoading() {
  count++;
  if (count === 1) {
    loading = api.loading({content: loadingOptions.tpl(loadingOptions.text)});
  }
}

function hideLoading() {
  if (!loading) {
    return;
  }

  if (count > 0) {
    count--;
  }
  if (count === 0) {
    loading();
  }
}

api.loading = (options = 'show') => {
  switch (options) {
    case 'show':
      return showLoading();

    case 'hide':
      return hideLoading();

    default:
      if (typeof options === 'string' || React.isValidElement(options)) {
        options = {content: loadingOptions.tpl(options)};
      }
      return api.open({...loadingOptions, ...options});
  }
};

api.ret = (ret, duration, callback) => {
  const result = api[ret.code === 1 ? 'success' : 'danger'](ret.message, duration, callback);

  let suc;
  result.suc = fn => {
    suc = fn;
    return result;
  };

  let err;
  result.err = fn => {
    err = fn;
    return result;
  };

  result.then(() => {
    if (ret.code === 1 && suc) {
      suc();
    }
    if (ret.code !== 1 && err) {
      err();
    }
  });

  return result;
};

export default api;
