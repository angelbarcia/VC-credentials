const express = require("express");
const api = express();
const logger = require("morgan");
const bodyParser = require("body-parser");
const {
  getVcById,
  verifyVc,
  instantiateVc,
} = require("../repository/mongo-repository-vc");
const {
  issueVcMicrosoft,
  verifyVCMicrosoft,
} = require("../utils/Microsoft-functions");

const createApi = (callbackFun) => {
  api.use(bodyParser.json({ limit: "5mb" }));
  api.use(logger("dev"));
  api.use((req, res, next) => {
    res.header("Access-Control-Allow-Origin", "*");
    res.header(
      "Access-Control-Allow-Headers",
      "Origin, X-Requested-With, Content-Type, Accept",
    );
    res.header(
      "Access-Control-Allow-Methods",
      "HEAD,OPTIONS,POST,PUT,PATCH,DELETE,GET",
    );
    next();
  });

  api.get("/vc-issuer/api/v1/health", (req, res) => {
    res.set("Content-Type", "application/json");
    res.status(200).send({ status: "OK" });
  });

  api.get("/vc-issuer/api/v1/credentials/:id", (req, res) => {
    const { id } = req.params;
    getVcById(id)
      .then((vc) => {
        res.set("Content-Type", "application/json");
        res.status(200).json(vc);
      })
      .catch((error) => {
        res.status(400).send(error);
      });
  });

  api.post("/vc-issuer/api/v1/verify", (req, res) => {
    const vc = req.body;
    verifyVc(vc)
      .then((result) => {
        res.set("Content-Type", "application/json");
        res.status(200).json(result);
      })
      .catch((error) => {
        res.status(400).send({ error });
      });
  });
  // instantiating a VC
  api.post("/vc-issuer/api/v1/credentials", (req, res) => {
    const vc = req.body;
    instantiateVc(vc)
      .then((signedVc) => {
        res.set("Content-Type", "application/json");
        res.status(200).json(signedVc);
      })
      .catch((error) => {
        res.status(400).send({ error });
      });
  });

  //MICROSOFT VERIFIED ID ISSUE A CREDENTIAL + VERIFY A CREDENTIAL
  api.post("/vc-issuer/api/v1/issue-credential", (req, res) => {
    const credentialPayload = req.body;
    issueVcMicrosoft(credentialPayload)
      .then((response) => response.json())
      .then((data) => {
        console.log("VC issued successfully");
        res.json(data);
      })
      .catch((error) => {
        console.error("Error to issue VC:", error);
        res.status(500).send({ error: "Error to issue VC" });
      });
  });

  api.post("/vc-issuer/api/v1/verify-credential", (req, res) => {
    const jws = req.body;
    verifyVCMicrosoft(jws)
      .then((response) => response.json())
      .then((data) => {
        console.log("VC is legit");
        res.json(data);
      })
      .catch((error) => {
        console.error("Verification failed:", error);
        res.status(500).send({ error: "Verification failed" });
      });
  });

  const server = api.listen(process.env.API_PORT || 8100, callbackFun);
}; // createApi

exports.getApi = () => {
  return api;
};

exports.createApi = createApi;
