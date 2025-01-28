# Verifiable Credentials Issuer Service

## Overview
The Verifiable Credentials Issuer Service is a Node.js-based application that enables the issuance of verifiable credentials (VCs) in compliance with W3C standards. This service supports the latest Verifiable Credentials Data Model v2.0, providing enhanced features for decentralized identity ecosystems, allowing organizations to issue tamper-proof, digitally signed credentials to users or entities.

## Features
- Issue W3C-compliant verifiable credentials (v2.0).
- Support for JSON-LD, JWT, and ZKP credential formats.
- Enhanced integration with Decentralized Identifiers (DIDs) and DIDComm protocols.
- Secure and scalable REST API for credential issuance.
- Configurable key management for signing credentials, including support for hardware security modules (HSMs).
- Compatibility with v2.0 standards for improved interoperability.
- Easy integration with existing identity systems.

## Prerequisites
- [Node.js](https://nodejs.org/) (version 18 or later)
- [npm](https://www.npmjs.com/) (comes with Node.js)
- A key management solution (e.g., a DID key pair, an HSM, or an external key management system).

## Installation

1. Clone the repository:
   ```bash
   git clone https://github.com/angelbarcia/VC-credentials.git
   cd VC-credentials
   ```

2. Install dependencies:
   ```bash
   npm install
   ```

3. Configure environment variables by creating a `.env` file:
  ```env
  MONGO_HOST=localhost
  MONGO_PORT=27017
  MONGO_DATABASE=vc-db
  MONGO_OPTIONS={"socketTimeoutMS": 0}
  
  API_PORT=8100
  VC_VERSION=2.0
  ```

4. Start the service:
   ```bash
   npm start
   ```

## API Endpoints

### 1. Health Check
- **Endpoint:** `GET /health`
- **Description:** Verify if the service is running.
- **Response:**
  ```json
  {
    "status": "ok"
  }
  ```

### 2. Issue Credential
- **Endpoint:** `POST /issue`
- **Description:** Issue a verifiable credential (v2.0).
- **Request Body:**
  ```json
  {
    "credentialSubject": {
      "id": "did:example:123456789",
      "name": "John Doe",
      "degree": "Bachelor of Science in Computer Science"
    },
    "type": ["VerifiableCredential", "UniversityDegreeCredential"],
    "issuer": "did:example:issuer123",
    "expirationDate": "2025-01-01T00:00:00Z"
  }
  ```
- **Response:**
  ```json
  {
    "@context": [
      "https://www.w3.org/2018/credentials/v1",
      "https://www.w3.org/2018/credentials/examples/v2"
    ],
    "type": ["VerifiableCredential", "UniversityDegreeCredential"],
    "issuer": "did:example:issuer123",
    "issuanceDate": "2025-01-01T00:00:00Z",
    "expirationDate": "2025-01-01T00:00:00Z",
    "credentialSubject": {
      "id": "did:example:123456789",
      "name": "John Doe",
      "degree": "Bachelor of Science in Computer Science"
    },
    "proof": {
      "type": "Ed25519Signature2020",
      "created": "2025-01-01T00:00:00Z",
      "verificationMethod": "did:example:issuer123#key-1",
      "proofPurpose": "assertionMethod",
      "jws": "eyJhbGciOiJFZERTQSJ9..."
    }
  }
  ```

### 3. Verify Credential
- **Endpoint:** `POST /verify`
- **Description:** Verify the validity of a verifiable credential (v2.0).
- **Request Body:**
  ```json
  {
    "verifiableCredential": {
      "@context": [
        "https://www.w3.org/2018/credentials/v1",
        "https://www.w3.org/2018/credentials/examples/v2"
      ],
      "type": ["VerifiableCredential", "UniversityDegreeCredential"],
      "issuer": "did:example:issuer123",
      "issuanceDate": "2025-01-01T00:00:00Z",
      "expirationDate": "2025-01-01T00:00:00Z",
      "credentialSubject": {
        "id": "did:example:123456789",
        "name": "John Doe",
        "degree": "Bachelor of Science in Computer Science"
      },
      "proof": {
        "type": "Ed25519Signature2020",
        "created": "2025-01-01T00:00:00Z",
        "verificationMethod": "did:example:issuer123#key-1",
        "proofPurpose": "assertionMethod",
        "jws": "eyJhbGciOiJFZERTQSJ9..."
      }
    }
  }
  ```
- **Response:**
  ```json
  {
    "valid": true,
    "message": "The credential is valid."
  }
  ```

## Testing
Run the test suite using the following command:
```bash
npm test
```

## Contribution
Contributions are welcome! Please follow these steps:
1. Fork the repository.
2. Create a feature branch: `git checkout -b feature-name`.
3. Commit your changes: `git commit -m 'Add feature'`.
4. Push to your branch: `git push origin feature-name`.
5. Open a pull request.

## License
This project is licensed under the MIT License. See the [LICENSE](LICENSE) file for details.

## Acknowledgements
- [W3C Verifiable Credentials Data Model v2.0](https://www.w3.org/TR/vc-data-model/)
- [DID Specification](https://www.w3.org/TR/did-core/)
- [DIDComm Protocol](https://identity.foundation/didcomm-messaging/spec/)

---
For more information, contact [binnur.kurt@gmail.com].
