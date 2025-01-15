# VC-credentials

hashtag verification method/
"verificationMethod": "did:example:123456#key-1"
username by left (example 12345)
left of hashtag we have the public key


jws SflKxwRJSMeKKF2QT4fwpMeJf36POk6yJV_adQssw5c

It is the signature, we will take the hash of the doc (before the proof), using the type.proof.

Then we will sign it using the private key.

jws- take the hash of the document. using the method Ed25519signature2020 and we encrypt the hashcode with RSA private key.

Then we use it as the signature. And crypt it to jws.

JWS will have: {
header = hash algorithm, payload = document part(before proof), signature} => base64encoding.

we will get JWS with the doc signed.
