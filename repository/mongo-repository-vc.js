const {Schema, model} = require('mongoose');

const credentialSubjectSchema = new Schema({
    id: {
        type: String,
        required: true
    },
    emailAddress: {
        type: String,
        required: true,
        match: [/.+@.+\..+/, 'Please, insert a valid email']
    }
});

const credentialSchema = new Schema({
    id: {
        type: String,
        required: true
    },
    type: {
        type: String,
        required: true
    },
})
const proofSchema = new Schema({
    "type": {
        type: String,
        required: true,
        enums: ["Ed25519Signature2020", "JsonWebSignature2020"]
    },
    "created": {
        type: Date,
        required: true
    },
    "verificationMethod": {
        type: String,
        required: true,
        default: "did:example:deepcloudlabs#rsa-public-key"
    },
    "proofPurpose": {
        type: String,
        required: true,
        enums: ["authentication", "assertionMethod", "keyAgreement", "contractAgreement"],
        default: "assertionMethod"
    },
    "jws": {
        type: String,
        required: true
    }
})

const verifiableCredentialSchema = new Schema({
    "@context": {
        type: String,
        required: true
    },
    id: {
        type: String,
        required: true
    },
    type: {
        type: String,
        required: true
    },
    issuer: {
        type: String,
        required: true
    },
    issuanceDate: {
        type: Date,
        required: true
    },
    credentialSubject: {
        type: credentialSubjectSchema,
        required: true
    },
    credentialSchema: {
        type: credentialSchema,
        required: true
    },
    proof: {
        type: proofSchema,
        required: true
    }
})

const VerifiableCredentialModel = model("credentials", verifiableCredentialSchema);

const getVerifiableCredentialsById = (id) => {
    return VerifiableCredentialModel.findOne({id: id}, {}, {});
};

const verifyVerifiableCredentials = (vc) => {
    //TODO: we receive a verifiable credentials and we will verify it and return the result!
}

const instantiateVerifiableCredentials = ({identity, certificate}) => {
    const newCertificate = new VerifiableCredentialModel(
        {
            "@context": [
                "https://www.w3.org/ns/credentials/v2",
                "https://www.w3.org/ns/credentials/examples/v2"
            ],
            "id": "https://example.com/credentials/3732",
            "type": ["VerifiableCredential", "EmailCredential"],
            "issuer": "https://deepcloudlabs.com/issuers/42",
            "issuanceDate": new Date().toString(),
            "credentialSubject": {
                "id": "did:example:ebfeb1f712ebc6f1c276e12ec21",
                "emailAddress": identity
            },
            "credentialSchema": {
                "id": "https://example.com/schemas/email.json",
                "type": "JsonSchema"
            },
            proof: {
                "type": "Ed25519Signature2020",
                "created": "2025-01-01T12:00:00Z",
                "verificationMethod": "did:example:deepcloudlabs#rsa-public-key-1",
                "proofPurpose": "assertionMethod",
                "jws": "eyJhbGciOiJFZERTQSJ9..MEUCIQCY12345EXAMPLESIGNEDDATA12345rEQHgIerA"
            }
        }
    );
    // jws -> take hash code of the document (Ed25519) -> encrypt the hash code with RSA private key -> signature
    // {header: {type: "hash algorithm"}, payload -> document, signature} -> base64 encoding -> jws
    return newCertificate.save();
};

exports.VerifiableCredentialModel = VerifiableCredentialModel;
exports.getVerifiableCredentialsById = getVerifiableCredentialsById;
exports.verifyVerifiableCredentials = verifyVerifiableCredentials;
exports.instantiateVerifiableCredentials = instantiateVerifiableCredentials;

