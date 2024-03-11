import apiClient from "./apiClient";
import Cookies from "js-cookie";

apiClient.interceptors.request.use(
  (config) => {
    // Attaching the token from localStorage to Authorization header for each request
    const token = localStorage.getItem("jwt") ?? Cookies.get("jwt");

    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
  },
  (error) => {
    return Promise.reject(error);
  }
);

/**
 * Joins a tournament with the provided tournamentID.
 *
 * @param {string} tournamentID - The ID of the tournament to join.
 * @return {Promise<any>} The response data from the API call.
 */
export const joinTournament = async (tournamentID) => {
  try {
    const response = await apiClient.put(`/tournaments/${tournamentID}/join`);
    return response.data;
  } catch (error) {
    throw error.response ? error.response.data : error.message;
  }
};

/**
 * Retrieves the list of all tournaments.
 *
 * @return {Promise<any>} The response data from the API call.
 */
export const getAllTournaments = async () => {
  try {
    const response = await apiClient.get("/tournaments");
    return response.data;
  } catch (error) {
    throw error.response ? error.response.data : error.message;
  }
};

/**
 * Retrieves the details of a specific tournament.
 *
 * @param {string} tournamentID - The ID of the tournament.
 * @return {Promise<any>} The response data from the API call.
 */
export const getTournamentDetails = async (tournamentID) => {
  try {
    if (!tournamentID) {
      throw new Error("Tournament ID is required");
    }
    const response = await apiClient.get(
      `/tournaments/${tournamentID}?populate=*`
    );
    return response.data;
  } catch (error) {
    throw error.response ? error.response.data : error.message;
  }
};

/**
 * Retrieves the balances of a specific tournament.
 *
 * @param {string} tournamentID - The ID of the tournament.
 * @return {Promise<any>} The response data from the API call.
 */
export const getTournamentBalances = async (tournamentID) => {
  try {
    const response = await apiClient.get(
      `/balances?filters[tournament][id]=${tournamentID}&populate=tournament,user`
    );
    return response.data;
  } catch (error) {
    throw error.response ? error.response.data : error.message;
  }
};

/**
 * Retrieves the details of a specific crypto trading pair.
 *
 * @param {number} pairId - The ID of the crypto trading pair.
 * @return {Promise<any>} The response data from the API call.
 */
export const getCryptoTradingPairDetails = async (pairId) => {
  if (pairId) {
    try {
      const response = await apiClient.get(
        `/crypto-trading-pairs/${pairId}?populate=*`
      );
      return response.data;
    } catch (error) {
      throw error.response ? error.response.data : error.message;
    }
  }
};

/**
 * Retrieves the details of crypto trading pair list.
 *
 * @param {number} tournamentID - The ID of the tournament.
 * @return {Promise<any>} The response data from the API call.
 */
export const getCryptoTradingPairList = async (tournamentID) => {
  try {
    if (typeof tournamentID === "undefined" || tournamentID === null) {
      return {};
    }

    const response = await apiClient.get(
      `/tournaments/${tournamentID}?populate[market_type][on][market-types.crypto][populate][crypto_trading_pairs][populate]=*&populate[participants]=*`
    );
    const responseData = response.data;

    return responseData.data.attributes.market_type[0].crypto_trading_pairs
      .data;
  } catch (error) {
    throw error.response ? error.response.data : error.message;
  }
};

/**
 * Retrieves the ranking of a specific tournament.
 *
 * @param {number} tournamentID - The ID of the tournament.
 * @return {Promise<any>} The response data from the API call.
 */
export const getTournamentRanking = async (tournamentID) => {
  try {
    if (typeof tournamentID === "undefined" || tournamentID === null) {
      return {};
    }

    const response = await apiClient.get(
      `/tournaments/${tournamentID}/ranking`
    );
    const rankingData = response.data;

    // Convert the ranking values from string to number
    const convertedRanking = Object.entries(rankingData).reduce(
      (acc, [key, value]) => {
        acc[key] = parseFloat(value);
        return acc;
      },
      {}
    );

    return convertedRanking;
  } catch (error) {
    throw error.response ? error.response.data : error.message;
  }
};
