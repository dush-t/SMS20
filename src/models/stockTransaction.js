const mongoose = require('mongoose');

const stockTransactionSchema = new mongoose.Schema({
    stock: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'Stock',
        required: true
    },
    user: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'User',
        requried: true
    },
    units: {
        type: Number,
        default: 1,
        required: true
    },
    costPerUnit: {
        type: Number,
        required: true
    }
}, {
    timestamps: true
});


// Add stock to user's portfolio
stockTransactionSchema.statics.generateAndPerform = async function (stock, user, units) {

    if (user.balance < stock.pricePerUnit * units) {
        throw new Error('Insufficient Balance!')
    }

    const stockTransaction = new StockTransaction({
        stock: stock._id,
        user: user._id,
        units: units,
        costPerUnit: stock.pricePerUnit
    })

    // This is potentially expensive. Find a way to optimize this.
    let stockIsOwned = false
    user.stocksOwned = user.stocksOwned.map((stockOwned) => {
        if (stockOwned.stock.equals(stock._id)) {
            stockIsOwned = true
            newUnits = stockOwned.units + units
            newAvgPrice = (stockOwned.avgPricePerUnit * stockOwned.units + stock.pricePerUnit * units) / newUnits
            return {stock: stockOwned.stock, units: newUnits, avgPricePerUnit: newAvgPrice}
        } else {
            return stockOwned
        }
    })

    if (!stockIsOwned) {
        user.stocksOwned = user.stocksOwned.concat({
            stock: stock._id,
            units: units,
            avgPricePerUnit: stock.pricePerUnit
        })
    }
    
    user.balance = user.balance - units * stock.pricePerUnit

    await stockTransaction.save()
    await user.save()
}

const StockTransaction = mongoose.model('StockTransaction', stockTransactionSchema);

module.exports = StockTransaction;