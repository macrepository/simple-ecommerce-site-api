const request = require("supertest");

let server;

describe("api/customer", () => {
  beforeEach(() => {
    server = require("../../../../app");
  });
  afterEach(async () => {
    await server.close();
  });

  describe("POST /", () => {
    let customerData;

    const exec = async () => {
      return await request(server).post("/api/customer").send(customerData);
    };

    it("should response 400 status for invalid customer post data", async () => {
      customerData = {};
      const result = await exec();

      expect(result.status).toBe(400);
    });

    it("should response 409 status on email that is already exist in the database", async () => {
      customerData = {
        first_name: "john",
        last_name: "doe",
        date_of_birth: "1967-09-24",
        gender: "male",
        address: "Cebu city, Phillipines",
        zip_code: "6000",
        email: "johndoe@gmail.com",
        password: "yyyyyy1",
        repeat_password: "yyyyyy1",
      }
      
      await exec();
      const result = await exec();

      console.log(result.body);

      expect(result.status).toBe(409);

    });
  });
});
