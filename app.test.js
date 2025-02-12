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
  const vc = new VC({
    _id: "67a1f7c9a346294333dff1c7",
    "@context": "https://www.w3.org/2018/credentials/v1",
    type: "VerifiableCredential",
    issuer: "did:example:123",
    issuanceDate: new Date(),
    credentialSubject: {
      id: "679cb52c344a449590551146",
      name: "John Doe",
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
  let vcId = vc._id;
  beforeAll(async () => {
    await mongoose.connect("mongodb://localhost:27017/vc-issuer", {
      useNewUrlParser: true,
      useUnifiedTopology: true,
    });
    //const savedVC = await vc.save();
  }, 10000);

  //afterAll(async () => {
  // await VC.deleteMany({});
  // });

  test("GET `/vc-issuer/api/v1/credential/${vcId}`", async () => {
    const response = await request(api).get(
      `/vc-issuer/api/v1/credentials/${vcId}`,
    );
    console.log("Response status:", response.status);
    console.log("Response body:", response.body);
    expect(response.status).toBe(200);
    expect(response.headers["content-type"]).toMatch(/json/);
  });

  test("POST /vc-issuer/api/v1/verify", async () => {
    const vc = {
      _id: "67a1f7c9a346294333dff1c7",
      "@context": "https://www.w3.org/2018/credentials/v1",
      type: "VerifiableCredential",
      issuer: "did:example:123",
      issuanceDate: new Date(),
      credentialSubject: {
        id: "did:example:456",
        name: "John Doe",
      },
      proof: {
        type: "Ed25519Signature2020",
        created: new Date(),
        verificationMethod: "did:example:123#key-1",
        proofPurpose: "assertionMethod",
        proofValue: "z58DAdFfa9SkqZMVPxAQpic7ndSaynKH",
        jws:
          "eyJhbGciOiJSUzI1NiIsInR5cCI6IkpXUyJ9.eyJfaWQiOiI2N2ExZjdjOWEzNDYyOTQzMzNkZmYxYzciLCJAY29udGV4dCI6Imh0dHBzOi8vd3d3LnczLm9yZy8yMDE4L2NyZWRlbnRpYWxzL3YxIiwidH\n" +
          "lwZSI6IlZlcmlmaWFibGVDcmVkZW50aWFsIiwiaXNzdWVyIjoiZGlkOmV4YW1wbGU6MTIzIiwiaXNzdWFuY2VEYXRlIjoiMjAyNS0wMi0wNFQxMjozNjozMi44NDdaIiwiY3JlZGVudGlhbFN1YmplY3QiOnsia\n" +
          "WQiOiJkaWQ6ZXhhbXBsZTo0NTYiLCJuYW1lIjoiSm9obiBEb2UifX0.C6niuTmaE_48uFo6qB8cxVL6TYPSYl2X8FwDhpjrnw6P6HYrQigWkfG6lV66jpwdDO2vZToAPhq-4XTBN_SeReN-RBWJYvwRsYm-hzTs\n" +
          "MukJLg9b4dzqdLD4qm6sYOS1QFOW3ypmZbUri864iRJp9Ioopb-_p2WABG6X4xyfGcH-ytEcoqAgiq2vapjS_L0hXWDNYqr_VuceEVeLxyp9KV6zgmZxev6e0WOxDODZPQtwT9MfImWA6KcTacjRR4rlOBPSyrljofnEdD99bwr8L3onh6_djHCPmwT44DYk8D-AzhUgU_4J8Dj2pe25ffpwivC5wr89009pPmSNKOs19A\n",
      },
    };

    const response = await request(api)
      .post("/vc-issuer/api/v1/verify")
      .send(vc);
    console.log("Response status:", response.status);
    console.log("Response body:", response.body);
    expect(response.status).toBe(200);
    expect(response.headers["content-type"]).toMatch(/json/);
  });

  test("POST /vc-issuer/api/v1/credentials", async () => {
    const vc = {
      _id: "67a1f7c9a346294333dff1c7",
      "@context": "https://www.w3.org/2018/credentials/v1",
      type: "VerifiableCredential",
      issuer: "did:example:123",
      issuanceDate: new Date(),
      credentialSubject: {
        id: "did:example:456",
        name: "John Doe",
      },
      proof: {
        type: "Ed25519Signature2020",
        created: new Date(),
        verificationMethod: "did:example:123#key-1",
        proofPurpose: "assertionMethod",
        proofValue: "z58DAdFfa9SkqZMVPxAQpic7ndSaynKH",
        jws:
          "eyJhbGciOiJSUzI1NiIsInR5cCI6IkpXUyJ9.eyJfaWQiOiI2N2ExZjdjOWEzNDYyOTQzMzNkZmYxYzciLCJAY29udGV4dCI6Imh0dHBzOi8vd3d3LnczLm9yZy8yMDE4L2NyZWRlbnRpYWxzL3YxIiwidH\n" +
          "lwZSI6IlZlcmlmaWFibGVDcmVkZW50aWFsIiwiaXNzdWVyIjoiZGlkOmV4YW1wbGU6MTIzIiwiaXNzdWFuY2VEYXRlIjoiMjAyNS0wMi0wNFQxMjozNjozMi44NDdaIiwiY3JlZGVudGlhbFN1YmplY3QiOnsia\n" +
          "WQiOiJkaWQ6ZXhhbXBsZTo0NTYiLCJuYW1lIjoiSm9obiBEb2UifX0.C6niuTmaE_48uFo6qB8cxVL6TYPSYl2X8FwDhpjrnw6P6HYrQigWkfG6lV66jpwdDO2vZToAPhq-4XTBN_SeReN-RBWJYvwRsYm-hzTs\n" +
          "MukJLg9b4dzqdLD4qm6sYOS1QFOW3ypmZbUri864iRJp9Ioopb-_p2WABG6X4xyfGcH-ytEcoqAgiq2vapjS_L0hXWDNYqr_VuceEVeLxyp9KV6zgmZxev6e0WOxDODZPQtwT9MfImWA6KcTacjRR4rlOBPSyrljofnEdD99bwr8L3onh6_djHCPmwT44DYk8D-AzhUgU_4J8Dj2pe25ffpwivC5wr89009pPmSNKOs19A\n",
      },
    };

    const response = await request(api)
      .post("/vc-issuer/api/v1/credentials")
      .send(vc);
    console.log("Response status:", response.status);
    console.log("Response body:", response.body);
    expect(response.status).toBe(200);
    expect(response.headers["content-type"]).toMatch(/json/);
  });
});

test("POST /vc-issuer/api/v1/issue-credential", async () => {
  const credentialPayload = {
    callback: {
      url: "https://verifiedid.did.msidentity.com/v1.0/verifiableCredentials/createIssuanceRequest",
      state: "valid",
      headers: {
        "api-key":
          "https://verifiablecredential.vault.azure.net/secrets/DEEPCLOUDLABS/d87643c2db554dc0a9745bebc1969076",
      },
    },
    authority: "did:web:did.deepcloudlabs.com",
    registration: {
      clientName: "ANGEL BARCIA",
    },
    type: "VerifiedEmployee",
    manifest:
      "https://verifiedid.did.msidentity.com/v1.0/tenants/827cfa74-3589-40e8-b6f4-2f35aab2e201/verifiableCredentials/contracts/29ddf47c-251b-2792-5614-50408c086db3/manifest",
  };

  const response = await request(api)
    .post("/vc-issuer/api/v1/issue-credential")
    .send(credentialPayload);
  console.log("Response status:", response.status);
  console.log("Response body:", response.body);
  expect(response.status).toBe(200);
  expect(response.headers["content-type"]).toMatch(/json/);
});

test("POST /vc-issuer/api/v1/verify-credential", async () => {
  const jws =
    "eyJhbGciOiJSUzI1NiIsInR5cCI6IkpXUyJ9.eyJfaWQiOiI2N2ExZjdjOWEzNDYyOTQzMzNkZmYxYzciLCJAY29udGV4dCI6Imh0dHBzOi8vd3d3LnczLm9yZy8yMDE4L2NyZWRlbnRpYWxzL3YxIiwidH\n" +
    "lwZSI6IlZlcmlmaWFibGVDcmVkZW50aWFsIiwiaXNzdWVyIjoiZGlkOmV4YW1wbGU6MTIzIiwiaXNzdWFuY2VEYXRlIjoiMjAyNS0wMi0wNFQxMjozNjozMi44NDdaIiwiY3JlZGVudGlhbFN1YmplY3QiOnsia\n" +
    "WQiOiJkaWQ6ZXhhbXBsZTo0NTYiLCJuYW1lIjoiSm9obiBEb2UifX0.C6niuTmaE_48uFo6qB8cxVL6TYPSYl2X8FwDhpjrnw6P6HYrQigWkfG6lV66jpwdDO2vZToAPhq-4XTBN_SeReN-RBWJYvwRsYm-hzTs\n" +
    "MukJLg9b4dzqdLD4qm6sYOS1QFOW3ypmZbUri864iRJp9Ioopb-_p2WABG6X4xyfGcH-ytEcoqAgiq2vapjS_L0hXWDNYqr_VuceEVeLxyp9KV6zgmZxev6e0WOxDODZPQtwT9MfImWA6KcTacjRR4rlOBPSyrljofnEdD99bwr8L3onh6_djHCPmwT44DYk8D-AzhUgU_4J8Dj2pe25ffpwivC5wr89009pPmSNKOs19A\n";

  const response = await request(api)
    .post("/vc-issuer/api/v1/verify-credential")
    .send(jws);
  console.log("Response status:", response.status);
  console.log("Response body:", response.body);
  expect(response.status).toBe(200);
  expect(response.headers["content-type"]).toMatch(/json/);
});
