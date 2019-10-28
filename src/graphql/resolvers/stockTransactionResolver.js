const StockTransaction = require('../../models/stockTransaction');
const User = require('../../models/user');
const Stock = require('../../models/stock');

const resolver = {
    Query: {
        async StockTransaction(_, args) {
            const stockTransaction = await StockTransaction.findById(args._id).populate({
                path: 'stock',
                model: 'Stock'
            }).populate({
                path: 'user',
                model: 'User'
            })
            return stockTransaction;
        },

        async stockTransactions(_, args) {
            const stockTransactions = await StockTransaction.find(args).populate({
                path: 'stock',
                model: 'Stock'
            }).populate({
                path: 'user',
                model: 'User'
            });
            return stockTransactions;
        }
    }
}

module.exports = resolver;