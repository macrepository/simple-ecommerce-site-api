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
