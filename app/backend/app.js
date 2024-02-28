require("dotenv").config();
const config = require("config");
const logger = require("./utilities/logger");
const Koa = require("koa");
const app = new Koa();
const port = config.get("port");

require("./startup/error-handling")(app);
require("./startup/routes")(app);

app.listen(port, () => logger.info(`Connected on port ${port}`));
