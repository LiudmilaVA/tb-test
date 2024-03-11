import React, { useEffect, useState } from "react";
import GraphFilter from "components/dashboard/GraphFilter";
import WrapAsset from "components/Assets/WrapAsset";
import { getCryptoTradingPairList } from "api/tournamentService";

import {
  Box,
  Wrap,
  Amount,
  Currency,
  BeltInformationDesktop,
  BeltInformationMobile,
  InfoBlock,
  Text,
  Title,
  GraphWrapper,
  InfoBox,
  Row,
  TitleSmall,
  Info,
  FlexWrap,
} from "./styled";
import { useSocket } from "utils/hooks/useSocket";
import { formatCurrency } from "utils";

import TradingView from "../TradingView";
import { useWalletData } from "context/WalletDataContext";
import moment from "moment";

const DEFAULT_TICKER = "btc";
const DEFAULT_PAIR = "BTC/USDT";

const GraphBox = (props: { tournamentDetails: any }) => {
  const { tournamentDetails } = props;
  const [timeLeft, setTimeLeft] = useState("");

  const [activeTime, setActiveTime] = useState("1m");
  const [chartType, setChartType] = useState("Candles");

  const {
    btcPrice,
    ethPrice,
    avaxPrice,
    rank,
    btc24hData,
    adaPrice,
    bnbPrice,
    ada24hData,
    avax24hData,
    bnb24hData,
  } = useSocket();

  const [price, setPrice] = useState(btcPrice);
  const [OHLCV, updateOHLCV] = useState(null);
  const [s24hData, save24hData] = useState(null);

  const [btcOHLCV, setBtcOHLCV] = useState(null);

  const { totalMoney, totalMoneyString } = useWalletData();

  const [tradingPairsList, setTradingPairsList] = useState([]);
  const [currentPair, setCurrentPair] = useState(DEFAULT_PAIR);
  const [currentTicker, setCurrentTicker] = useState(DEFAULT_TICKER);
  const [currency24hData, setCurrency24hData] = useState(btc24hData);

  const initialMoney = tournamentDetails?.data?.attributes?.amount_start || 1;
  const percentageChange = ((totalMoney - initialMoney) / initialMoney) * 100;

  const parseTotalMoney = formatCurrency(totalMoneyString);
  const parsePercentageChange = percentageChange.toFixed(2);

  const calculateTimeLeft = () => {
    const now = moment().utc();
    const end = moment.utc(tournamentDetails?.data?.attributes?.end_at);
    const duration = moment.duration(end.diff(now));

    const totalDays = Math.floor(duration.asDays());
    const hours = duration.hours();
    const minutes = duration.minutes();
    const seconds = duration.seconds();

    setTimeLeft(`${totalDays}d ${hours}h ${minutes}m ${seconds}s`);
  };

  useEffect(() => {
    calculateTimeLeft();
    const intervalId = setInterval(calculateTimeLeft, 1000);
    return () => clearInterval(intervalId);
  }, [tournamentDetails?.data?.attributes?.end_at]);

  useEffect(() => {
    const checkTournamentPairList = async () => {
      const tournamentId = tournamentDetails?.data?.id;

      if (tournamentId) {
        try {
          const apiData = await getCryptoTradingPairList(tournamentId);
          setTradingPairsList(apiData);
        } catch (error) {
          console.error("Error fetching tournament pair id:", error);
        }
      }
    };

    checkTournamentPairList();
  }, [tournamentDetails?.data?.id]);

  useEffect(() => {}, [currentPair]);

  const handleCurrencyButtonClick = ({ ticker, pair }) => {
    setCurrentPair(pair);
    setCurrentTicker(ticker);

    const tickerToPriceMap = {
      [DEFAULT_TICKER]: btcPrice,
      ADA: adaPrice,
      AVAX: avaxPrice,
      BNB: bnbPrice,
    };

    const tickerTo24hDataMap = {
      [DEFAULT_TICKER]: btc24hData,
      ADA: ada24hData,
      AVAX: avax24hData,
      BNB: bnb24hData,
    };

    setPrice(tickerToPriceMap[ticker]);
    const selectedCurrency24hData = tickerTo24hDataMap[ticker];
    if (selectedCurrency24hData) {
      setCurrency24hData(selectedCurrency24hData);
    } else {
      console.warn(`No 24H data available for ${ticker}`);
    }
  };

  const buttonStyle = {
    padding: "8px 12px",
    margin: "4px",
    border: "1px solid #ccc",
    borderRadius: "4px",
    backgroundColor: "#f0f0f0",
    cursor: "pointer",
    fontWeight: "bold",
  };

  return (
    <>
      <Box>
        <Wrap>
          <FlexWrap>
            <BeltInformationDesktop>
              <Currency>{currentPair}</Currency>
              <Amount>{formatCurrency(price)}</Amount>

              <InfoBlock>
                <Title>24h Change</Title>
                <Text
                  className={
                    currency24hData.change >= 0 ? "up_state" : "down_state"
                  }>
                  {formatCurrency(currency24hData.change)}
                  {currency24hData.percentage >= 0
                    ? ` +${currency24hData?.percentage?.toFixed(2)}%`
                    : ` ${currency24hData?.percentage?.toFixed(2)}%`}
                </Text>
              </InfoBlock>
              <InfoBlock>
                <Title>24h High</Title>
                <Text>{formatCurrency(currency24hData.high24h)}</Text>
              </InfoBlock>
              <InfoBlock>
                <Title>24h Low</Title>
                <Text>{formatCurrency(currency24hData.low24h)}</Text>
              </InfoBlock>
            </BeltInformationDesktop>
            <BeltInformationMobile>
              <Row>
                <InfoBox>
                  <TitleSmall>Total asset value</TitleSmall>
                  <Info>
                    {parseTotalMoney && <>{parseTotalMoney} USDT </>}
                    <span
                      className={`${
                        percentageChange >= 0 ? "up_state" : "down_state"
                      }`}>
                      {percentageChange >= 0
                        ? parsePercentageChange && (
                            <>+{parsePercentageChange}%</>
                          )
                        : parsePercentageChange && (
                            <>{parsePercentageChange}%</>
                          )}
                    </span>
                  </Info>
                </InfoBox>
              </Row>
              <Row>
                <InfoBox>
                  <TitleSmall>Time Left</TitleSmall>
                  <Info>{timeLeft}</Info>
                </InfoBox>
              </Row>
              <Row>
                <InfoBox>
                  <TitleSmall>Rank</TitleSmall>
                  <Info>
                    <span
                      className={`${
                        percentageChange >= 0 ? "up_state" : "down_state"
                      }`}>
                      {rank}
                    </span>
                  </Info>
                </InfoBox>
              </Row>
            </BeltInformationMobile>
            <WrapAsset />
          </FlexWrap>
          <Currency className="hideDesktop">{currentPair}</Currency>
          <GraphFilter
            activeTime={activeTime}
            setActiveTime={setActiveTime}
            chartType={chartType}
            setChartType={setChartType}
          />
          <GraphWrapper>
            <TradingView
              activeTime={activeTime}
              chartType={chartType}
            />
          </GraphWrapper>
        </Wrap>
      </Box>
      <Box>
        {tradingPairsList.map(({ id, attributes }) => (
          <button
            key={id}
            id={id}
            type="button"
            style={buttonStyle}
            onClick={() =>
              handleCurrencyButtonClick({
                ticker: attributes.base.data.attributes.short_name,
                pair: attributes.name,
              })
            }>
            {`${attributes.name}`}
          </button>
        ))}
      </Box>
    </>
  );
};

export default GraphBox;
