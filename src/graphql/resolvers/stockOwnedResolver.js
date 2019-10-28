const User = require('../../models/user');
// const Stock = require('../../models/stock');

const resolver = {
    Query: {
        async stocksOwned(parent, args) {
            // const user = await User.findById(parent._id).populate('stocksOwned.stock');
            return parent.stocksOwned;
        } 
    }
}

module.exports = resolver;