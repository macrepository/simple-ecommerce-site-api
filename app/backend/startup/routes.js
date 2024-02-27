const bodyParser = require("koa-bodyparser");
const customer = require("../resource/customer/routes");

module.exports = function (app) {
  app.use(bodyParser());

  app.use(customer.routes()).use(customer.allowedMethods());
};
