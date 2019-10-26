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
    },
    type: {
        type: Number,
        required: true,
        default: 1
    }
}, {
    timestamps: true
});


/*
    stock -> The stock that the user wants to buy
    user  -> The user who wanna buy the stock
    units -> The number of units of the stock that the user wants to buy
    type  -> Equals 1 if user wants to buy, -1 if the user wants to sell.
             The values 1 and -1 are chosen because multiplying them to 
             quantities allows us to conditionally add or subtract. Useful.
*/
stockTransactionSchema.statics.generateAndPerform = async function (stock, user, units, type) {

    if (type === 1) {
        if (user.balance < stock.pricePerUnit * units) {
            throw new Error('Insufficient Balance!')
        }
    }

    let stockIsOwned = false    // Does user own any of this stock already?
    let stockSellout = false    // Does the user want to sellout this stock?
    let selloutStock = ''       // Which stock did the user just sell out?
    
    // This is potentially expensive. Find a way to optimize this.
    user.stocksOwned = user.stocksOwned.map((stockOwned, index) => {
        if (stockOwned.stock.equals(stock._id)) {
            if (type === -1 && stockOwned.units < units) {
                throw new Error('User does not have sufficient stock units to sell stock')
            }
            stockIsOwned = true
            const newUnits = stockOwned.units + units * type // if type is -1, stock will be sold automatically. Ugly, but works.
            
            let newAvgPrice = 0
            if (newUnits === 0) {
                stockSellout = true;
                selloutStock = stockOwned.stock;
            } else {
                newAvgPrice = (stockOwned.avgPricePerUnit * stockOwned.units + stock.pricePerUnit * units * type) / newUnits;
            }
            return {stock: stockOwned.stock, units: newUnits, avgPricePerUnit: newAvgPrice};
            
        } else {
            return stockOwned;
        }
    })

    if (stockSellout && type === -1) {
        user.stocksOwned = user.stocksOwned.filter((stockOwned) => !stockOwned.stock.equals(selloutStock))
    }

    if (!stockIsOwned) {
        if (type === -1) {
            throw new Error('User does not own this stock')
        }
        user.stocksOwned = user.stocksOwned.concat({
            stock: stock._id,
            units: units,
            avgPricePerUnit: stock.pricePerUnit
        })
    }

    user.balance = user.balance - units * stock.pricePerUnit * type

    const stockTransaction = new StockTransaction({
        stock: stock._id,
        user: user._id,
        units: units,
        costPerUnit: stock.pricePerUnit,
        type: type
    })

    // Database writes will happen only if there are not exceptions
    await stockTransaction.save()
    await user.save()
}

const StockTransaction = mongoose.model('StockTransaction', stockTransactionSchema);

module.exports = StockTransaction;