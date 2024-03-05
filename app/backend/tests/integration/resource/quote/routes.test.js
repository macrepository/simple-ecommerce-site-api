/**
 * TODO:
 * API request GET /api/quote/<quoteID>
 *
 * TESTS
 * Should return 400 if no quote ID is being passed
 * Should return 404 if no quote data is found
 * Should return 200 and and all related data when successfully saved to the database
 */

const moment = require("moment");
const QuoteItemModel = require("../../../../resource/quote/item/model");
const QuoteModel = require("../../../../resource/quote/model");
const request = require("supertest");
let server;

describe("/api/quote", () => {
  beforeEach(() => {
    server = require("../../../../app");
  });

  afterEach(async () => {
    await server.close();
    await QuoteItemModel.create().delete();
    await QuoteModel.create().delete();
  });

  describe("POST /", () => {
    let quoteData;

    beforeEach(() => {
      quoteData = {
        customer_id: "1",
        is_active: true,
        first_name: "john",
        last_name: "doe",
        date_of_birth: "1967-09-24",
        gender: "male",
        address: "cebu city",
        zip_code: "6000",
        email: "johndoe@gmail.com",
        subtotal: "1000",
        grandtotal: "1000",
        items: [
          {
            name: "tshirt xl blue",
            price: "1000",
            quantity: "1",
            product_id: "1",
            row_total: "1000",
          },
        ],
      };
    });

    const exec = (payload) => request(server).post("/api/quote/").send(payload);
    const longString = (length) => new Array(length + 1).join("a");

    const tomorrow = moment().add(1, "days").format("YYYY-MM-DD");

    const invalidReqQouteValues = [
      ["customer_id", [null, "", NaN, 0, undefined]],
      ["is_active", [null, NaN, 1, "", undefined]],
      ["first_name", [longString(51), undefined]], // max length is 50
      ["last_name", [longString(51), undefined]], // max length is 50
      ["date_of_birth", ["a", moment().format("MM-DD-YYYY"), tomorrow]],
      ["gender", ["a"]],
      ["address", [longString(256), undefined]], // Max length is 255
      ["zip_code", [longString(21), undefined]], // Max length is 20
      ["email", [null, "a", "a@test", `${longString(42)}@test.com`, undefined]], //max length 50
      ["subtotal", [null, NaN, "", 0, -1, 10000000, undefined]],
      ["grandtotal", [null, NaN, "", 0, -1, 10000000, undefined]],
    ];

    const invalidReqQouteItemValues = [
      ["quote_id", [null, "", NaN, 0]],
      ["name", [longString(51), undefined]], // max length is 50
      ["price", [null, NaN, "", 0, -1, 10000000, undefined]],
      ["quantity", [null, NaN, "", 0, -1, 1000000, undefined]],
      ["product_id", [null, "", NaN, 0, undefined]],
      ["row_total", [null, NaN, "", 0, -1, 10000000, undefined]],
    ];

    describe.each(invalidReqQouteValues)(
      "Validation tests for request quote data",
      (field, invalidValues) => {
        test.each(invalidValues)(
          `Should return 400 if the request ${field} is %s`,
          async (invalidValue) => {
            const modifiedData = { ...quoteData, [field]: invalidValue };
            const res = await exec(modifiedData);

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
          }
        );
      }
    );

    describe.each(invalidReqQouteItemValues)(
      "Validation tests for request quote item data",
      (field, invalidValues) => {
        test.each(invalidValues)(
          `Should return 400 if the request ${field} is %s`,
          async (invalidValue) => {
            const modifiedData = {
              ...quoteData,
              items: [
                {
                  ...quoteData.items[0],
                  [field]: invalidValue,
                },
              ],
            };

            const res = await exec(modifiedData);

            expect(res.status).toBe(400);
            expect(res.body).toMatchObject({
              code: "bad_request",
              message: expect.any(String),
              body: expect.arrayContaining([
                expect.objectContaining({
                  field: "items",
                  message: expect.any(String),
                }),
              ]),
            });
          }
        );
      }
    );

    it("should return 409 if the email is already exist to the database", async () => {
      await exec(quoteData);
      const res = await exec(quoteData);
      const { data: quote } = await QuoteModel.findByEmail(quoteData.email);

      expect(quote.email).toBe(quoteData.email);
      expect(res.status).toBe(409);
      expect(res.body).toMatchObject({
        code: "conflict",
        message: expect.any(String),
        body: expect.any(Array),
      });
    });

    it("should return 409 status if no quote ID return after saving to the DB", async () => {
      const originalSaveFn = QuoteModel.save;
      QuoteModel.save = jest.fn(quoteData).mockReturnValue();
      const res = await exec(quoteData);
      QuoteModel.save = originalSaveFn;

      expect(res.status).toBe(409);
      expect(res.body).toMatchObject({
        code: "conflict",
        message: expect.any(String),
        body: null,
      });
    });

    it("should return 200 status if the quote was succesfully saved to the database", async () => {
      const res = await exec(quoteData);

      expect(res.status).toBe(200);
      expect(res.body).toMatchObject({
        code: "success",
        message: expect.any(String),
        body: expect.any(Number),
      });
    });
  });
});
