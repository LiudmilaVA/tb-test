import { useEffect, useState, useContext, createContext } from "react";
import {
  initializeSocket,
  emitRefreshTournamentRanking,
  setPriceUpdateListeners,
  setRefreshTournamentRankingListener,
  disconnectSocket,
} from "api/socketService";
import { useTournament } from "context/TournamentContext";
import { useParams } from "react-router-dom";
import Cookies from "js-cookie";

const SocketContext = createContext();

export const useSocket = () => {
  return useContext(SocketContext);
};

const useDynamic24hData = () => {
  const initial24hData = {
    high24h: null,
    low24h: null,
    change: null,
    percentage: null,
  };

  const [btc24hData, setBtc24hData] = useState({ ...initial24hData });
  const [eth24hData, setEth24hData] = useState({ ...initial24hData });
  const [avax24hData, setAvax24hData] = useState({ ...initial24hData });
  const [bnb24hData, setBnb24hData] = useState({ ...initial24hData });
  const [ada24hData, setAda24hData] = useState({ ...initial24hData });

  return {
    btc24hData,
    setBtc24hData,
    eth24hData,
    setEth24hData,
    avax24hData,
    setAvax24hData,
    bnb24hData,
    setBnb24hData,
    ada24hData,
    setAda24hData,
  };
};

export const SocketProvider = ({ children }) => {
  const { id } = useParams();

  const username = localStorage.getItem("username") ?? Cookies.get("username");
  const [btcPrice, setBtcPrice] = useState(null);
  const [ethPrice, setEthPrice] = useState(null);
  const [avaxPrice, setAvaxPrice] = useState(null);
  const [adaPrice, setAdaPrice] = useState(null);
  const [bnbPrice, setBnbPrice] = useState(null);

  const {
    btc24hData,
    setBtc24hData,
    eth24hData,
    setEth24hData,
    avax24hData,
    setAvax24hData,
    bnb24hData,
    setBnb24hData,
    ada24hData,
    setAda24hData,
  } = useDynamic24hData();

  const [btcOHLCV, setBtcOHLCV] = useState(null);
  const [socket, setSocket] = useState(null);
  const [tournamentRanking, setTournamentRanking] = useState({});
  const [socketConnected, setSocketConnected] = useState(false);
  const { tournamentDetails } = useTournament();
  const [rank, setRank] = useState(null);

  useEffect(() => {
    const initSocket = async () => {
      const token = localStorage.getItem("jwt") ?? Cookies.get("jwt");
      const tournamentId = tournamentDetails?.data?.id || id;

      const initializedSocket = await initializeSocket(
        token,
        tournamentId,
        () => setSocketConnected(true)
      );

      setSocket(initializedSocket);
      emitRefreshTournamentRanking();
      setPriceUpdateListeners(
        setBtcPrice,
        setEthPrice,
        setAvaxPrice,
        setAdaPrice,
        setBnbPrice,
        setBtcOHLCV,
        saveBtc24hData,
        saveEth24hData,
        saveAda24hData,
        saveAvax24hData,
        saveBnb24hData
      );
      setRefreshTournamentRankingListener(
        tournamentId,
        handleRefreshTournamentRanking
      );
    };

    initSocket();

    return () => {
      disconnectSocket();
    };
  }, [tournamentDetails]);

  useEffect(() => {
    const rank = calculateRank();
    setRank(rank);
  }, [tournamentDetails, tournamentRanking, btcPrice]);

  const calculateRank = () => {
    const sortedRanking = Object.entries(tournamentRanking).sort(
      ([, aBalances], [, bBalances]) => {
        const aTotalUSDT = aBalances.BTC * btcPrice + aBalances.USDT;
        const bTotalUSDT = bBalances.BTC * btcPrice + bBalances.USDT;
        return bTotalUSDT - aTotalUSDT;
      }
    );

    for (let i = 0; i < sortedRanking.length; i++) {
      if (sortedRanking[i][0] === username) {
        return i + 1;
      }
    }
    return "-";
  };

  const createSave24hDataFunction = (setDataFunction) => (data) => {
    setDataFunction({
      high24h: data.high24h,
      low24h: data.low24h,
      change: data.change,
      percentage: data.percentage,
    });
  };

  const saveBtc24hData = createSave24hDataFunction(setBtc24hData);
  const saveEth24hData = createSave24hDataFunction(setEth24hData);
  const saveAvax24hData = createSave24hDataFunction(setAvax24hData);
  const saveBnb24hData = createSave24hDataFunction(setBnb24hData);
  const saveAda24hData = createSave24hDataFunction(setAda24hData);

  // Define the handler for refreshTournamentRanking
  const handleRefreshTournamentRanking = (data) => {
    setTournamentRanking(data);
  };

  const value = {
    socket,
    btcPrice,
    ethPrice,
    avaxPrice,
    adaPrice,
    bnbPrice,
    tournamentRanking,
    rank,
    tournamentDetails,
    btcOHLCV,
    btc24hData,
    eth24hData,
    avax24hData,
    bnb24hData,
    ada24hData,
  };

  return (
    <SocketContext.Provider value={value}>{children}</SocketContext.Provider>
  );
};
