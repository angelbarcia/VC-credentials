const { Resolver } = require("did-resolver"); // did resolver for public key

async function resolveDid(verificationMethod) {
  const resolver = new Resolver(getResolver());
  const didDocument = await resolver.resolve(verificationMethod);
  return didDocument.publicKey;
}

module.exports = { resolveDid };
