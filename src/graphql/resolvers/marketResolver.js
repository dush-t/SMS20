const Market = require("../../models/market");
const Stock = require("../../models/stock");

const schema = {
  Query: {
    async markets() {
      const markets = await Market.find({});
      return markets;
    },
    async market(_, args) {
      const market = await Market.findOne(args);
      return market;
    },
  },

  Market: {
    async stocks(parent) {
      const stocks = await Stock.find({ market: parent._id });
      return stocks;
    },
  },
};

module.exports = schema;
