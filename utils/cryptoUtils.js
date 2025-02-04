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

function decodeJWS(jws) {
  const [header, payload, signature] = jws.split(".");
  const decodedHeader = JSON.parse(Buffer.from(header, "base64").toString());
  const decodedPayload = JSON.parse(Buffer.from(payload, "base64").toString());
  return { decodedHeader, decodedPayload, signature };
}

function verifyJWS(decodedHeader, decodedPayload, publicKey, signature) {
  try {
    const verify = crypto.createVerify("RSA-SHA256");
    verify.update(`${decodedHeader}.${decodedPayload}`);
    const isVerified = verify.verify(publicKey, signature, "base64");
    console.log("Valid Sign:", isVerified);
    return { valid: isVerified };
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
  decodeJWS,
};
