import React from 'react';
import ReactDOM from 'react-dom';
import Notification from 'rc-notification';

class Message extends React.Component {
  static defaultProps = {
    type: 'success',
  };

  render() {
    return <div className="tips-overlay tips-middle">
      <div className="tips in badge badge-success">{this.props.children}</div>
    </div>
  }
}

let notification = null;
Notification.newInstance({
  className: 'message',
  prefixCls: 'message',
}, (n) => notification = n);

Message.message = (content) => {
  const key = Date.now();
  notification.notice({
    content: <Message>{content}</Message>,
    duration: 1000000,
    prefixCls: 'message',
    key,
    onClick: () => {
      notification.removeNotice(key);
    }
  });
};

Message.success = (content) => {
  Message.message(content);
};

export default Message;
