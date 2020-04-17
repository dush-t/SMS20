const iex = require('iexcloud_api_wrapper')
const Stock = require("../models/stock")

// IEX Api
const quote = async (stock) => {
    sym = stock.shortName
    const quoteData = await iex.quote(sym);
    qd = quoteData
    stock.pricePerUnit = qd.latestPrice
    await stock.save()
}


const fetch = async () => {
    const stocks = await Stock.find({})
    stocks.forEach(stock => {
        quote(stock)
    })
}


const noDelaySetInterval = async (func, interval) => {
    func()
    return setInterval(func, interval)
}

// Interval(in ms) in which the stock market data is syncronised with the real data.
const interval = process.env.INTERVAL || 60 * 60 * 1000

module.exports = {
    fetch, noDelaySetInterval, interval
}