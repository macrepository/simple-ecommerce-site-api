const { generateToken } = require("../../../utilities/json-web-token");
const { userAuth } = require("../../../middleware/user-auth");

describe("middleware/user-auth", () => {
  it("should populate the decoded JWT token to ctx request body user and next should be called", () => {
    const user = {
      id: 1,
      email: "johndoe@gmail.com",
    };
    const token = generateToken(user);
    const ctx = {
      get: jest.fn().mockReturnValue(token),
      request: {
        body: {},
      },
    };
    const next = jest.fn();
    userAuth(ctx, next);
    expect(ctx.request.body.user).toMatchObject(user);
    expect(next).toBeCalledTimes(1);
  });
});
