const { validatePayment } = require("./helper");
const {
  validateReqId,
  validateReqBody,
} = require("../../middleware/joi-validate");
const {
  savePayment,
  getPayment,
  updatePayment,
  deletePayment,
} = require("./controller");

const Router = require("@koa/router");
const router = new Router({
  prefix: "/api/payment",
});

router.post("/", validateReqBody(validatePayment), savePayment);
router.get("/:id", validateReqId(validatePayment), getPayment);
router.patch(
  "/:id",
  validateReqId(validatePayment),
  validateReqBody(validatePayment),
  updatePayment
);
router.delete("/:id", validateReqId(validatePayment), deletePayment);

module.exports = router;
