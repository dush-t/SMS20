const mongoose = require("mongoose")
const User = require("./user")
const Stock = require("./stock")
const quickSort = require("./../utils/quicksort")


const leaderboardSchema = new mongoose.Schema({
    leaderboard: {
        type: Array,
        default: [],
        required: true
    },
})

leaderboardSchema.statics.update = async () => {
    const users = await User.find({}).populate({
        path: "stocksOwned.stock",
        model: "Stock",
        select: "pricePerUnit"
    })  

    users.forEach(async user => {
        let stockPrice = 0
        user.stocksOwned.forEach(stockOwned => {
            stockPrice = stockPrice + stockOwned.units * stockOwned.stock.pricePerUnit
        })
        user.netWorth = stockPrice + user.balance
        await user.save
    })
    quickSort(users, 0, users.length - 1)
    const leaderboard = await Leaderboard.findOneAndUpdate({}, { leaderboard: users.reverse() })
    if (!leaderboard) {
        let leaderboard = new Leaderboard()
        leaderboard.leaderboard = users
        await leaderboard.save()
    }
}

const Leaderboard = mongoose.model("Leaderboard", leaderboardSchema)

module.exports = Leaderboard