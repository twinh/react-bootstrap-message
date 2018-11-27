import React from 'react';
import ReactDOM from 'react-dom';
import Notification from 'rc-notification';

const Message = (props) => {
  return <div className={"message-content message-content-" + props.type}>{props.children}</div>;
};

Message.defaultProps = {
  type: 'success',
};

let notification = null;
Notification.newInstance({
  prefixCls: 'message',
  animation: 'pop',
  style: {}, // 移除默认的样式
}, (n) => notification = n);

Message.message = (content, duration = 2, type, onClose) => {
  const key = Date.now();
  notification.notice({
    content: <Message type={type}>{content}</Message>,
    duration: duration,
    prefixCls: 'message',
    style: {}, // 移除默认的样式
    key,
    onClick: () => {
      notification.removeNotice(key);
    }
  });
};

['success', 'danger', 'warning', 'info', 'dark'].forEach((type) => {
  Message[type] = (content, duration, onClose) => Message.message(content, duration, type, onClose);
});

export default Message;
