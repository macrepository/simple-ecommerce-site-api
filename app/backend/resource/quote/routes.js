const {
  saveQuote,
  getQuote,
  updateQuote,
  deleteQuote
} = require("./controller");
const { catchErrors } = require("../../middleware/async-exception-handler");
const Router = require("@koa/router");
const router = new Router({
  prefix: "/api/quote",
});

router.post("/", catchErrors(saveQuote));
router.get("/:id", catchErrors(getQuote));
router.patch("/:id", catchErrors(updateQuote));
router.delete("/:id", catchErrors(deleteQuote));

// router.post("/item/:quoteId", catchErrors(saveQuoteItem));
// router.get("/item/:quoteId/:id", catchErrors(getQuoteItem));
// router.patch("/item/:quoteId/:id", catchErrors(updateQuoteItem));
// router.delete("/item/:quoteId/:id", catchErrors(deleteQuoteItem));

// router.post("/payment/:quoteId", catchErrors(saveQuotePayment));
// router.get("/payment/:quoteId/:id", catchErrors(getQuotePayment));
// router.patch("/payment/:quoteId/:id", catchErrors(updateQuotePayment));
// router.delete("/payment/:quoteId/:id", catchErrors(deleteQuotePayment));

module.exports = router;
