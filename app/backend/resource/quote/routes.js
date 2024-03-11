const { validateQuoteItem } = require("./item/helper");
const {
  saveQuoteItem,
  getQuoteItem,
  updateQuoteItem,
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

router.post("/item/", validateReqBody(validateQuoteItem), saveQuoteItem);
router.get("/item/:id", validateReqId(validateQuoteItem), getQuoteItem);
router.patch(
  "/item/:id",
  validateReqId(validateQuoteItem),
  validateReqBody(validateQuoteItem),
  updateQuoteItem
);
// router.delete("/item/:quoteId/:id", catchErrors(deleteQuoteItem));

router.post("/", validateReqBody(validateQuote), saveQuote);
router.get("/:id", validateReqId(validateQuote), getQuote);
router.patch(
  "/:id",
  validateReqId(validateQuote),
  validateReqBody(validateQuote),
  updateQuote
);
router.delete("/:id", validateReqId(validateQuote), deleteQuote);

// router.post("/payment/:quoteId", catchErrors(saveQuotePayment));
// router.get("/payment/:quoteId/:id", catchErrors(getQuotePayment));
// router.patch("/payment/:quoteId/:id", catchErrors(updateQuotePayment));
// router.delete("/payment/:quoteId/:id", catchErrors(deleteQuotePayment));

module.exports = router;
