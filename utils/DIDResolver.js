const { Resolver } = require("did-resolver"); // did resolver for public key
const { getResolver } = require("web-did-resolver");

const getPublicKeyFromDid = async (did) => {
  try {
    const resolver = new Resolver(getResolver());
    const didDocument = await resolver.resolve(did);

    if (!didDocument || !didDocument.verificationMethod) {
      throw new Error("Verification method not found.");
    }

    const publicKey = didDocument.verificationMethod.find(
      (vm) => vm.publicKeyBase58 || vm.publicKeyJwk,
    );

    if (!publicKey) {
      throw new Error("publicKey not found in the Verification Method.");
    }

    return publicKey.publicKeyBase58 || publicKey.publicKeyJwk;
  } catch (error) {
    console.error("Error to obtain the public key", error);
    return null;
  }
};

module.exports = { getPublicKeyFromDid };
