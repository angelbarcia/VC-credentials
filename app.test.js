const request = require("supertest");
const { createApi, getApi } = require("./api/vc-issuer-api");
createApi(() => {});
api = getApi();

describe("API Tests", () => {
  let certificate = {
    "@context": [
      "https://www.w3.org/ns/credentials/v2",
      "https://www.w3.org/ns/credentials/examples/v2",
    ],
    id: "https://example.com/credentials/3732",
    type: ["VerifiableCredential", "EmailCredential"],
    issuer: "https://deepcloudlabs.com/issuers/42",
    issuanceDate: new Date().toString(),
    credentialSubject: {
      id: "did:example:ebfeb1f712ebc6f1c276e12ec21",
      emailAddress: "test@test.com",
    },
    credentialSchema: {
      id: "https://example.com/schemas/email.json",
      type: "JsonSchema",
    },
    proof: {
      type: "Ed25519Signature2020",
      created: "2025-01-01T12:00:00Z",
      verificationMethod: "did:example:deepcloudlabs#rsa-public-key-1",
      proofPurpose: "assertionMethod",
      jws: "eyJhbGciOiJFZERTQSJ9..MEUCIQCY12345EXAMPLESIGNEDDATA12345rEQHgIerA",
    },
  };

  let signedCertificate;

  test("GET /vc-issuer/api/v1/health", () => {
    it("should return a status of 200 and a JSON response", async () => {
      const response = await request(api).get("/vc-issuer/api/v1/health");
      // Assertions
      expect(response.statusCode).toBe(200);
      expect(response.body).toEqual({ status: "OK" });
      expect(response.headers["content-type"]).toMatch(/json/);
    });
  });

  test("GET /vc-issuer/api/v1/credentials/:id", () => {
    it("should return a status of 200 and a JSON response", async () => {
      const response = await request(api).get(
        `/vc-issuer/api/v1/credentials/${certificate.id}`
      );

      // Assertions
      expect(response.statusCode).toBe(200);
      expect(response.body).toHaveProperty("id", certificate.id);
    });
  });

  test("POST /vc-issuer/api/v1/verify", () => {
    const verificationPayload = {
      id: signedCertificate.id,
      updatedProof: signedCertificate.updatedProof,
    };
    it("should return a status of 200 and a JSON response", async () => {
      const response = await request(api)
        .post("/vc-issuer/api/v1/verify")
        .send(verificationPayload);
      // Assertions
      expect(response.statusCode).toBe(200);
      expect(res.body).toHaveProperty("verified", true);
    });
  });

  test("POST /vc-issuer/api/v1/credentials", () => {
    it("should return a status of 201 and a JSON response when valid data is sent", async () => {
      const response = await request(api)
        .post("/vc-issuer/api/v1/credentials")
        .send(certificate);

      // Assertions
      expect(response.statusCode).toBe(200);
      expect(res.body).toHaveProperty("updatedProof");
      expect(res.body.updatedProof).toHaveProperty("jws");
      expect(res.body.updatedProof).toHaveProperty("date");

      signedCertificate = res.body;
    });
  });
});
