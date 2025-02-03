const { Resolver } = require("did-resolver"); // did resolver for public key
const { getResolver } = require("web-did-resolver");

async function resolveDid(did) {
  try {
    const resolver = new Resolver(getResolver());
    const didDocument = await resolver.resolve(did);
    return didDocument.verificationMethod;
  } catch (error) {
    console.error("Error", error.message);
    return null;
  }
}

module.exports = { resolveDid };
