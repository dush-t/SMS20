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

const StockTransaction = mongoose.model('StockTransaction', stockTransactionSchema);

module.exports = StockTransaction;