const { Resolver } = require("did-resolver"); // did resolver for public key
const { getResolver } = require("web-did-resolver");
const { vc_example } = require("../models/example-model");

async function getPublicKeyFromDid() {
  try {
    const resolver = new Resolver(getResolver());
    const didDocument = await resolver.resolve(
      vc_example.proof.verificationMethod,
    );
    console.log("DID Document:", didDocument);
    if (!vc_example.verificationMethod) {
      throw new Error("Did Document does not contain verificationMethod");
    }
    const verificationMethods = vc_example.verificationMethod;
    const publicKey = verificationMethods.find((method) => {
      return (
        method.type === "Ed25519VerificationKey2020" ||
        method.type === "JsonWebKey2020"
      );
    });
    if (!publicKey) {
      throw new Error("PublicKey not found in DID Document");
    }
    return (
      publicKey.publicKeyJwk ||
      publicKey.publicKeyBase58 ||
      publicKey.publicKeyHex
    );
  } catch (error) {
    console.error("Error to solve DID:", error.message);
    throw error;
  }
}

module.exports = { getPublicKeyFromDid };
