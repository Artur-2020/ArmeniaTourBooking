"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.default = (function () { return ({
    rabbitmqUrl: process.env.RABBITMQ_URL,
    port: parseInt(process.env.LOCAL_PORT, 10),
    databaseUrl: process.env.DATABASE_URL,
    dbHost: process.env.DB_HOST,
    dbPort: parseInt(process.env.DB_PORT, 10),
    dbUsername: process.env.DB_USERNAME,
    dbPassword: process.env.DB_PASSWORD,
    dbName: process.env.DB_NAME,
}); });
