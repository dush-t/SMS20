const { app, server } = require('./app');

const port = process.env.PORT || 3000;

const httpServer = app.listen(port, () => {
    console.log("Server is up on port " + port);
});

server.installSubscriptionHandlers(httpServer);