const User = require("../../models/user");
// const Stock = require('../../models/stock');

const resolver = {
  Query: {
    async stocksOwned(parent, args) {
      return parent.stocksOwned;
    },
  },

  StockOwned: {
    async stock(parent, _, { dataloaders: { stockLoader } }) {
      return await stockLoader.load(parent.stock);
    },
  },
};

module.exports = resolver;
