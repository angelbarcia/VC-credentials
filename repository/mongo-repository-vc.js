const vc_example = require("../models/example-model");
const vcModel = require("../models/model");
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
    if (!vc || !vc.proof) {
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

const instantiateVc = async (vc) => {
  const { proof, ...vcWithoutProof } = vc;
  console.log(vc)
  console.log(proof)
  console.log(vcWithoutProof)
  const vcSchemaString = JSON.stringify(vcWithoutProof);
  const {privateKey, publicKey} = await generateKeyPair();
  console.log("Key Pairs is generated.")
  console.log(privateKey)
  const signature = signJWS(vcSchemaString, privateKey);
  console.log("Signature is generated.")
  console.log(signature);
  const JWS = createJWS(vcSchemaString, signature);
  console.log("JWS is generated.")
  console.log(JWS);
  const currentDate = new Date().toISOString();
  const filter = { _id: vc._id };
  console.log(currentDate);
  const updateProof = {
    $set: {
      "proof.jws": JWS,
      "proof.created": currentDate,
    },
  };
  return vcModel.updateOne(filter, updateProof);
  // jws -> take hash code of the document (Ed25519) -> encrypt the hash code with RSA private key -> signature
  // {header: {type: "hash algorithm"}, payload -> document, signature} -> base64 encoding -> jws
};

exports.getVcById = getVcById;
exports.verifyVc = verifyVc;
exports.instantiateVc = instantiateVc;
