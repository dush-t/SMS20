const DataLoader = require('dataloader')

const buildUserDataLoader = require('./dataloaders/userDataLoader')
const buildStockDataLoader = require('./dataloaders/stockDataLoader')
const buildMarketDataLoader = require('./dataloaders/marketDataLoader')


module.exports = () => ({
    userLoader: buildUserDataLoader(),
    stockLoader: buildStockDataLoader(),
    marketLoader: buildMarketDataLoader(),
})