const app = require("./app");
const configData = require('../config/env');

app.listen(configData.network.port, () => {
  console.log("Server is up on port ", configData.network.port);
});
