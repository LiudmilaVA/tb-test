import { io } from "socket.io-client";
import { getTournamentRanking } from "./tournamentService";
export let socket;
export const initializeSocket = async (token, tournamentId, onConnect) => {
  if (!socket?.connected && tournamentId && token) {
    socket = io(process.env.REACT_APP_SOCKET_ENDPOINT, {
      withCredentials: true,
      query: {
        token: token,
        tournamentId: tournamentId,
      },
    });

    socket.on("connect", onConnect);
  }
  return socket;
};

export const makeTrade = (tradePayload, callback) => {
  if (socket) {
    socket.emit("makeTrade", tradePayload, callback);
  }
};

export const setPriceUpdateListeners = (
  updateBtcPrice,
  updateEthPrice,
  updateAvaxPrice,
  updateAdaPrice,
  updateBnbPrice,
  updateBtcOHLCV,
  saveBtc24h,
  saveEth24h,
  saveAvax24h,
  saveAda24h,
  saveBnb24h
) => {
  if (socket) {
    const createPriceUpdateListener =
      (currency, updatePrice, save24hData) => (data) => {
        updatePrice(data?.last);
        save24hData(data);
      };

    socket.on(
      "btcPriceUpdate",
      createPriceUpdateListener("btc", updateBtcPrice, saveBtc24h)
    );
    socket.on(
      "ethPriceUpdate",
      createPriceUpdateListener("eth", updateEthPrice, saveEth24h)
    );
    socket.on(
      "avaxPriceUpdate",
      createPriceUpdateListener("avax", updateAvaxPrice, saveAvax24h)
    );
    socket.on(
      "adaPriceUpdate",
      createPriceUpdateListener("ada", updateAdaPrice, saveAda24h)
    );
    socket.on(
      "bnbPriceUpdate",
      createPriceUpdateListener("bnb", updateBnbPrice, saveBnb24h)
    );
    socket.on("btcOHLCV", updateBtcOHLCV);
    // socket.on("btcPriceUpdate", (data) => {
    //   updateBtcPrice(data?.last);
    //   saveBtc24h(data);
    // });

    // socket.on("ethPriceUpdate", (data) => {
    //   updateEthPrice(data?.last);
    //   saveEth24h(data);
    // });

    // socket.on(`avaxPriceUpdate`, (data) => {
    //   updateAvaxPrice(data?.last);
    //   saveAvax24h(data);
    // });

    // socket.on(`adaPriceUpdate`, (data) => {
    //   updateAdaPrice(data?.last);
    //   saveAda24h(data);
    // });

    // socket.on(`bnbPriceUpdate`, (data) => {
    //   updateBnbPrice(data?.last);
    //   saveBnb24h(data);
    // });

    // socket.on("btcOHLCV", (data) => {
    //   updateBtcOHLCV(data);
    // });
  }
};

export const removePriceUpdateListeners = () => {
  if (socket) {
    socket.off("btcPriceUpdate");
    socket.off("ethPriceUpdate");
    socket.off("avaxPriceUpdate");
    socket.off("adaPriceUpdate");
    socket.off("bnbPriceUpdate");
    socket.off("btcOHLCV");
  }
};

export const disconnectSocket = () => {
  if (socket) {
    removePriceUpdateListeners();
    removeRefreshTournamentRankingListener();
    removeBtcOHLCVListener();
    socket.disconnect();
    socket = null;
  }
};

export const setTradingUpdateListener = (updateTrading) => {
  if (socket) {
    socket.on("getTrading", (data) => {
      updateTrading(data);
    });
  }
};

export const removeTradingUpdateListener = () => {
  if (socket) {
    socket.off("getTrading");
  }
};

export const requestTradingData = (tournamentId, callback) => {
  if (!tournamentId || !socket) return;
  socket.emit("getTrading", { tournament: tournamentId }, callback);
};

export const requestWalletData = (tournamentId, callback) => {
  if (!tournamentId || !socket) return;
  socket.emit("getWallets", { tournament: tournamentId }, callback);
};

export const emitRefreshTournamentRanking = (data, callback) => {
  if (socket) {
    socket.emit("refreshTournamentRanking", data, callback);
  }
};

export const setRefreshTournamentRankingListener = async (
  tournamentId,
  callback
) => {
  if (socket) {
    socket.on("refreshTournamentRanking", (data) => {
      if (data && Object.keys(data).length > 0) {
        callback(data);
      }
    });
  } else {
    console.log("No socket available for real-time updates");
    try {
      const apiData = await getTournamentRanking(tournamentId);
      if (apiData && Object.keys(apiData).length > 0) {
        callback(apiData);
      }
    } catch (error) {
      console.error("Error fetching initial tournament ranking:", error);
    }
  }
};

export const removeRefreshTournamentRankingListener = () => {
  if (socket) {
    socket.off("refreshTournamentRanking");
  }
};

export const setBtcOHLCVListener = (callback) => {
  if (socket) {
    socket.on("btcOHLCV", (data) => {
      callback(data);
    });
  }
};

export const removeBtcOHLCVListener = () => {
  if (socket) {
    socket.off("btcOHLCV");
  }
};

export const emitChangeOHLCVTimeframe = (payload, callback) => {
  if (socket) {
    socket.emit("changeOHLCVtimeframe", payload, callback);
  }
};
