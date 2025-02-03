const jwt = require("jsonwebtoken");
const crypto = require("crypto");
const base64url = require("base64url"); //converter to base 64

async function generateKeyPair() {
  const { privateKey, publicKey } = await crypto.generateKeyPairSync("rsa", {
    modulusLength: 2048,
    publicKeyEncoding: { type: "spki", format: "pem" },
    privateKeyEncoding: { type: "pkcs8", format: "pem" },
  });
  return { publicKey, privateKey };
}

function verifyJWS(jws, publicKey) {
  try {
    const payload = jwt.verify(jws, publicKey, { algorithms: ["RS256"] });
    return { valid: true, payload };
  } catch (error) {
    return { valid: false, error: error.message };
  }
}

function signJWS(vcSchemaString, privateKey) {
  console.log(`signJWS(${vcSchemaString},${JSON.stringify(privateKey)})`);
  const hash = crypto.createHash("sha256").update(vcSchemaString).digest("hex");
  console.log(`hash value is ${hash}.`);
  const signature = crypto.sign("sha256", hash, privateKey);
  console.log("Signature is generated: " + signature);
  return signature;
}

function createJWS(vcSchemaString, signature) {
  const header = {
    alg: "RS256",
    typ: "JWS",
  };
  const encodedHeader = base64url.encode(Buffer.from(JSON.stringify(header)));
  const encodedPayload = base64url.encode(Buffer.from(vcSchemaString));
  const encodedSignature = base64url.encode(signature);

  return `${encodedHeader}.${encodedPayload}.${encodedSignature}`;
}

module.exports = {
  verifyJWS,
  generateKeyPair,
  signJWS,
  createJWS,
};
