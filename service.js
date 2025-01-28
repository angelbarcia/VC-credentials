const { connection_to_mongodb } = require("./repository/mongo-repository-base");
const { createApi } = require("./api/vc-issuer-api");

connection_to_mongodb().then((response) => {
  console.log(
    `Connected to the MongoDB instance running at ${process.env.MONGO_HOST}:${process.env.MONGO_PORT}/${process.env.MONGO_DATABASE}`
  );
  createApi(() => {
    console.info(`API is listening on PORT ${process.env.API_PORT || 8100}`);
  });
});
