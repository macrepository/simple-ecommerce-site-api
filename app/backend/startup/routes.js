const bodyParser = require("koa-bodyparser");
const customer = require("../resource/customer/routes");
const quote = require("../resource/quote/routes");

module.exports = function (app) {
  app.use(bodyParser());

  app.use(customer.routes()).use(customer.allowedMethods());
  app.use(quote.routes()).use(quote.allowedMethods());
};
