const StockTransaction = require("../../models/stockTransaction");
const User = require("../../models/user");
const Stock = require("../../models/stock");

const resolver = {
  Query: {
    async stockTransaction(_, args) {
      const stockTransaction = await StockTransaction.findById(args._id);
      return stockTransaction;
    },

    async stockTransactions(_, args) {
      const stockTransactions = await StockTransaction.find({ ...args });
      return stockTransactions;
    },
  },
  StockTransaction: {
    async stock(parent, _, { dataloaders: { stockLoader } }) {
      return await stockLoader.load(parent.stock);
    },

    async user(parent, _, { dataloaders: { userLoader } }) {
      return await userLoader.load(parent.user);
    },
  },
};

module.exports = resolver;
