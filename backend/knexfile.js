"use strict";
var __createBinding = (this && this.__createBinding) || (Object.create ? (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    var desc = Object.getOwnPropertyDescriptor(m, k);
    if (!desc || ("get" in desc ? !m.__esModule : desc.writable || desc.configurable)) {
      desc = { enumerable: true, get: function() { return m[k]; } };
    }
    Object.defineProperty(o, k2, desc);
}) : (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    o[k2] = m[k];
}));
var __setModuleDefault = (this && this.__setModuleDefault) || (Object.create ? (function(o, v) {
    Object.defineProperty(o, "default", { enumerable: true, value: v });
}) : function(o, v) {
    o["default"] = v;
});
var __importStar = (this && this.__importStar) || (function () {
    var ownKeys = function(o) {
        ownKeys = Object.getOwnPropertyNames || function (o) {
            var ar = [];
            for (var k in o) if (Object.prototype.hasOwnProperty.call(o, k)) ar[ar.length] = k;
            return ar;
        };
        return ownKeys(o);
    };
    return function (mod) {
        if (mod && mod.__esModule) return mod;
        var result = {};
        if (mod != null) for (var k = ownKeys(mod), i = 0; i < k.length; i++) if (k[i] !== "default") __createBinding(result, mod, k[i]);
        __setModuleDefault(result, mod);
        return result;
    };
})();
Object.defineProperty(exports, "__esModule", { value: true });
const dotenv = __importStar(require("dotenv"));
// Carrega variáveis de ambiente antes de tudo
dotenv.config();
const environment_1 = require("./src/config/environment");
const knexConfig = {
    development: {
        client: 'postgresql',
        connection: {
            host: environment_1.config.database.host,
            port: environment_1.config.database.port,
            database: environment_1.config.database.name,
            user: environment_1.config.database.user,
            password: environment_1.config.database.password,
        },
        pool: {
            min: 2,
            max: 10,
        },
        migrations: {
            tableName: 'knex_migrations',
            directory: './src/database/migrations',
        },
        seeds: {
            directory: './src/database/seeds',
        },
    },
    test: {
        client: 'postgresql',
        connection: {
            host: environment_1.config.database.host,
            port: environment_1.config.database.port,
            database: `${environment_1.config.database.name}_test`,
            user: environment_1.config.database.user,
            password: environment_1.config.database.password,
        },
        pool: {
            min: 1,
            max: 5,
        },
        migrations: {
            tableName: 'knex_migrations',
            directory: './src/database/migrations',
        },
        seeds: {
            directory: './src/database/seeds',
        },
    },
    production: {
        client: 'postgresql',
        connection: {
            host: environment_1.config.database.host,
            port: environment_1.config.database.port,
            database: environment_1.config.database.name,
            user: environment_1.config.database.user,
            password: environment_1.config.database.password,
            ssl: environment_1.config.database.ssl,
        },
        pool: {
            min: 2,
            max: 20,
        },
        migrations: {
            tableName: 'knex_migrations',
            directory: './src/database/migrations',
        },
        seeds: {
            directory: './src/database/seeds',
        },
    },
};
exports.default = knexConfig;
//# sourceMappingURL=knexfile.js.map