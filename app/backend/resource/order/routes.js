const orderPaymentRoutes = require("./payment/routes");
const orderItemRoutes = require("./item/routes");

const { validateOrder } = require("./helper");
const {
  validateReqId,
  validateReqBody,
} = require("../../middleware/joi-validate");
const {
  saveOrder,
  getOrder,
  updateOrder,
  deleteOrder,
} = require("./controller");

const Router = require("@koa/router");
const router = new Router({
  prefix: "/api/order",
});

router.use(
  "/payment",
  orderPaymentRoutes.routes(),
  orderPaymentRoutes.allowedMethods()
);
router.use("/item", orderItemRoutes.routes(), orderItemRoutes.allowedMethods());

router.post("/", validateReqBody(validateOrder), saveOrder);
router.get("/:id", validateReqId(validateOrder), getOrder);
router.patch(
  "/:id",
  validateReqId(validateOrder),
  validateReqBody(validateOrder),
  updateOrder
);
router.delete("/:id", validateReqId(validateOrder), deleteOrder);

module.exports = router;
