/*based on this schema
  "@context": [
    "https://www.w3.org/ns/credentials/v2",
    "https://www.w3.org/ns/credentials/examples/v2"
  ],
  "id": "https://example.com/credentials/3732",
  "type": ["VerifiableCredential", "EmailCredential"],
  "issuer": "https://example.com/issuers/14",
  "issuanceDate": "2010-01-01T19:23:24Z",
  "credentialSubject": {
    "id": "did:example:ebfeb1f712ebc6f1c276e12ec21",
    "emailAddress": "subject@example.com"
  },
  "credentialSchema": {
    "id": "https://example.com/schemas/email.json",
    "type": "JsonSchema"
  }
}
*/

const { Schema, model} = require ('mongoose');

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
    issuanceDate:{
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
})

const VerifiableCredentialModel = model("credentials", verifiableCredentialSchema);

const getCertificateByIdentity = (identity) => {
    return verifiableCredentialSchema.findOne({ id: identity }, {});
  };

const postCertificate = () => {
    const certificateToBeAdded = { id: identity, ...certificateWithoutId };
    const newCertificate = new VerifiableCredentialModel(certificateToBeAdded);
    return newCertificate.save();
};

exports.VerifiableCredentialModel = VerifiableCredentialModel;
exports.getCertificateByIdentity = getCertificateByIdentity;
exports.postCertificate = postCertificate;

