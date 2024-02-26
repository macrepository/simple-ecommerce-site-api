const customer = require("../resource/customer/routes");

module.exports = function (app) {
  app.use(customer.routes()).use(customer.allowedMethods());
};
