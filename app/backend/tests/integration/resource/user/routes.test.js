const _ = require("lodash");
const request = require("supertest");
const { generateToken } = require("../../../../utilities/json-web-token");
const UserModel = require("../../../../resource/user/model");

const userModelInstance = new UserModel();

describe("/api/user", () => {
  let server;
  let userData;

  beforeEach(() => {
    server = require("../../../../app");
    userData = {
      first_name: "john",
      last_name: "doe",
      email: "johndoe@gmail.com",
      username: "john24",
      role: "admin",
      password: "yyyyyy1",
      repeat_password: "yyyyyy1",
    };
  });

  afterEach(async () => {
    await server.close();
    await userModelInstance.create().delete();
  });

  describe("POST /", () => {
    const exec = () => {
      return request(server).post("/api/user").send(userData);
    };

    it("should return a 400 status if the user request data is invalid", async () => {
      userData = {};
      const res = await exec();

      expect(res.status).toBe(400);
      expect(res.body).toMatchObject({
        code: "bad_request",
        message: expect.any(String),
        body: expect.arrayContaining([
          expect.objectContaining({
            field: expect.any(String),
            message: expect.any(String),
          }),
        ]),
      });
    });

    it("should response a 400 status if the user confirm password is not match ", async () => {
      const field = "repeat_password";
      userData.repeat_password = "a";

      const res = await exec(userData);

      expect(res.status).toBe(400);
      expect(res.body).toMatchObject({
        code: "bad_request",
        message: expect.any(String),
        body: expect.arrayContaining([
          expect.objectContaining({
            field: field,
            message: expect.any(String),
          }),
        ]),
      });
    });

    it("should response a 409 status if the user email is already exist in the database", async () => {
      await userModelInstance.save(_.omit(userData, ["repeat_password"]));

      userData.username = "joe123";

      const res = await exec(userData);

      expect(res.status).toBe(409);
      expect(res.body).toMatchObject({
        code: "conflict",
        message: expect.any(String),
        body: expect.arrayContaining([
          expect.objectContaining({
            field: "email",
            message: expect.any(String),
          }),
        ]),
      });
    });

    it("should response a 409 status if the user username is already exist in the database", async () => {
      await userModelInstance.save(_.omit(userData, ["repeat_password"]));

      userData.email = "a@gmail.com";

      const res = await exec(userData);

      expect(res.status).toBe(409);
      expect(res.body).toMatchObject({
        code: "conflict",
        message: expect.any(String),
        body: expect.arrayContaining([
          expect.objectContaining({
            field: "username",
            message: expect.any(String),
          }),
        ]),
      });
    });

    it("Should return a 409 status if the user data is not saved.", async () => {
      const originalFn = UserModel.prototype.save;
      UserModel.prototype.save = jest.fn().mockReturnValue();
      const res = await exec(userData);

      UserModel.prototype.save = originalFn;

      expect(res.status).toBe(409);
      expect(res.body).toMatchObject({
        code: "conflict",
        message: expect.any(String),
      });
      expect(res.body).toHaveProperty("body");
    });

    it("should return a 500 status if the something goes wrong during the post user process", async () => {
      const originalFn = UserModel.prototype.save;
      UserModel.prototype.save = jest
        .fn()
        .mockRejectedValue(new Error("something happen in user save process"));
      const res = await exec(userData);

      UserModel.prototype.save = originalFn;

      expect(res.status).toBe(500);
      expect(res.body).toMatchObject({
        code: "internal_server_error",
        message: expect.any(String),
        body: expect.anything(),
      });
    });

    it("should return a 200 status if the user data is successfully saved to the database", async () => {
      const res = await exec(userData);

      expect(res.status).toBe(200);
      expect(res.body).toMatchObject({
        code: "success",
        message: expect.any(String),
        body: expect.any(Array),
      });
    });
  });

  describe("GET / OR /:id", () => {
    let userId;
    const exec = () => {
      return request(server).get(`/api/user/${userId}`);
    };

    it("Should return a 400 status if the user ID passed is not greater than 0", async () => {
      userId = 0;
      const res = await exec();

      expect(res.status).toBe(400);
      expect(res.body).toMatchObject({
        code: "bad_request",
        message: expect.any(String),
        body: expect.anything(),
      });
    });

    it("Should return a 404 status if no user data was returned", async () => {
      userId = 1;
      const res = await exec();

      expect(res.status).toBe(404);
      expect(res.body).toMatchObject({
        code: "not_found",
        message: expect.any(String),
      });
      expect(res.body).toHaveProperty("body");
    });

    it("should return a 200 status and one user record if valid user ID is passed", async () => {
      [userId] = await userModelInstance.save(
        _.omit(userData, ["repeat_password"])
      );

      const res = await exec();

      expect(res.status).toBe(200);
      expect(res.body).toMatchObject({
        code: "success",
        message: expect.any(String),
        body: expect.any(Object),
      });
    });

    it("should return a 200 status and one or more user record if no user ID is passed", async () => {
      userId = "";
      await userModelInstance.save([
        { ..._.omit(userData, ["repeat_password"]) },
        {
          ..._.omit(userData, ["repeat_password"]),
          email: "a@gmail.com",
          username: "joe123",
        },
      ]);

      const res = await exec();

      expect(res.status).toBe(200);
      expect(res.body).toMatchObject({
        code: "success",
        message: expect.any(String),
        body: expect.any(Array),
      });
    });
  });

  describe("PATCH /:id", () => {
    let userId;
    const exec = () => {
      return request(server).patch(`/api/user/${userId}`).send(userData);
    };

    it("Should return a 400 status if the user ID is invalid", async () => {
      userId = "a";

      const res = await exec();

      expect(res.status).toBe(400);
      expect(res.body).toMatchObject({
        code: "bad_request",
        message: expect.any(String),
        body: expect.anything(),
      });
    });

    it("Should return a 400 status if the user data is invalid", async () => {
      userId = 1;
      userData = { ...userData, email: "" };

      const res = await exec();

      expect(res.status).toBe(400);
      expect(res.body).toMatchObject({
        code: "bad_request",
        message: expect.any(String),
        body: expect.arrayContaining([
          expect.objectContaining({
            field: "email",
            message: expect.any(String),
          }),
        ]),
      });
    });

    it("Should return a 404 status if the user ID is not found in the database", async () => {
      userId = 1;
      userData = _.omit(userData, ["repeat_password"]);

      const res = await exec();

      expect(res.status).toBe(404);
      expect(res.body).toMatchObject({
        code: "not_found",
        message: expect.any(String),
      });
      expect(res.body).toHaveProperty("body");
    });

    it("Should return a 409 status if the user email is already exist", async () => {
      [userId] = await userModelInstance.save(
        _.omit(userData, ["repeat_password"])
      );

      userData.email = "a@gmail.com";
      userData.username = "joe123";
      await userModelInstance.save(_.omit(userData, ["repeat_password"]));

      userData.username = "joe124";
      userData = _.omit(userData, ["repeat_password"]);

      const res = await exec();

      expect(res.status).toBe(409);
      expect(res.body).toMatchObject({
        code: "conflict",
        message: expect.any(String),
        body: expect.arrayContaining([
          expect.objectContaining({
            field: "email",
            message: expect.any(String),
          }),
        ]),
      });
    });

    it("Should return a 409 status if the user username is already exist", async () => {
      [userId] = await userModelInstance.save(
        _.omit(userData, ["repeat_password"])
      );

      userData.email = "a@gmail.com";
      userData.username = "joe123";
      await userModelInstance.save(_.omit(userData, ["repeat_password"]));

      userData.email = "b@gmail.com";
      userData = _.omit(userData, ["repeat_password"]);

      const res = await exec();

      expect(res.status).toBe(409);
      expect(res.body).toMatchObject({
        code: "conflict",
        message: expect.any(String),
        body: expect.arrayContaining([
          expect.objectContaining({
            field: "username",
            message: expect.any(String),
          }),
        ]),
      });
    });

    it("Should return a 500 status if something goes wrong in the update process", async () => {
      userId = 1;
      userData = _.omit(userData, ["repeat_password"]);

      const originalFn = UserModel.prototype.update;
      UserModel.prototype.update = jest
        .fn()
        .mockRejectedValue(
          new Error("something happen in user update process")
        );

      const res = await exec();

      UserModel.prototype.update = originalFn;

      expect(res.status).toBe(500);
      expect(res.body).toMatchObject({
        code: "internal_server_error",
        message: expect.any(String),
        body: expect.any(String),
      });
    });

    it("Should return a 200 status if the user data was successfully updated", async () => {
      [userId] = await userModelInstance.save(
        _.omit(userData, ["repeat_password"])
      );

      userData = _.omit(userData, ["repeat_password"]);

      const res = await exec();

      expect(res.status).toBe(200);
      expect(res.body).toMatchObject({
        code: "success",
        message: expect.any(String),
      });
      expect(res.body).toHaveProperty("body");
    });
  });

  describe("DELETE /:id", () => {
    let userId;

    const exec = () => {
      return request(server).delete(`/api/user/${userId}`);
    };

    it("Should return a 400 status if the user ID is not greater than 0", async () => {
      userId = "0";

      const res = await exec();

      expect(res.status).toBe(400);
      expect(res.body).toMatchObject({
        code: "bad_request",
        message: expect.any(String),
        body: expect.anything(),
      });
    });

    it("Should return a 404 status if the user ID is not found in the database", async () => {
      userId = "1";

      const res = await exec();

      expect(res.status).toBe(404);
      expect(res.body).toMatchObject({
        code: "not_found",
        message: expect.any(String),
      });
      expect(res.body).toHaveProperty("body");
    });

    it("Should return a 500 status if something goes wrong in the delete process", async () => {
      userId = "1";
      const originalFn = UserModel.prototype.delete;
      UserModel.prototype.delete = jest
        .fn()
        .mockRejectedValue(
          new Error("something happen during user deletion process")
        );

      const res = await exec();

      UserModel.prototype.delete = originalFn;

      expect(res.status).toBe(500);
      expect(res.body).toMatchObject({
        code: "internal_server_error",
        message: expect.any(String),
        body: expect.anything(),
      });
    });

    it("Should return a 200 status if the user record was succesfully deleted", async () => {
      [userId] = await userModelInstance.save(
        _.omit(userData, ["repeat_password"])
      );

      const res = await exec();

      const user = (await userModelInstance.findById(userId)).getData();

      expect(userId).toBeGreaterThan(0);
      expect(user).toBeNull();
      expect(res.status).toBe(200);
      expect(res.body).toMatchObject({
        code: "success",
        message: expect.any(String),
      });
      expect(res.body).toHaveProperty("body");
    });
  });

  describe("POST /login", () => {
    let payload;
    const exec = () => {
      return request(server).post("/api/user/login").send(payload);
    };

    beforeEach(() => {
      payload = {
        username: userData.username,
        password: userData.password,
      };
    });

    it("should return a 400 status if the user username or password is invalid", async () => {
      payload = {};

      const res = await exec();

      expect(res.status).toBe(400);
      expect(res.body).toMatchObject({
        code: "bad_request",
        message: expect.any(String),
        body: expect.arrayContaining([
          expect.objectContaining(
            {
              field: "username",
              message: expect.any(String),
            },
            {
              field: "password",
              message: expect.any(String),
            }
          ),
        ]),
      });
    });

    it("should return a 401 status if the user username is not exist", async () => {
      const res = await exec();

      expect(res.status).toBe(401);
      expect(res.body).toMatchObject({
        code: "unauthorized",
        message: expect.any(String),
      });
      expect(res.body).toHaveProperty("body");
    });

    it("should return a 401 status if the user password doesn't match", async () => {
      const [userId] = await userModelInstance.save(
        _.omit(userData, ["repeat_password"])
      );

      payload.password = "aaaaa1";

      const res = await exec();

      expect(userId).toBeGreaterThan(0);
      expect(res.status).toBe(401);
      expect(res.body).toMatchObject({
        code: "unauthorized",
        message: expect.any(String),
      });
      expect(res.body).toHaveProperty("body");
    });

    it("should return a 500 status if something goes wrong during the user login process", async () => {
      const originalFn = UserModel.prototype.findByUsername;
      UserModel.prototype.findByUsername = jest
        .fn()
        .mockRejectedValue(
          new Error("something happen during user login findByUsername process")
        );

      const res = await exec();

      UserModel.prototype.findByUsername = originalFn;

      expect(res.status).toBe(500);
      expect(res.body).toMatchObject({
        code: "internal_server_error",
        message: expect.any(String),
        body: expect.anything(),
      });
    });

    it("should return a 200 status and set the header of the x-auth-token key if the login was successful", async () => {
      const jwtPattern = /^[A-Za-z0-9-_]+\.[A-Za-z0-9-_]+\.[A-Za-z0-9-_]*$/;
      const [userId] = await userModelInstance.save(
        _.omit(userData, ["repeat_password"])
      );

      const res = await exec();

      expect(userId).toBeGreaterThan(0);
      expect(res.status).toBe(200);

      expect(res.headers["x-auth-token"]).toMatch(jwtPattern);
    });

    it("should return a 200 status and user details excluding password if the login was successful", async () => {
      const [userId] = await userModelInstance.save(
        _.omit(userData, ["repeat_password"])
      );

      const res = await exec();

      expect(userId).toBeGreaterThan(0);
      expect(res.status).toBe(200);
      expect(res.body).toMatchObject({
        code: "success",
        message: expect.any(String),
        body: expect.objectContaining({
          id: expect.anything(),
          email: expect.anything(),
        }),
      });
      expect(res.body.body).not.toHaveProperty("password");
    });
  });

  describe("GET /account", () => {
    let jwtToken;
    const exec = () => {
      return request(server)
        .get("/api/user/account")
        .set("x-auth-token", jwtToken);
    };

    it("should return a 401 status if the JWT token is missing in the user accouunt request", async () => {
      jwtToken = "";
      const res = await exec();

      expect(res.status).toBe(401);
      expect(res.body).toMatchObject({
        code: "unauthorized",
        message: expect.any(String),
      });
      expect(res.body).toHaveProperty("body");
    });

    it("should return a 401 status if the JWT token is invalid", async () => {
      jwtToken = "aaaa";
      const res = await exec();

      expect(res.status).toBe(401);
      expect(res.body).toMatchObject({
        code: "unauthorized",
        message: expect.any(String),
      });
      expect(res.body).toHaveProperty("body");
    });

    it("should retun a 200 status if the JWT token is valid", async () => {
      const [userId] = await userModelInstance.save(
        _.omit(userData, ["repeat_password"])
      );

      const user = (await userModelInstance.findById(userId)).getData();
      delete user.password;
      jwtToken = generateToken({ ...user });

      const res = await exec();

      expect(res.status).toBe(200);
    });
  });
});
