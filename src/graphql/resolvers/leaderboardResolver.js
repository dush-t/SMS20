const Leaderboard = require("../../models/leaderboard");

const schema = {
  Query: {
    async leaderboard() {
      const leaderboard = await Leaderboard.find();
      return leaderboard;
    },
  },
};

module.exports = schema;
