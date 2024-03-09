const errorHandling = require("../../../startup/error-handling");
let server;

describe("error handling", () => {
  beforeEach(() => {
    server = require("../../../app");
    errorHandling(server);
  });

  afterEach(async () => {
    await server.close();
  });

  it("should catch an error through app.on('error') and throw a handled exception", () => {
    const testError = new Error("Throw an error");
    expect(() => {
      server.emit("error", testError);
    }).toThrow(testError);
  });

  it("should catch an unhandledRejection error and throw a handled exception", () => {
    const testError = new Error("Unhandled promise rejection");
    expect(() => {
      process.emit("unhandledRejection", testError);
    }).toThrow(testError);
  });
});
