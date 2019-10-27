const express = require('express');
const bodyParser = require('body-parser');
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

const marketRouter = require('./routers/graphql');

// For GraphQL
const typeDefs = require('./graphql/typedefs');
const resolvers = require('./graphql/resolvers');


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

// const graphSchema = makeExecutableSchema({typeDefs, resolvers});
// app.use('/graphql', bodyParser.json(), graphqlExpress({ schema: graphSchema }));

const server = new ApolloServer({typeDefs, resolvers});

// app.use('/graph-market', marketRouter)

const router = AdminBroExpressjs.buildRouter(adminBro)
app.use(adminBro.options.rootPath, router)
// app.use(marketRouter)

app.use(express.json())
app.use(loggerMiddleware);

server.graphqlPath = '/data'
server.applyMiddleware({ app })
module.exports = app;