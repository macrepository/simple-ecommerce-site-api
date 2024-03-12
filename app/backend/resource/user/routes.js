const { validateUser } = require("./helper");
const {
  validateReqId,
  validateReqBody,
  validateReqLogin,
} = require("../../middleware/joi-validate");
const {
  saveUser,
  getUser,
  patchUser,
  deleteUser,
  loginUser,
  userAccount,
} = require("./controller");
const { userAuth } = require("../../middleware/user-auth");

const Router = require("@koa/router");
const router = new Router({
  prefix: "/api/user",
});

router.get("/account", userAuth, userAccount);
router.post("/login", validateReqLogin(validateUser), loginUser);

router.post("/", validateReqBody(validateUser), saveUser);
router.get("/", getUser);
router.get("/:id", validateReqId(validateUser), getUser);
router.patch(
  "/:id",
  validateReqId(validateUser),
  validateReqBody(validateUser, true),
  patchUser
);
router.delete("/:id", validateReqId(validateUser), deleteUser);

module.exports = router;
