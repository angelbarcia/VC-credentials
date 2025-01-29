const request = require("supertest");
const { createApi, getApi } = require("./api/vc-issuer-api");
createApi(() => {});
api = getApi();

describe("GET /vc-issuer/api/v1/health", () => {
  it("should return a status of 200 and a JSON response", async () => {
    const response = await request(api).get("/vc-issuer/api/v1/health");

    // Assertions
    expect(response.statusCode).toBe(200);
    expect(response.body).toEqual({ status: "OK" });
    expect(response.headers["content-type"]).toMatch(/json/);
  });
});

describe("GET /vc-issuer/api/v1/credentials/:id", () => {
  it("should return a status of 200 and a JSON response", async () => {
    const response = await request(api).get(
      "/vc-issuer/api/v1/credentials/:id"
    );

    // Assertions
    expect(response.statusCode).toBe(200);
    expect(response.body).toEqual({ status: "OK" });
    expect(response.headers["content-type"]).toMatch(/json/);
  });
});

describe("POST /vc-issuer/api/v1/verify", () => {
  it("should return a status of 200 and a JSON response", async () => {
    const response = await request(api).post("/vc-issuer/api/v1/verify");

    // Assertions
    expect(response.statusCode).toBe(200);
    expect(response.body).toEqual({ status: "OK" });
    expect(response.headers["content-type"]).toMatch(/json/);
  });
});

describe("POST /vc-issuer/api/v1/credentials", () => {
  it("should return a status of 201 and a JSON response when valid data is sent", async () => {
    const response = await request(api)
      .post("/vc-issuer/api/v1/credentials")
      .send({
        id: "valid-id",
        updatedProof: {
          type: "Ed25519Signature2020",
          created: "2025-01-01T12:00:00Z",
          verificationMethod: "did:example:deepcloudlabs#rsa-public-key-1",
          proofPurpose: "assertionMethod",
          jws: "eyJhbGciOiJFZERTQSJ9..MEUCIQCY12345EXAMPLESIGNEDDATA12345rEQHgIerA",
        },
      })
      .set("Accept", "application/json");

    // Assertions
    expect(response.statusCode).toBe(201);
    expect(response.body).toHaveProperty("id");
    expect(response.body).toHaveProperty("updatedProof");
    expect(response.body).toEqual({ status: "OK" });
    expect(response.headers["content-type"]).toMatch(/json/);
  });
});
