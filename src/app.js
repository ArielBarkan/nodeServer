const express = require('express');

const v1routers = require("./routers/v1routes");
const {createJsonResponse} = require("./db/functions/user"); 
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
    v1routers
);

app.use('/api/v2/*', (req, res) => {
    res.status(404).send(
        createJsonResponse(0, "API V2 not supported yet")
      );
})


app.use('', (req, res) => {
    res.status(404).send(
        createJsonResponse(0, "404")
      );
})


module.exports = app