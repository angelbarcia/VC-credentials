const mongoose = require("mongoose");
const Schema = mongoose.Schema;

const microsoftVCSchema = new Schema({
  callback: {
    url: { type: String, required: true },
    state: { type: String, required: true },
    headers: {
      "api-key": { type: String, required: true },
    },
  },
  authority: { type: String, default: "" },
  registration: {
    clientName: { type: String, required: true },
  },
  type: { type: String, required: true },
  manifest: {
    type: String,
    required: true,
    default:
      "https://verifiedid.did.msidentity.com/v1.0/tenants/827cfa74-3589-40e8-b6f4-2f35aab2e201/verifiableCredentials/contracts/29ddf47c-251b-2792-5614-50408c086db3/manifest",
  },
});

const credentialPayload = mongoose.model("microsoftVC", microsoftVCSchema);

module.exports = credentialPayload;
