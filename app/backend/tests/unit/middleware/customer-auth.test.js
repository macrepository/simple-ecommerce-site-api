const { generateToken } = require("../../../utilities/json-web-token");
const { customerAuth } = require("../../../middleware/customer-auth");

describe("middleware/customer-auth", () => {
  it("should populate the decoded JWT token to ctx request body customer and next should be called", () => {
    const customer = {
      id: 1,
      email: "johndoe@gmail.com",
    };
    const token = generateToken(customer);
    const ctx = {
      get: jest.fn().mockReturnValue(token),
      request: {
        body: {},
      },
    };
    const next = jest.fn();
    customerAuth(ctx, next);
    expect(ctx.request.body.customer).toMatchObject(customer);
    expect(next).toBeCalledTimes(1);
  });
});
