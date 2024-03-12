const { validateCategory } = require("./helper");
const {
  validateReqId,
  validateReqBody,
} = require("../../middleware/joi-validate");
const {
  saveCategory,
  getCategory,
  updateCategory,
  deleteCategory,
} = require("./controller");

const Router = require("@koa/router");
const router = new Router({
  prefix: "/api/category",
});

router.post("/", validateReqBody(validateCategory), saveCategory);
router.get("/:id", validateReqId(validateCategory), getCategory);
router.patch(
  "/:id",
  validateReqId(validateCategory),
  validateReqBody(validateCategory),
  updateCategory
);
router.delete("/:id", validateReqId(validateCategory), deleteCategory);

module.exports = router;
