var express_graphql = require('express-graphql');
const express = require('express')
const Market = require('../models/market');

var { buildSchema } = require('graphql');// GraphQL schema


var schema = buildSchema(`
    type Query {
        market(id: String!): Market
        markets: [Market]
    },
    type Market {
        id: String
        name: String
        exchangeRate: Float
        priceRateChangeFactor: Float
        is_active: Boolean
        stocks: [Stock]
    },
    type Stock {
        name: String
        shortName: String
        pricePerUnit: Float
        initialPricePerUnit: Float
        trend: Int
        availableUnits: Int
        isActive: Boolean
        market: String
    }
`);

const getMarkets = async (args) => {
    const markets = await Market.find({})
    // console.log(markets)
    return markets 
}

const getMarket = async (args) => {
    _id = args.id;
    const market = await Market.findById(_id)
    console.log(market)
    return market
}


// Root resolver
const root = {
    markets: getMarkets,
    market: getMarket
};// Create an express server and a GraphQL endpoint

const marketRouter = express_graphql({
    schema: schema,
    rootValue: root,
    graphiql: true
})

module.exports = marketRouter;
