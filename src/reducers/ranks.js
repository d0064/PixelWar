
const initialState = {
  lastFetch: 0,
  totalPixels: 0,
  dailyTotalPixels: 0,
  ranking: 1488,
  dailyRanking: 1488,
  // global stats
  /*
   * {
   *   total: totalUsersOnline,
   *   canvasId: onlineAtCanvas,
   * }
   */
  online: {
    total: 0,
  },
  totalRanking: [],
  totalDailyRanking: [],
};

export default function ranks(
  state = initialState,
  action,
) {
  switch (action.type) {
    case 'PLACED_PIXELS': {
      let { totalPixels, dailyTotalPixels } = state;
      const { amount } = action;
      totalPixels += amount;
      dailyTotalPixels += amount;
      return {
        ...state,
        totalPixels,
        dailyTotalPixels,
      };
    }

    case 'RECEIVE_ONLINE': {
      const { online } = action;
      return {
        ...state,
        online,
      };
    }

    case 'RECEIVE_ME':
    case 'LOGIN': {
      const {
        totalPixels,
        dailyTotalPixels,
        ranking,
        dailyRanking,
      } = action;
      return {
        ...state,
        totalPixels,
        dailyTotalPixels,
        ranking,
        dailyRanking,
      };
    }

    case 'RECEIVE_STATS': {
      const { totalRanking, totalDailyRanking } = action;
      const lastFetch = Date.now();
      return {
        ...state,
        lastFetch,
        totalRanking,
        totalDailyRanking,
      };
    }

    default:
      return state;
  }
}
