const quotePaymentRoutes = require("./payment/routes");
const quoteItemRoutes = require("./item/routes");

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

router.use(
  "/payment",
  quotePaymentRoutes.routes(),
  quotePaymentRoutes.allowedMethods()
);
router.use("/item", quoteItemRoutes.routes(), quoteItemRoutes.allowedMethods());

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
