const { validateQuotePayment } = require("./payment/helper");
const {
  saveQuotePayment,
  getQuotePayment,
  updateQuotePayment,
  deleteQuotePayment,
} = require("./payment/controller");
const { validateQuoteItem } = require("./item/helper");
const {
  saveQuoteItem,
  getQuoteItem,
  updateQuoteItem,
  deleteQuoteItem,
} = require("./item/controller");
const { validateQuote } = require("./helper");
const {
  validateReqId,
  validateReqBody,
} = require("../../middleware/joi-validate");
const {
  saveQuote,
  getQuote,
  updateQuote,
  deleteQuote,
} = require("./controller");
const Router = require("@koa/router");
const router = new Router({
  prefix: "/api/quote",
});

router.post(
  "/payment/",
  validateReqBody(validateQuotePayment),
  saveQuotePayment
);
router.get(
  "/payment/:id",
  validateReqId(validateQuotePayment),
  getQuotePayment
);
router.patch(
  "/payment/:id",
  validateReqId(validateQuotePayment),
  validateReqBody(validateQuotePayment),
  updateQuotePayment
);
router.delete(
  "/payment/:id",
  validateReqId(validateQuotePayment),
  deleteQuotePayment
);

router.post("/item/", validateReqBody(validateQuoteItem), saveQuoteItem);
router.get("/item/:id", validateReqId(validateQuoteItem), getQuoteItem);
router.patch(
  "/item/:id",
  validateReqId(validateQuoteItem),
  validateReqBody(validateQuoteItem),
  updateQuoteItem
);
router.delete("/item/:id", validateReqId(validateQuoteItem), deleteQuoteItem);

router.post("/", validateReqBody(validateQuote), saveQuote);
router.get("/:id", validateReqId(validateQuote), getQuote);
router.patch(
  "/:id",
  validateReqId(validateQuote),
  validateReqBody(validateQuote),
  updateQuote
);
router.delete("/:id", validateReqId(validateQuote), deleteQuote);

module.exports = router;
