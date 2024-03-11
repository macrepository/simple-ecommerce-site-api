const { validateOrderPayment } = require("./helper");
const {
  validateReqId,
  validateReqBody,
} = require("../../../middleware/joi-validate");
const {
  saveOrderPayment,
  getOrderPayment,
  updateOrderPayment,
  deleteOrderPayment,
} = require("./controller");

const Router = require("@koa/router");
const router = new Router();

router.post("/", validateReqBody(validateOrderPayment), saveOrderPayment);
router.get("/:id", validateReqId(validateOrderPayment), getOrderPayment);
router.patch(
  "/:id",
  validateReqId(validateOrderPayment),
  validateReqBody(validateOrderPayment),
  updateOrderPayment
);
router.delete("/:id", validateReqId(validateOrderPayment), deleteOrderPayment);

module.exports = router;
