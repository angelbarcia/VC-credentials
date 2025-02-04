const vcModel = require("../models/model");
const {
  signJWS,
  verifyJWS,
  generateKeyPair,
  createJWS,
  decodeJWS,
} = require("../utils/cryptoUtils");
const { getPublicKeyFromDid } = require("../utils/DIDResolver");

const getVcById = (id) => {
  return vcModel.findOne({ _id: id }, {}, {});
};

const verifyVc = async (vc) => {
  const jws = vc.proof.jws;
  console.log(jws);
  const { decodedHeader, decodedPayload, signature } = decodeJWS(jws);
  console.log(decodedHeader);
  console.log(decodedPayload);
  console.log(signature);
  const did = vc.proof.verificationMethod.split("#")[0];
  const publicKey = await getPublicKeyFromDid(did);
  console.log(publicKey);
  const result = verifyJWS(decodedHeader, decodedPayload, publicKey, signature);
  console.log(result);
  return result;
};

const instantiateVc = async (vc) => {
  const { proof, ...vcWithoutProof } = vc;
  const vcSchemaString = JSON.stringify(vcWithoutProof);
  const { privateKey, publicKey } = await generateKeyPair();
  console.log("Key Pairs is generated.");
  const signature = signJWS(vcSchemaString, privateKey);
  console.log("Signature is generated.");
  const JWS = createJWS(vcSchemaString, signature);
  console.log("JWS is generated.");
  console.log(JWS);
  const currentDate = new Date().toISOString();
  const filter = { _id: vc._id };
  const updateProof = {
    $set: {
      "proof.jws": JWS,
      "proof.created": currentDate,
    },
  };
  return vcModel.updateOne(filter, updateProof);
};

exports.getVcById = getVcById;
exports.verifyVc = verifyVc;
exports.instantiateVc = instantiateVc;
