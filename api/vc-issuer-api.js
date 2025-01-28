const express = require("express");
const api = express();
const logger = require("morgan");
const bodyParser = require("body-parser");
const {
    instantiateVerifiableCredentials,
    getVerifiableCredentialsById,
    verifyVerifiableCredentials,
} = require("../repository/mongo-repository-vc");

const createApi = (callbackFun) => {
    api.use(bodyParser.json({limit: "5mb"}));
    api.use(logger("dev"));
    api.use((req, res, next) => {
        res.header("Access-Control-Allow-Origin", "*");
        res.header(
            "Access-Control-Allow-Headers",
            "Origin, X-Requested-With, Content-Type, Accept"
        );
        res.header(
            "Access-Control-Allow-Methods",
            "HEAD,OPTIONS,POST,PUT,PATCH,DELETE,GET"
        );
        next();
    });

    api.get("/vc-issuer/api/v1/health", (req, res) => {
        res.set("Content-Type", "application/json");
        res.status(200).send({"status": "OK"});
    });

    api.get("/vc-issuer/api/v1/credentials/:id", (req, res) => {
        const {id} = req.params;
        getVerifiableCredentialsById(id)
            .then((certificate) => {
                res.set("Content-Type", "application/json");
                res.status(200).send(certificate);
            })
            .catch((error) => {
                res.status(400).send(error);
            });
    });

    api.post("/vc-issuer/api/v1/verify", (req, res) => {
        const vc = req.body;
        verifyVerifiableCredentials(vc)
            .then((result) => {
                res.set("Content-Type", "application/json");
                res.status(200).send(result);
            })
            .catch((error) => {
                res.status(400).send({error});
            });
    });
    // instantiating a VC
    api.post("/vc-issuer/api/v1/credentials", (req, res) => {
        const {id, updatedProof} = req.body;
        instantiateVerifiableCredentials({id, updatedProof})
            .then((certificate) => {
                res.set("Content-Type", "application/json");
                res.status(201).send(certificate);
            })
            .catch((error) => {
                res.status(400).send({error});
            });
    });

    const server = api.listen(process.env.API_PORT || 8100, callbackFun);
}; // createApi

exports.getApi = () => {
    return api;
};

exports.createApi = createApi;
