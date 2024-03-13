const { validateProduct } = require("./helper");
const {
  validateReqId,
  validateReqBody,
} = require("../../middleware/joi-validate");
const {
  saveProduct,
  getProduct,
  updateProduct,
  deleteProduct,
} = require("./controller");

const Router = require("@koa/router");
const router = new Router({
  prefix: "/api/product",
});

router.post("/", validateReqBody(validateProduct), saveProduct);
router.get("/:id", validateReqId(validateProduct), getProduct);
router.patch(
  "/:id",
  validateReqId(validateProduct),
  validateReqBody(validateProduct),
  updateProduct
);
router.delete("/:id", validateReqId(validateProduct), deleteProduct);

module.exports = router;
