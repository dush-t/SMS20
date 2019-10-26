const express = require('express');
require('./db/mongoose');

const app = express();

// log all requests to terminal, just like django.
const loggerMiddleware = (req, res, next) => {
    console.log(req.method + ' ' + req.path);
    next();
}

app.use(express.json())
app.use(loggerMiddleware);

module.exports = app;