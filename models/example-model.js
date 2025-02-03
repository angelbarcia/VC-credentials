const vc_example = {
  _id: "67a07ae2a09e1eed7351d877",
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
};

module.exports = vc_example;
