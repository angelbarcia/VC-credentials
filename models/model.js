const mongoose = require("mongoose");
const Schema = mongoose.Schema;
const credentialSubjectSchema = new Schema({
  id: {
    type: String,
    required: false,
  },
  emailAddress: {
    type: String,
    required: false,
    match: [/.+@.+\..+/, "Please, insert a valid email"],
  },
});

const credentialSchema = new Schema({
  id: {
    type: String,
    required: true,
  },
  type: {
    type: String,
    required: true,
  },
});
const proofSchema = new Schema({
  type: {
    type: String,
    required: true,
    enums: ["Ed25519Signature2020", "JsonWebSignature2020"],
  },
  created: {
    type: Date,
    required: true,
  },
  verificationMethod: {
    type: String,
    required: true,
    default: "did:example:deepcloudlabs#rsa-public-key",
  },
  proofPurpose: {
    type: String,
    required: true,
    enums: [
      "authentication",
      "assertionMethod",
      "keyAgreement",
      "contractAgreement",
    ],
    default: "assertionMethod",
  },
  jws: {
    type: String,
    required: true,
  },
});

const verifiableCredentialSchema = new Schema({
  "@context": {
    type: String,
    required: true,
  },
  id: {
    type: String,
    required: false,
  },
  type: {
    type: String,
    required: true,
  },
  issuer: {
    type: String,
    required: true,
  },
  issuanceDate: {
    type: Date,
    required: true,
  },
  credentialSubject: {
    type: credentialSubjectSchema,
    required: false,
  },
  credentialSchema: {
    type: credentialSchema,
    required: false,
  },
  proof: {
    type: proofSchema,
    required: true,
  },
});

const vc = mongoose.model("credentials", verifiableCredentialSchema);

module.exports = vc;
