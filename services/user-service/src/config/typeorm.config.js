"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.typeOrmConfig = void 0;
var user_entity_1 = require("../users/entities/user.entity"); // Импортируйте ваши сущности
var typeOrmConfig = function (configService) { return ({
    type: 'postgres',
    host: configService.get('dbHost'),
    port: configService.get('dbPort'),
    username: configService.get('dbUsername'),
    password: configService.get('dbPassword'),
    database: configService.get('dbName'),
    url: configService.get('databaseUrl'),
    entities: [user_entity_1.User], // Добавьте все ваши сущности сюда
    synchronize: true, // В продакшене рекомендуется установить в false
}); };
exports.typeOrmConfig = typeOrmConfig;
