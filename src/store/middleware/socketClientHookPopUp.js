/*
 * Hooks for websocket client for popup window
 *
 */

import SocketClient from '../../socket/SocketClient';

export default () => (next) => (action) => {
  if (SocketClient.readyState === WebSocket.CLOSED) {
    if (action.type === 't/PARENT_CLOSED') {
      SocketClient.connect();
    }
  } else {
    switch (action.type) {
      case 'SET_NAME':
      case 'LOGIN':
      case 'LOGOUT': {
        SocketClient.reconnect();
        break;
      }

      case 's/REQ_CHAT_MESSAGE': {
        const {
          text,
          channel,
        } = action;
        SocketClient.sendChatMessage(text, channel);
        break;
      }

      default:
      // nothing
    }
  }

  return next(action);
};
