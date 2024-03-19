const cors = require("@koa/cors");
const bodyParser = require("koa-bodyparser");
const user = require("../resource/user/routes");
const customer = require("../resource/customer/routes");
const order = require("../resource/order/routes");
const quote = require("../resource/quote/routes");
const payment = require("../resource/payment/routes");
const category = require("../resource/category/routes");
const product = require("../resource/product/routes");
const { catchErrors } = require("../middleware/async-exception-handler");

module.exports = function (app) {
  app.use(cors());
  app.use(bodyParser());

  app.use(catchErrors);

  app.use(user.routes()).use(user.allowedMethods());
  app.use(customer.routes()).use(customer.allowedMethods());
  app.use(quote.routes()).use(quote.allowedMethods());
  app.use(order.routes()).use(order.allowedMethods());
  app.use(payment.routes()).use(payment.allowedMethods());
  app.use(category.routes()).use(category.allowedMethods());
  app.use(product.routes()).use(product.allowedMethods());
};
