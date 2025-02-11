const axios = require("axios");

async function getAccessToken() {
  const tenantId = process.env.TENANT_ID;
  const clientId = process.env.CLIENT_ID;
  const clientSecret = process.env.CLIENT_SECRET;

  const response = await axios.post(
    `https://login.microsoftonline.com/${tenantId}/oauth2/v2.0/token`,
    new URLSearchParams({
      grant_type: "client_credentials",
      client_id: clientId,
      client_secret: clientSecret,
      scope: "https://verifiedid.microsoft.com/.default",
    }),
    {
      headers: {
        "Content-Type": "application/x-www-form-urlencoded",
      },
    },
  );

  return response.data.access_token;
}

async function issueVcMicrosoft(url, state, apiKey, clientName) {
  const accessToken = await getAccessToken();
  const credentialPayload = {
    callback: {
      url: url,
      state: state,
      headers: {
        "api-key": apiKey,
      },
    },
    authority: "did:web:did.deepcloudlabs.com",
    registration: {
      clientName: clientName,
    },
    type: "VerifiedEmployee",
    manifest:
      "https://verifiedid.did.msidentity.com/v1.0/tenants/827cfa74-3589-40e8-b6f4-2f35aab2e201/verifiableCredentials/contracts/29ddf47c-251b-2792-5614-50408c086db3/manifest",
  };

  const response = await axios.post(
    "https://verifiedid.did.msidentity.com/v1.0/verifiableCredentials/createIssuanceRequest",
    credentialPayload,
    {
      headers: {
        Authorization: `Bearer ${accessToken}`,
        "Content-Type": "application/json",
      },
    },
  );
  return response;
}

async function verifyVCMicrosoft(jws) {
  const accessToken = await getAccessToken();
  const { credential } = jws;
  const response = await axios.post(
    "https://verifiedid.did.msidentity.com/v1.0/verifiableCredentials/verify",
    { credential },
    {
      headers: {
        Authorization: `Bearer ${accessToken}`,
        "Content-Type": "application/json",
      },
    },
  );
  return response.data;
}
module.exports = { issueVcMicrosoft, verifyVCMicrosoft };
