/*
 * local save state for chat stuff
 *
 */

const TIME_DIFF_THREASHOLD = 15000;

const initialState = {
  // channels that are muted
  // [cid, cid2, ...]
  mute: [],
  // timestamps of last read
  // {cid: lastTs, ...}
  readTs: {},
  // booleans if channel is unread
  // {cid: unread, ...}
  unread: {},
};


export default function chatRead(
  state = initialState,
  action,
) {
  switch (action.type) {
    case 'RECEIVE_ME':
    case 'LOGIN': {
      const { channels } = action;
      const cids = Object.keys(channels);
      const readTs = {};
      const unread = {};
      for (let i = 0; i < cids.length; i += 1) {
        const cid = cids[i];
        if (!state.readTs[cid]) {
          readTs[cid] = 0;
        } else {
          readTs[cid] = state.readTs[cid];
        }
        unread[cid] = (channels[cid][2] > readTs[cid]);
      }
      return {
        ...state,
        readTs,
        unread,
      };
    }

    case 'ADD_CHAT_CHANNEL': {
      const [cid] = Object.keys(action.channel);
      return {
        ...state,
        readTs: {
          ...state.readTs,
          [cid]: state.readTs[cid] || 0,
        },
        unread: {
          ...state.unread,
          [cid]: true,
        },
      };
    }

    case 'REMOVE_CHAT_CHANNEL': {
      const { cid } = action;
      if (!state.readTs[cid]) {
        return state;
      }
      const readTs = { ...state.readTs };
      delete readTs[cid];
      const unread = { ...state.unread };
      delete unread[cid];
      return {
        ...state,
        readTs,
        unread,
      };
    }

    case 'RECEIVE_CHAT_MESSAGE': {
      const { channel: cid, isRead } = action;
      const readTs = isRead
        ? {
          ...state.readTs,
          // 15s treshold for desync
          [cid]: Date.now() + TIME_DIFF_THREASHOLD,
        } : state.readTs;
      const unread = isRead
        ? state.unread
        : {
          ...state.unread,
          [cid]: true,
        };
      return {
        ...state,
        readTs,
        unread,
      };
    }

    case 'OPEN_WINDOW': {
      const cid = action.args.chatChannel;
      if (!cid) {
        return state;
      }
      return {
        ...state,
        readTs: {
          ...state.readTs,
          [cid]: Date.now() + TIME_DIFF_THREASHOLD,
        },
        unread: {
          ...state.unread,
          [cid]: false,
        },
      };
    }

    case 'SET_CHAT_CHANNEL': {
      const { cid } = action;
      return {
        ...state,
        readTs: {
          ...state.readTs,
          [cid]: Date.now() + TIME_DIFF_THREASHOLD,
        },
        unread: {
          ...state.unread,
          [cid]: false,
        },
      };
    }

    case 'MUTE_CHAT_CHANNEL': {
      const { cid } = action;
      return {
        ...state,
        mute: [
          ...state.mute,
          cid,
        ],
      };
    }

    case 'UNMUTE_CHAT_CHANNEL': {
      const { cid } = action;
      const mute = state.mute.filter((id) => (id !== cid));
      return {
        ...state,
        mute,
      };
    }

    default:
      return state;
  }
}