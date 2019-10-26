const jwt = require('jsonwebtoken');
const User = require('../models/user');
try {
    const config = require('../../config/config') || undefined;
} catch (e) {
    console.log(e);
}


const auth = async (req, res, next) => {
    try {
        const token = req.header('Authorization').replace('Bearer ', '');
        const decoded = jwt.verify(token, process.env.JWT_SECRET || config.JWT_SECRET);
        const user = await User.findOne({ _id: decoded._id, 'tokens.token': token });

        if (!user) {
            throw new Error();
        }

        req.user = user;
        req.token = token;
        next();
    } catch (e) {
        res.status(401).send({ error: 'Please authenticate first.' })
    }
}

module.exports = auth;