const request = require("supertest");
const mongoose = require("mongoose");
const { createApi, getApi } = require("./api/vc-issuer-api");
createApi(() => {});
api = getApi();
const VC = require("./models/model");

test("GET /vc-issuer/api/v1/health", async () => {
  const response = await request(api).get("/vc-issuer/api/v1/health");
  // Assertions
  expect(response.statusCode).toBe(200);
  expect(response.body).toEqual({ status: "OK" });
  expect(response.headers["content-type"]).toMatch(/json/);
});

describe("VC Routes", () => {
  let vcId;
  const vc = new VC({
    id_: "67a07ae2a09e1eed7351d877",
    "@context": "https://www.w3.org/2018/credentials/v1",
    type: "VerifiableCredential",
    issuer: "did:example:123",
    issuanceDate: new Date(),
    credentialSubject: {
      id: "679cb52c344a449590551146",
      nombre: "John Doe",
    },
    proof: {
      type: "Ed25519Signature2020",
      created: new Date(),
      verificationMethod: "did:example:123#key-1",
      proofPurpose: "assertionMethod",
      proofValue: "z58DAdFfa9SkqZMVPxAQpic7ndSaynKH",
      jws: "eyJhbGciOiJFUzI1NiIsInR5cCI6IkpXVCJ9.eyJzdWIiOiIxMjM0NTY3ODkwIiwibmFtZSI6Ikp1YW4gUGVyZXoiLCJpYXQiOjE3MTcwNDk1MTZ9.MEUCIQDbj7tQXL5pyHcRSZVskDdw5rEFyGJpDqRVQmYXw9ayTgIgdxA5NabM9pmO7MZOTMmP1jvM3/8iyDgbTbMS3prdfJ0=",
    },
  });

  beforeAll(async () => {
    await mongoose.connect("mongodb://localhost:27017/vc-issuer", {
      useNewUrlParser: true,
      useUnifiedTopology: true,
    });
    const savedVC = await vc.save();
    vcId = savedVC._id;
  }, 10000);

  afterAll(async () => {
    await VC.deleteMany({});
  });

  test("GET `/vc-issuer/api/v1/credentials/${vcId}`", async () => {
    const response = await request(api).get(
      `/vc-issuer/api/v1/credentials/${vcId}`,
    );

    expect(response.status).toBe(200);
    expect(response.body._id).toBe(vcId.toString());
  });
  test("POST /vc-issuer/api/v1/verify", async () => {
    const signedVc = vc.proof.jws;
    const response = await request(api)
      .post("/vc-issuer/api/v1/verify")
      .send({ signedVc });

    expect(response.status).toBe(200);
    expect(response.body.isValid).toBe(true);
  });
  test("POST /vc-issuer/api/v1/credentials", async () => {
    const vc = {
      "@context": "https://www.w3.org/2018/credentials/v1",
      type: "VerifiableCredential",
      issuer: "did:example:123",
      issuanceDate: new Date(),
      credentialSubject: {
        id: "did:example:456",
        nombre: "John Doe",
      },
      proof: {
        type: "Ed25519Signature2020",
        created: new Date(),
        verificationMethod: "did:example:123#key-1",
        proofPurpose: "assertionMethod",
        proofValue: "z58DAdFfa9SkqZMVPxAQpic7ndSaynKH",
        jws: "eyJhbGciOiJSUzI1NiIsInR5cCI6IkpXVCJ9",
      },
    };

    const response = await request(api)
      .post("/vc-issuer/api/v1/credentials")
      .send(vc);
    expect(response.status).toBe(200);
    expect(response.body.signedVc).toBeDefined();
  });
});
