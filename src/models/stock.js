const mongoose = require('mongoose');
const StockTransaction = require('./stockTransaction');

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
    trend: {
        type: Number,
        default: 0
    },
    availableUnits: {
        type: Number,
        required: true,
        default: 30
    },
    isActive: {
        type: Boolean,
        required: true,
        default: true
    },
    market: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'Market'
    }
});

stockSchema.methods.buy = async function (user, units) {
    // Change price of stock by market trends and shit
    StockTransaction.generateAndPerform(this, user, units);
    this.populate('market').execPopulate();
    this.pricePerUnit  = this.pricePerUnit * units * this.market.priceRateChangeFactor
    await this.save()
}

const Stock = mongoose.model('Stock', stockSchema);

module.exports = Stock;