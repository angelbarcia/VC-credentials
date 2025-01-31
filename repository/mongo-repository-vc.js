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

const verifyVc = (vc) => {
  try {
    if (!vc || !vc.proof) {
      throw new Error("Invalid Verifiable Credential: Missing proof");
    }
    const {
      proof: { jws, verificationMethod },
      ...restOfVc
    } = vc;
    if (!jws || !verificationMethod) {
      throw new Error("Invalid proof: Missing JWS or verificationMethod");
    }
    const publicKey = resolveDid(verificationMethod);
    if (!publicKey) {
      throw new Error("Could not resolve public key from verification method");
    }
    const result = verifyJWS(jws, publicKey);
    console.log("Verification result:", result);
    return result;
  } catch (error) {
    console.error("VC Verification failed:", error.message);
    return false;
  }
};

const instantiateVc = (vc) => {
  const { proof, ...vcWithoutProof } = vc;
  const vcSchemaString = JSON.stringify(vcWithoutProof);
  if (!privateKey) {
    generateKeyPair();
  }
  const signature = signJWS(vcSchemaString, privateKey);
  const JWS = createJWS(vcSchemaString, signature);
  const currentDate = new Date().toISOString();
  const filter = { _id: identity };
  const updateProofDocument = {
    $set: {
      "proof.jws": JWS,
      "proof.created": currentDate,
    },
  };
  return vc.updateOne(filter, updateProofDocument);
  // jws -> take hash code of the document (Ed25519) -> encrypt the hash code with RSA private key -> signature
  // {header: {type: "hash algorithm"}, payload -> document, signature} -> base64 encoding -> jws
};

exports.getVcById = getVcById;
exports.verifyVc = verifyVc;
exports.instantiateVc = instantiateVc;
