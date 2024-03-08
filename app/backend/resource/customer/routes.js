const { validateCustomer } = require("./helper");
const {
  validateReqId,
  validateReqBody,
} = require("../../middleware/joi-validate");
const {
  saveCustomer,
  getCustomer,
  patchCustomer,
  deleteCustomer,
  loginCustomer,
  customerAccount,
} = require("./controller");
const { customerAuth } = require("../../middleware/customer-auth");
const Router = require("@koa/router");
const router = new Router({
  prefix: "/api/customer",
});

router.get("/account", customerAuth, customerAccount);
router.post("/login", loginCustomer);

router.post("/", validateReqBody(validateCustomer), saveCustomer);
router.get("/", getCustomer);
router.get("/:id", validateReqId(validateCustomer), getCustomer);
router.patch(
  "/:id",
  validateReqId(validateCustomer),
  validateReqBody(validateCustomer, true),
  patchCustomer
);
router.delete("/:id", validateReqId(validateCustomer), deleteCustomer);
module.exports = router;
