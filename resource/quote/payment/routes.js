const { validateQuotePayment } = require("./helper");
const {
  validateReqId,
  validateReqBody,
} = require("../../../middleware/joi-validate");
const {
  saveQuotePayment,
  getQuotePayment,
  updateQuotePayment,
  deleteQuotePayment,
} = require("./controller");

const Router = require("@koa/router");
const router = new Router();

router.post("/", validateReqBody(validateQuotePayment), saveQuotePayment);
router.get("/:id", validateReqId(validateQuotePayment), getQuotePayment);
router.patch(
  "/:id",
  validateReqId(validateQuotePayment),
  validateReqBody(validateQuotePayment),
  updateQuotePayment
);
router.delete("/:id", validateReqId(validateQuotePayment), deleteQuotePayment);

module.exports = router;
