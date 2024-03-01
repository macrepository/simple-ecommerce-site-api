const {
  saveCustomer,
  getCustomer,
  patchCustomer,
  deleteCustomer,
  loginCustomer,
  customerAccount,
} = require("./controller");
const { customerAuth } = require("../../middleware/customer-auth");
const { catchErrors } = require("../../middleware/async-exception-handler");
const Router = require("@koa/router");
const router = new Router({
  prefix: "/api/customer",
});

router.get("/account", customerAuth, customerAccount);
router.post("/login", catchErrors(loginCustomer));

router.post("/", catchErrors(saveCustomer));
router.get("/", catchErrors(getCustomer));
router.get("/:id", catchErrors(getCustomer));
router.patch("/:id", catchErrors(patchCustomer));
router.delete("/:id", catchErrors(deleteCustomer));
module.exports = router;
