const express = require ("express");
const api = express();
const logger = require ("morgan");
const bodyParser = require ("body-parser");
const {
    getCertificateByIdentity,
    postCertificate
} = require ("../repository/mongo-repository-hr");
const createApi = (callbackFun) => {
    api.use(bodyParser.json({ limit: "5mb" }));
    api.use(logger("dev"));
    api.use((req, res, next) => {
        res.header("Access-Control-Allow-Origin", "*");
        res.header("Access-Control-Allow-Headers", "Origin, X-Requested-With, Content-Type, Accept");
        res.header("Access-Control-Allow-Methods",
      "HEAD,OPTIONS,POST,PUT,PATCH,DELETE,GET");
      next();
});

api.get("/hr/api/v1/credentials/:identity", (req, res) => {
    const { identity } = req.params;
    getCertificateByIdentity(identity)
    .then((certificate) => {
        res.set("Content-Type", "application/json");
        res.status(200).send(certificate);
    })
    .catch((error) => {
        res.status(400).send(error);
    });
});

api.post("/hr/api/v1/credentials"), (req, res) => {
    const { identity, certificate } = req.body;
    postCertificate(identity, certificate)
    .then((certificate) => {
        res.set("Content-Type", "application/json");
        res.status(201).send(certificate);
    })
    .catch((error) => {
        res.status(400).send({ error });
    });
    };

const server = api.listen(process.env.API_PORT || 8100, callbackFun);
};

exports.getApi = () => {
    return api;
    };

exports.createApi = createApi;
