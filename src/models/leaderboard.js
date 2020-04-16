const mongoose = require("mongoose")


const leaderboardSchema = new mongoose.Schema({
    name: {
        type: String,
        required: true,
        unique: true
    },
    leaderboard: {
        type: Array,
        default: [],
        required: true
    },
})



const Leaderboard = mongoose.model("Leaderboard", leaderboardSchema)

module.exports = Leaderboard