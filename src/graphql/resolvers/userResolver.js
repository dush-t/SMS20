const User = require('../../models/user');
const StockTransaction = require('../../models/stockTransaction');

const resolver = {
    Query: {
        async user(_, args, {user}) {
            if (!args._id) {
                return user
            }

            user = await User.findById(args._id)
            return user
        }
    },

    User: {
        async stockTransactions(parent, args) {
            const stockTransactions = await StockTransaction.find({user: parent._id})
            return stockTransactions
        }
    }
}

module.exports = resolver;