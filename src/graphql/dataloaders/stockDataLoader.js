const DataLoader = require('dataloader')
const Stock = require('../../models/stock')

const batchById = async (keys) => {
    return await Stock.find({_id: {$in: keys}})
}

const buildStockDataLoader = () => new DataLoader(
    (keys) => batchById(keys), {
        cacheKeyFn: (key) => key.toString()
    }
)

module.exports = buildStockDataLoader