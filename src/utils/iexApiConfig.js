const iex = require("iexcloud_api_wrapper");
const Stock = require("../models/stock");
const subscriptions = require("../graphql/subscriptions");

// IEX Api
const quote = async (stock) => {
  sym = stock.shortName;
  try {
    const quoteData = await iex.quote(sym);
    qd = quoteData;
    stock.pricePerUnit = qd.latestPrice;
    subscriptions.publish("STOCK_UPDATED", {
      stockUpdated: stock,
    });
    await stock.save();
  } catch (e) {
    console.log(`Unable to fetch data for "${stock.name}"`);
  }
};

const fetch = async () => {
  const stocks = await Stock.find({});
  stocks.forEach((stock) => {
    quote(stock);
  });
};

const noDelaySetInterval = async (func, interval) => {
  func();
  return setInterval(func, interval);
};

// Interval(in ms) in which the stock market data is syncronised with the real data.
const interval = process.env.INTERVAL || 60 * 60 * 1000;

module.exports = {
  fetch,
  noDelaySetInterval,
  interval,
};
