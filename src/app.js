const express = require('express')
const bodyParser = require('body-parser')
const AdminBro = require('admin-bro')
const AdminBroExpressjs = require('admin-bro-expressjs')
const AdminBroMongoose = require('admin-bro-mongoose')
const { ApolloServer, gql } = require('apollo-server-express')
const { fetch, interval, noDelaySetInterval } = require("./utils/iexApiConfig")
const dotEnv = require("dotenv");

// Configure environment variables
dotEnv.config();

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

    ; (async function () {
        await noDelaySetInterval(fetch, interval)
        await noDelaySetInterval(Leaderboard.update, interval)
    })()

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
    context: ({ req, connection }) => {
        const contextObj = {};
        if (req) {
            contextObj.user = req.user;
            contextObj.authenticated = req.authenticated;
        }
        contextObj.dataloaders = buildDataloaders();
        return contextObj;
    }
});


app.use(adminBro.options.rootPath, router)
app.use(express.json())
app.use(loggerMiddleware);
app.use(auth);  // Doing stuff Django style

app.use("/", (req, res, next) => {
    res.send({ message: "Backend servers are up running!" })
})

server.graphqlPath = '/data'
server.applyMiddleware({ app })
module.exports = { app, server };