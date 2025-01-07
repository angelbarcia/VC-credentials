const { connect } = require ("mongoose");
const connection_to_mongodb = () => {
    const connection_url = `mongodb://${process.env.MONGO_HOST}:${process.env.MONGO_PORT}/${process.env.MONGO_DATABASE}`;
    return connect(connection_url, JSON.parse(process.env.MONGO_OPTIONS));
    };

    exports.connection_to_mongodb = connection_to_mongodb;