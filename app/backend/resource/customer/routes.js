const {
  saveCustomer,
  getCustomer,
  patchCustomer,
  deleteCustomer,
  loginCustomer,
} = require("./controller");
const Router = require("@koa/router");
const router = new Router({
  prefix: "/customer",
});

router.post("/", saveCustomer);
router.get("/", getCustomer);
router.get("/:id", getCustomer);
router.patch("/:id", patchCustomer);
router.delete("/:id", deleteCustomer);

router.post("/login", loginCustomer);

module.exports = router;
