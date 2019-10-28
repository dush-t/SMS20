const User = require('../../models/user');
const StockTransaction = require('../../models/stockTransaction');

const resolver = {
    Query: {
        async user(_, args) {
            const user = await User.findById(args._id).populate('stocksOwned.stock');
            return user;
        }
    },

    User: {
        async stockTransactions(parent, args) {
            const stockTransactions = await StockTransaction.find({user: parent._id});
            return stockTransactions;
        }
    }
}

module.exports = resolver;