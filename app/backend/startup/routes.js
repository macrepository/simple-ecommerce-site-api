const bodyParser = require("koa-bodyparser");
const customer = require("../resource/customer/routes");
const order = require("../resource/order/routes");
const quote = require("../resource/quote/routes");
const { catchErrors } = require("../middleware/async-exception-handler");

module.exports = function (app) {
  app.use(bodyParser());

  app.use(catchErrors);

  app.use(customer.routes()).use(customer.allowedMethods());
  app.use(quote.routes()).use(quote.allowedMethods());
  app.use(order.routes()).use(order.allowedMethods());
};
