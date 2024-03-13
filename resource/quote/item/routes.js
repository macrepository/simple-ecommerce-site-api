const { validateQuoteItem } = require("./helper");
const {
  validateReqId,
  validateReqBody,
} = require("../../../middleware/joi-validate");
const {
  saveQuoteItem,
  getQuoteItem,
  updateQuoteItem,
  deleteQuoteItem,
} = require("./controller");

const Router = require("@koa/router");
const router = new Router();

router.post("/", validateReqBody(validateQuoteItem), saveQuoteItem);
router.get("/:id", validateReqId(validateQuoteItem), getQuoteItem);
router.patch(
  "/:id",
  validateReqId(validateQuoteItem),
  validateReqBody(validateQuoteItem),
  updateQuoteItem
);
router.delete("/:id", validateReqId(validateQuoteItem), deleteQuoteItem);

module.exports = router;
