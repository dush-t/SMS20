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
    User.find({}).populate({
        path: "stocksOwned.stock",
        model: "Stock",
        select: "pricePerUnit"
    }).then(async (users) => {

        users.forEach(user => {
            let stockPrice = 0
            user.stocksOwned.forEach(stock => {
                console.log(stock)
                stockPrice = stockPrice + stock.units * stock.stock.pricePerUnit
            })
            user.netWorth = stockPrice + user.balance
        })
        quickSort(users, 0, users.length - 1)
        const leaderboard = await Leaderboard.findOneAndUpdate({}, { leaderboard: users.reverse() })
        console.log(leaderboard)
        if (!leaderboard) {
            let leaderboard = new Leaderboard()
            leaderboard.leaderboard = users
            await leaderboard.save()
        }
    }).catch((e) => {
        console.log("Unable to query Database: ", e)
    })
}

const Leaderboard = mongoose.model("Leaderboard", leaderboardSchema)

module.exports = Leaderboard