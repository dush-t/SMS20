const mongoose = require('mongoose')

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
    trend: {
        type: Number,
        default: 0
    }
})
