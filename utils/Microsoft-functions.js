const axios = require("axios");
const microsoftModel = require("../models/microsoft-model");
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

async function issueVcMicrosoft(credentialPayload) {
  const accessToken = await getAccessToken();
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
