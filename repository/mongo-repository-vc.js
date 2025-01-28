const {Schema, model} = require("mongoose");
const crypto = require("crypto");
const base64url = require("base64url"); //converter to base 64
const {Resolver} = require("did-resolver"); // did resolver for public key
const {getResolver} = require("@3id/did-provider"); // did resolver for public key

const credentialSubjectSchema = new Schema({
    id: {
        type: String,
        required: true,
    },
    emailAddress: {
        type: String,
        required: true,
        match: [/.+@.+\..+/, "Please, insert a valid email"],
    },
});

const credentialSchema = new Schema({
    id: {
        type: String,
        required: true,
    },
    type: {
        type: String,
        required: true,
    },
});
const proofSchema = new Schema({
    type: {
        type: String,
        required: true,
        enums: ["Ed25519Signature2020", "JsonWebSignature2020"],
    },
    created: {
        type: Date,
        required: true,
    },
    verificationMethod: {
        type: String,
        required: true,
        default: "did:example:deepcloudlabs#rsa-public-key",
    },
    proofPurpose: {
        type: String,
        required: true,
        enums: [
            "authentication",
            "assertionMethod",
            "keyAgreement",
            "contractAgreement",
        ],
        default: "assertionMethod",
    },
    jws: {
        type: String,
        required: true,
    },
});

const verifiableCredentialSchema = new Schema({
    "@context": {
        type: String,
        required: true,
    },
    id: {
        type: String,
        required: true,
    },
    type: {
        type: String,
        required: true,
    },
    issuer: {
        type: String,
        required: true,
    },
    issuanceDate: {
        type: Date,
        required: true,
    },
    credentialSubject: {
        type: credentialSubjectSchema,
        required: true,
    },
    credentialSchema: {
        type: credentialSchema,
        required: true,
    },
    proof: {
        type: proofSchema,
        required: true,
    },
});

const VerifiableCredentialModel = model(
    "credentials",
    verifiableCredentialSchema
);

const getVerifiableCredentialsById = (id) => {
    return VerifiableCredentialModel.findOne({id: id}, {}, {});
};

const verifyVerifiableCredentials = (vc) => {
    //TODO: we receive a verifiable credentials and we will verify it and return the result!
    //we get the jws of the doc
    const {
        proof: {jws, verificationMethod},
        ...restOfVc
    } = vc;

    // we call the did resolver to get the public key
    async function resolveDid() {
        const resolver = new Resolver(getResolver());
        const didDocument = await resolver.resolve(verificationMethod);
        return didDocument.publicKey;
    }

    const publicKey = resolveDid();

    function verifyJWS(jws, publicKey) {
        //we split the JWS
        const [headerB64, payloadB64, signatureB64] = jws.split(".");
        //Convert the parts into legible
        const header = JSON.parse(
            Buffer.from(headerB64, "base64").toString("utf-8")
        );
        const payload = JSON.parse(
            Buffer.from(payloadB64, "base64").toString("utf-8")
        );
        const signature = Buffer.from(signatureB64, "base64");

        //we define the data to verify (header+payload in base64) and we create the verification object with the algorithm SHA256
        const dataToVerify = `${headerB64}.${payloadB64}`;
        const verify = crypto.createVerify("RSA-SHA256");
        // we update the data to verify
        verify.update(dataToVerify);
        verify.end();
        // we finally check if it is valid or not
        const isValid = verify.verify(publicKey, signature);
        return isValid ? payload : null;
    }

    //we get the result.
    const result = verifyJWS(jws, publicKey);
    console.log(result);
};

const instantiateVerifiableCredentials = ({identity, updatedProof}) => {
    const newCertificate = new VerifiableCredentialModel({
        "@context": [
            "https://www.w3.org/ns/credentials/v2",
            "https://www.w3.org/ns/credentials/examples/v2",
        ],
        id: "https://example.com/credentials/3732",
        type: ["VerifiableCredential", "EmailCredential"],
        issuer: "https://deepcloudlabs.com/issuers/42",
        issuanceDate: new Date().toString(),
        credentialSubject: {
            id: "did:example:ebfeb1f712ebc6f1c276e12ec21",
            emailAddress: identity,
        },
        credentialSchema: {
            id: "https://example.com/schemas/email.json",
            type: "JsonSchema",
        },
        proof: {
            type: "Ed25519Signature2020",
            created: "2025-01-01T12:00:00Z",
            verificationMethod: "did:example:deepcloudlabs#rsa-public-key-1",
            proofPurpose: "assertionMethod",
            jws: "eyJhbGciOiJFZERTQSJ9..MEUCIQCY12345EXAMPLESIGNEDDATA12345rEQHgIerA",
        },
    });
    // splitting the proof and generating the hash
    const {proof, ...vcWithoutProof} = newCertificate;
    const vcSchemaString = JSON.stringify(vcWithoutProof);
    const hash = crypto.createHash("sha256").update(vcSchemaString).digest("hex");

    // generating the keys in case they are not created yet
    const generateKeyPair = () => {
        const {publicKey, privateKey} = crypto.generateKeyPairSync("rsa", {
            modulusLength: 2048,
            publicKeyEncoding: {
                type: "spki",
                format: "pem",
            },
            privateKeyEncoding: {
                type: "pkcs8",
                format: "pem",
                cipher: "aes-256-cbc",
                passphrase: "my_secure_password",
            },
        });
        return {publicKey, privateKey};
    }

    if (!publicKey || !privateKey) {
        generateKeyPair();
    }

    // signing the doc with the hash and private key created.
    const signature = crypto.sign("sha256", hash, privateKey);

    // Creating the JWS
    // Header
    const header = {
        alg: "RS256",
        typ: "JWS",
    };

    // As we have everything created, we start encrypting it into a JWS file
    const generateJWS = () => {
        const encodedHeader = base64url.encode(Buffer.from(JSON.stringify(header)));
        const encodedPayload = base64url.encode(Buffer.from(vcSchemaString));
        const encodedSignature = base64url.encode(signature);

        return `${encodedHeader}.${encodedPayload}.${encodedSignature}`;
    }

    // we update the proof including the new jws and the date and we define the filter and what
    // to update in mongoDB to finally update the doc.
    const newJWS = generateJWS();
    const currentDate = new Date().toISOString();
    const filter = {_id: identity};
    const updatedProofDocument = {
        $set: {
            "proof.jws": newJWS,
            "proof.created": currentDate,
        },
    };
    // jws -> take hash code of the document (Ed25519) -> encrypt the hash code with RSA private key -> signature
    // {header: {type: "hash algorithm"}, payload -> document, signature} -> base64 encoding -> jws
    return VerifiableCredentialModel.updateOne(filter, updatedProofDocument);
};

exports.VerifiableCredentialModel = VerifiableCredentialModel;
exports.getVerifiableCredentialsById = getVerifiableCredentialsById;
exports.verifyVerifiableCredentials = verifyVerifiableCredentials;
exports.instantiateVerifiableCredentials = instantiateVerifiableCredentials;
