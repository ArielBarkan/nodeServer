const express = require('express');

const userRouters = require("./routers/user");

const app = express();

//DB connection details
require('./db/connection')

app.use((req, res, next) => {
    res.setHeader("Access-Control-Allow-Origin", "*");
    res.setHeader("Access-Control-Allow-Headers", "Origin, X-Requested-With, Content-Type, Accept");
    res.setHeader("Access-Control-Allow-Methods", "GET, POST, PATCH, DELETE, OPTIONS")
    next();
})

app.use(
    express.json(),
);
app.use(
    userRouters
);


app.use('', (req, res) => {
    res.send('Hello');
})




module.exports = app