const Market = require('../../models/market');
const Stock = require('../../models/stock');
const PubSub = require('../subscriptions');

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
            const stocks = await Stock.find({ ...args })
            return stocks
        }
    },

    Stock: {
        async market(parent, _, { dataloaders: { marketLoader } }) {
            return await marketLoader.load(parent.market)
        }
    },

    Mutation: {
        async buy(_, { sym, units }, context, info) {
            const stock = await Stock.findOne({ shortName: sym })
            await stock.buy(context.user, units)
            return stock
        },
        async sell(_, { sym, units }, context, info) {
            const stock = await Stock.findOne({ shortName: sym })
            await stock.sell(context.user, units)
            return stock
        }
    },

    Subscription: {
        stockUpdated: {
            subscribe: () => PubSub.asyncIterator("STOCK_UPDATED")
        }
    },
}

module.exports = schema