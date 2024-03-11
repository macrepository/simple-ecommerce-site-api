const { validateOrderItem } = require("./helper");
const {
  validateReqId,
  validateReqBody,
} = require("../../../middleware/joi-validate");
const {
  saveOrderItem,
  getOrderItem,
  updateOrderItem,
  deleteOrderItem,
} = require("./controller");

const Router = require("@koa/router");
const router = new Router();

router.post("/", validateReqBody(validateOrderItem), saveOrderItem);
router.get("/:id", validateReqId(validateOrderItem), getOrderItem);
router.patch(
  "/:id",
  validateReqId(validateOrderItem),
  validateReqBody(validateOrderItem),
  updateOrderItem
);
router.delete("/:id", validateReqId(validateOrderItem), deleteOrderItem);

module.exports = router;
