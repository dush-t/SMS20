const User = require('../../models/user');
const StockTransaction = require('../../models/stockTransaction');
const bcrypt = require('bcryptjs');

const resolver = {
    Query: {
        async user(_, args, { user }) {
            if (!args._id) {
                return user
            }

            user = await User.findById(args._id)
            return user
        }
    },

    User: {
        async stockTransactions(parent, args) {
            const stockTransactions = await StockTransaction.find({ user: parent._id })
            return stockTransactions
        }
    },

    Mutation: {
        async register(_, { name, password, confirmPassword, email, bits_id }, context, info) {
            const user = new User({
                name,
                email,
                password,
                bits_id
            })
            await user.generateAuthToken()
            await user.save()
            return user
        },
        async login(_, { email, password }, context, info) {
            const user = await User.findOne({ email });
            console.log(user)
            if (!user) {
                throw Error("Invalid email")
            } else {
                const match = await bcrypt.compare(password, user.password);
                console.log(match)
                if (!match)
                    throw Error("Incorrect password");
                else
                    return user
            }
        }
    }
}

module.exports = resolver;