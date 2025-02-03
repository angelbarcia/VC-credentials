const vc_example = require("../models/example-model");
const vc = require("../models/model");
const {
  signJWS,
  verifyJWS,
  generateKeyPair,
  createJWS,
} = require("../utils/cryptoUtils");
const { resolveDid } = require("../utils/DIDResolver");
//const {getResolver} = require("@3id/did-provider"); // did resolver for public key

const getVcById = (id) => {
  return vc.findOne({ id: id }, {}, {});
};

const verifyVc = (did) => {
  try {
    if (!vc_example || !vc_example.proof) {
      throw new Error("Invalid Verifiable Credential: Missing proof");
    }
    const {
      proof: { jws, verificationMethod },
      ...restOfVc
    } = vc_example;
    if (!jws || !verificationMethod) {
      throw new Error("Invalid proof: Missing JWS or verificationMethod");
    }
    const publicKey = resolveDid(did).then((publicKey) => {
      console.log("Public key:", publicKey);
      if (!publicKey || publicKey.length === 0) {
        throw new Error(
          "Could not resolve public key from verification method",
        );
      }
    });

    const result = verifyJWS(jws, publicKey);
    console.log("Verification result:", result);
    return result;
  } catch (error) {
    console.error("VC Verification failed:", error.message);
    return false;
  }
};

const instantiateVc = (vc) => {
  const { proof, ...vcWithoutProof } = vc_example;
  const vcSchemaString = JSON.stringify(vcWithoutProof);
  const privateKey = generateKeyPair();
  const signature = signJWS(vcSchemaString, privateKey);
  const JWS = createJWS(vcSchemaString, signature);
  const currentDate = new Date().toISOString();
  const filter = { _id: identity };
  const updateProof = {
    $set: {
      "proof.jws": JWS,
      "proof.created": currentDate,
    },
  };
  return vc.updateOne(filter, updateProof);
  // jws -> take hash code of the document (Ed25519) -> encrypt the hash code with RSA private key -> signature
  // {header: {type: "hash algorithm"}, payload -> document, signature} -> base64 encoding -> jws
};

exports.getVcById = getVcById;
exports.verifyVc = verifyVc;
exports.instantiateVc = instantiateVc;
