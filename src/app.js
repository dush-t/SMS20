const express = require('express');
const bodyParser = require('body-parser');
const iex = require('iexcloud_api_wrapper')
const AdminBro = require('admin-bro');
const AdminBroExpressjs = require('admin-bro-expressjs');

const { makeExecutableSchema } = require('graphql-tools');
// const { graphqlExpress } = require('apollo-server-express');
const { ApolloServer, gql } = require('apollo-server-express');

require('./db/mongoose');

const User = require('./models/user');
const Market = require('./models/market');
const Stock = require('./models/stock');
const StockTransaction = require('./models/stockTransaction');

// For GraphQL
const typeDefs = require('./graphql/typedefs');
const resolvers = require('./graphql/resolvers');


const app = express();

AdminBro.registerAdapter(require('admin-bro-mongoose'))

const adminBro = new AdminBro({
    resources: [User, Market, Stock, StockTransaction],
    rootPath: '/admin',
})

// IEX Api
const quote = async (sym) => {
    const quoteData = await iex.quote(sym);
    qd = quoteData

    const market = await Market.findOne({ name: qd.primaryExchange })

    if (!market) {
        await new Market({ name: qd.primaryExchange }).save()
    }

    const stock = await Stock.findOne({ shortName: qd.symbol })

    if (!stock) {
        console.log(stock)
        await new Stock({
            market: market.id,
            shortName: qd.symbol,
            name: qd.companyName,
            pricePerUnit: qd.latestPrice,
            initialPricePerUnit: qd.latestPrice,
        }).save()
    } else {
        stock.pricePerUnit = qd.latestPrice
    }

    console.log("Working!!")

}


const fetch = async () => {
    const stocks = await Stock.find({})
    for (let i = 0; i < stocks.length; i++) {
        await quote(stocks[i].shortName)
    }
}

// This has a slightly different form setInterval function as it runs instantaneously for the first time
// and then runs after the defined period of time
const noDelaySetInterval = (func, interval) => {
    func()
    return setInterval(func, interval)
}

// Interval(in ms) in which the stock market data is syncronised with the real data.
interval = 60 * 1000

noDelaySetInterval(fetch, interval)


// log all requests to terminal, just like django.
const loggerMiddleware = (req, res, next) => {
    console.log(req.method + ' ' + req.path);
    next();
}

// const graphSchema = makeExecutableSchema({typeDefs, resolvers});
// app.use('/graphql', bodyParser.json(), graphqlExpress({ schema: graphSchema }));

const server = new ApolloServer({ typeDefs, resolvers });

// app.use('/graph-market', marketRouter)

const router = AdminBroExpressjs.buildRouter(adminBro)
app.use(adminBro.options.rootPath, router)
// app.use(marketRouter)

app.use(express.json())
app.use(loggerMiddleware);

server.graphqlPath = '/data'
server.applyMiddleware({ app })
module.exports = app;