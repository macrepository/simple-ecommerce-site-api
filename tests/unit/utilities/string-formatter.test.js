const { __ } = require("../../../utilities/string-formatter");

describe("__", () => {
  it("should return the original template if no value was passed", () => {
    const result = __("Hello %1");
    expect(result).toMatch(/Hello %1/);
  });

  it("should replace the %1 in the template string with the given value", () => {
    const result = __("Hello %1", "John");
    expect(result).toMatch(/Hello John/);
  });

  it("should replace all the %1 %1 in the template string with first given value", () => {
    const result = __("Hello %1 %1", "John", "Boo");
    expect(result).toMatch(/John John/);
  });

  it("should replace all the %1 %2 in the template string with the given values accordingly", () => {
    const result = __("Hello %1 %2", "John", "Boo");
    expect(result).toMatch(/John Boo/);
  });
});
