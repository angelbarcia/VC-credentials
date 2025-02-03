const vc_example = require("../models/example-model");
const vc = require("../models/model");
const {
  signJWS,
  verifyJWS,
  generateKeyPair,
  createJWS,
} = require("../utils/cryptoUtils");
const { getPublicKeyFromDid } = require("../utils/DIDResolver");
//const {getResolver} = require("@3id/did-provider"); // did resolver for public key

const getVcById = (id) => {
  return vc.findOne({ id: id }, {}, {});
};

const verifyVc = (vc) => {
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
    const did = vc_example.proof.verificationMethod;
    console.log("DID:", did);

    async function getPublicKey(did) {
      const publicKey = await getPublicKeyFromDid(did);
      console.log("Public Key:", publicKey);
      if (!publicKey || publicKey.length === 0) {
        throw new Error(
          "Could not resolve public key from verification method",
        );
      }
    }
    const publicKey = getPublicKey(did);
    const result = verifyJWS(jws, publicKey);
    console.log("Verification result:", result);
    return result;
  } catch (error) {
    console.error("VC Verification failed:", error.message);
    return false;
  }
};

const instantiateVc = () => {
  const { proof, ...vcWithoutProof } = vc_example;
  const vcSchemaString = JSON.stringify(vcWithoutProof);
  const privateKey = generateKeyPair();
  const signature = signJWS(vcSchemaString, privateKey);
  const JWS = createJWS(vcSchemaString, signature);
  const currentDate = new Date().toISOString();
  const filter = { _id: vc_example._id };
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
