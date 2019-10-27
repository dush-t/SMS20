const Market = require('../../models/market');
const Stock = require('../../models/stock');

const schema = {
    Query: {
        async stock(parent, args) {
            if (Object.keys(args).length === 0) {
                return null
            }
            const stock = await Stock.findOne(args);
            return stock;
        },

        async stocks(parent, args) {
            const stocks = await Stock.find(args)
            return stocks
        }
    },

    Stock: {
        async market(parent) {
            const market = await Market.findById(parent.market);
            return market
        }
    }
}

module.exports = schema