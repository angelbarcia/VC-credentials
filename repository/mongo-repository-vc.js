const { Schema, model } = require("mongoose");
const crypto = require("crypto");
const base64url = require("base64url");

const credentialSubjectSchema = new Schema({
  id: {
    type: String,
    required: true,
  },
  emailAddress: {
    type: String,
    required: true,
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
    required: true,
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
    required: true,
  },
  credentialSchema: {
    type: credentialSchema,
    required: true,
  },
  proof: {
    type: proofSchema,
    required: true,
  },
});

const VerifiableCredentialModel = model(
  "credentials",
  verifiableCredentialSchema
);

const getVerifiableCredentialsById = (id) => {
  return VerifiableCredentialModel.findOne({ id: id }, {}, {});
};

const verifyVerifiableCredentials = (vc) => {
  //TODO: we receive a verifiable credentials and we will verify it and return the result!
};

const instantiateVerifiableCredentials = ({ identity, certificate }) => {
  const newCertificate = new VerifiableCredentialModel({
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
      emailAddress: identity,
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
  });
  // splitting the proof and generating the hash
  const { proof, ...vcWithoutProof } = newCertificate;
  const vcSchemaString = JSON.stringify(vcWithoutProof);
  const hash = crypto.createHash("sha256").update(vcSchemaString).digest("hex");
  // generating the keys in case they are not created yet
  function generateKeyPair() {
    const { publicKey, privateKey } = crypto.generateKeyPairSync("rsa", {
      modulusLength: 2048,
      publicKeyEncoding: {
        type: "spki",
        format: "pem",
      },
      privateKeyEncoding: {
        type: "pkcs8",
        format: "pem",
        cipher: "aes-256-cbc",
        passphrase: "my_secure_password",
      },
    });
    return { publicKey, privateKey };
  }

  if (!publicKey || !privateKey) {
    generateKeyPair();
  }
  // signing the doc with the hash and private key created.
  const signature = crypto.sign("sha256", hash, privateKey);
  // Creating the JWS
  // Header
  const header = {
    alg: "RS256",
    typ: "JWS",
  };
  // As we have everything created, we start encrypting it into a JWS file
  function generateJWS() {
    const encodedHeader = base64url.encode(Buffer.from(JSON.stringify(header)));
    const encodedPayload = base64url.encode(Buffer.from(vcSchemaString));
    const encodedSignature = base64url.encode(signature);

    const jws = `${encodedHeader}.${encodedPayload}.${encodedSignature}`;
    return jws;
  }
  // we update the proof including the new jws and the date.
  async function updateProofJWS(id, newJWS) {
    try {
      const currentDate = new Date().toISOString();
      const result = await VerifiableCredentialModel.updateOne(
        { _id: id },
        {
          $set: {
            "proof.jws": newJWS,
            "proof.created": currentDate,
          },
        }
      );

      console.log("Updated:", result);
    } catch (error) {
      console.error("Error updating JWS:", error);
    }
  }
  const newJWS = generateJWS();
  updateProofJWS(_id, newJWS);

  // jws -> take hash code of the document (Ed25519) -> encrypt the hash code with RSA private key -> signature
  // {header: {type: "hash algorithm"}, payload -> document, signature} -> base64 encoding -> jws
  return newCertificate.save();
};

exports.VerifiableCredentialModel = VerifiableCredentialModel;
exports.getVerifiableCredentialsById = getVerifiableCredentialsById;
exports.verifyVerifiableCredentials = verifyVerifiableCredentials;
exports.instantiateVerifiableCredentials = instantiateVerifiableCredentials;
