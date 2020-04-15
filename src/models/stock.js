const mongoose = require('mongoose')
const StockTransaction = require('./stockTransaction')

const stockSchema = new mongoose.Schema({
    name: {
        type: String,
        required: true
    },
    shortName: {
        type: String,
        required: true
    },
    pricePerUnit: {
        type: Number,
        required: true,
        default: 100
    },
    initialPricePerUnit: {
        type: Number,
        required: true,
        default: 10
    },
    priceTrail: [{
        price: {
            type: Number,
            required: true
        },
        timestamp: {
            type: Number,
            required: true
        }
    }],
    trend: {
        type: Number,
        default: 0
    },
    isActive: {
        type: Boolean,
        required: true,
        default: true
    },
    market: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'Market'
    },
    category: {
        type: String,
        required: true,
        default: 'Misc'
    }
});

stockSchema.index({ category: 1 })

stockSchema.methods.buy = async function (user, units) {
    if (user.balance < this.pricePerUnit * units) {
        throw new Error('Insufficient Balance!')
    } 

    let stockIsOwned = false
    user.stocksOwned = user.stocksOwned.map((stockOwned) => {
        if (!stockOwned.stock.equals(this._id)) {
            return stockOwned
        }

        stockIsOwned = true
        const newUnits = stockOwned.units + units;
        const newAvgPrice = (stockOwned.avgPricePerUnit * stockOwned.units + this.pricePerUnit * units) / newUnits
        return { stock: stockOwned.stock, units: newUnits, avgPricePerUnit: newAvgPrice}
    })

    if (!stockIsOwned) {
        user.stocksOwned = user.stocksOwned.concat({
            stock: this._id,
            units: units,
            avgPricePerUnit: this.pricePerUnit
        })
    }

    user.balance = user.balance - units * stock.pricePerUnit
    const stockTransaction = new StockTransaction({
        stock: this._id,
        user: user._id,
        units: units,
        costPerUnit: stock.pricePerUnit,
        type: 1
    })

    await stockTransaction.save()
    await user.save()
}

stockSchema.methods.sell = async function (user, units) {
    let stockIsOwned = false
    let stockSellout = false
    let selloutStock = ''
    
    user.stocksOwned = user.stocksOwned.map((stockOwned, i) => {
        if (!stockOwned.stock.equals(this._id)) {
            return stockOwned
        }
        stockIsOwned = true
        if (stockOwned.units < units) {
            throw new Error('Insufficient Units!')
        }

        const newUnits = stockOwned.units - units;
        let newAvgPrice = 0
        if (newUnits === 0) {
            stockSellout = true
            selloutStock = stockOwned.stock
        } else {
            newAvgPrice = (stockOwned.avgPricePerUnit * stockOwned.units - stock.pricePerUnit * units) / newUnits;
        }
        return { stock: stockOwned.stock, units: newUnits, avgPricePerUnit: newAvgPrice }
    })

    if (!stockIsOwned) {
        throw new Error('User does not own this stock!')
    }

    if (stockSellout) {
        user.stocksOwned = user.stocksOwned.filter((stockOwned) => !stockOwned.stock.equals(selloutStock))
    }

    user.balance = user.balance + units * this.pricePerUnit
    const stockTransaction = new StockTransaction({
        stock: this._id,
        user: user._id,
        units: units,
        costPerUnit: stock.pricePerUnit,
        type: -1
    })

    await stockTransaction.save()
    await user.save()
}

const Stock = mongoose.model('Stock', stockSchema)

module.exports = Stock