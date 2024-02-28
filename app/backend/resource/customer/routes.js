const {
  saveCustomer,
  getCustomer,
  patchCustomer,
  deleteCustomer,
  loginCustomer,
  customerAccount,
} = require("./controller");
const customerAuth = require("../../middleware/customer-auth");
const Router = require("@koa/router");
const router = new Router({
  prefix: "/customer",
});

router.get("/account", customerAuth, customerAccount);
router.post("/login", loginCustomer);

router.post("/", saveCustomer);
router.get("/", getCustomer);
router.get("/:id", getCustomer);
router.patch("/:id", patchCustomer);
router.delete("/:id", deleteCustomer);
module.exports = router;
