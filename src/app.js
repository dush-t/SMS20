const express = require('express')
const bodyParser = require('body-parser')
const AdminBro = require('admin-bro')
const AdminBroExpressjs = require('admin-bro-expressjs')
const AdminBroMongoose = require('admin-bro-mongoose')
const { ApolloServer, gql } = require('apollo-server-express')

// To configure IEX Api
const iex = require('iexcloud_api_wrapper')

const buildDataloaders = require('./graphql/dataloaders')

// Initialize database connection
require('./db/mongoose')

const User = require('./models/user')
const Market = require('./models/market')
const Stock = require('./models/stock')
const Leaderboard = require("./models/leaderboard")
const StockTransaction = require('./models/stockTransaction')

const auth = require('./middleware/auth')

const quickSort = require("./utils/quicksort")

const app = express();

// Setup Admin Panel
AdminBro.registerAdapter(AdminBroMongoose)
const adminBro = new AdminBro({
    resources: [User, Market, Stock, StockTransaction, Leaderboard],
    rootPath: '/admin',
})
const router = AdminBroExpressjs.buildRouter(adminBro)

// IEX Api
const quote = async (stock) => {
    sym = stock.shortName
    const quoteData = await iex.quote(sym);
    qd = quoteData
    stock.pricePerUnit = qd.latestPrice
    stock.save()
}


const fetch = async () => {
    const stocks = await Stock.find({})
    for (let i = 0; i < stocks.length; i++) {
        await quote(stocks[i])
    }
}

// This has a slightly different form setInterval function as it runs instantaneously for the first time
// and then runs after the defined period of time
const noDelaySetInterval = async (func, interval) => {
    func()
    return setInterval(func, interval)
}

// Interval(in ms) in which the stock market data is syncronised with the real data.
const interval = process.env.INTERVAL || 60 * 60 * 1000


noDelaySetInterval(fetch, interval)

noDelaySetInterval(Leaderboard.update, interval)

// Log requests to terminal
const loggerMiddleware = (req, res, next) => {
    console.log(req.method + ' ' + req.path);
    next();
}

// For GraphQL
const typeDefs = require('./graphql/typedefs')
const resolvers = require('./graphql/resolvers')

const server = new ApolloServer({
    typeDefs,
    resolvers,
    introspection: true,
    playground: true,
    context: ({ req }) => {
        return {
            user: req.user,
            authenticated: req.authenticated,
            dataloaders: buildDataloaders()
        }
    }
});


app.use(adminBro.options.rootPath, router)
app.use(express.json())
app.use(loggerMiddleware);
app.use(auth);  // Doing stuff Django style

server.graphqlPath = '/data'
server.applyMiddleware({ app })
module.exports = app;