const DataLoader = require('dataloader')
const Market = require('../../models/market')

const batchById = async (keys) => {
    return await Market.find({_id: {$in: keys}})
}

const buildMarketDataLoader = () => new DataLoader(
    (keys) => batchById(keys), {
        cacheKeyFn: (key) => key.toString()
    }
)

module.exports = buildMarketDataLoader