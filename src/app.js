const express = require('express');
const AdminBro = require('admin-bro')
const AdminBroExpressjs = require('admin-bro-expressjs')

require('./db/mongoose');

const User = require('./models/user');
const Market = require('./models/market');
const Stock = require('./models/stock');
const StockTransaction = require('./models/stockTransaction');

const marketRouter = require('./routers/graphql');

const app = express();

AdminBro.registerAdapter(require('admin-bro-mongoose'))

const adminBro = new AdminBro({
    resources: [User, Market, Stock, StockTransaction],
    rootPath: '/admin',
})


// log all requests to terminal, just like django.
const loggerMiddleware = (req, res, next) => {
    console.log(req.method + ' ' + req.path);
    next();
}

var express_graphql = require('express-graphql');
var { buildSchema } = require('graphql');// GraphQL schema
var schema = buildSchema(`
    type Query {
        message: String
    }
`);// Root resolver
var root = {
    message: () => 'Hello World!'
};// Create an express server and a GraphQL endpoint
app.use('/graphql', express_graphql({
    schema: schema,
    rootValue: root,
    graphiql: true
}));

app.use('/graph-market', marketRouter)

const router = AdminBroExpressjs.buildRouter(adminBro)
app.use(adminBro.options.rootPath, router)
app.use(marketRouter)

app.use(express.json())
app.use(loggerMiddleware);

module.exports = app;