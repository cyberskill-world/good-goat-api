import dotenv from 'dotenv';
import path from 'path';

interface I_SMSConfig {
    ACCOUNT_SID: string;
    AUTH_TOKEN: string;
    SENDER_PHONE: string;
}

interface I_AWSSESConfig {
    API_VERSION: string;
    ACCESS_KEY_ID: string;
    SECRET_ACCESS_KEY: string;
    REGION: string;
}

interface I_SessionConfig {
    COLLECTION_NAME: string;
    SECRET: string;
    MAX_AGE: number;
    TTL: number;
}

interface I_DatabaseCollections {
    /* USER */
    USERS: string;
    USER_VERIFICATIONS: string;
    USER_LEVELS: string;
    USER_PETS: string;
    /* PET */
    PETS: string;
    PET_LEVELS: string;
    RARITIES: string;
    /* EXCERCISE */
    EXERCISES: string;
    USER_EXERCISES: string;
    TOPICS: string;
    QUESTIONS: string;
    /* ORTHER */
    NEWS: string;
    EVENTS: string;
}

interface I_Config {
    IS_DEV: boolean;
    IS_STAG: boolean;
    IS_PROD: boolean;
    ENV_PATH: string;
    BODY_PARSER_LIMIT: string;
    HOST_NAME: string;
    PORT: number;
    GRAPHQL_ENDPOINT: string;
    RESTAPI_ENDPOINT: string;
    MONGO_HOST: string;
    MONGO_PORT: number;
    MONGO_NAME: string;
    MONGO_USERNAME: string;
    MONGO_PASSWORD: string;
    SESSION: I_SessionConfig;
    WS_PORT: number;
    SECRET: string;
    UPLOAD_FOLDER: string;
    DATABASE_COLLECTIONS: I_DatabaseCollections;
    SMS: { TWILIO: I_SMSConfig };
    AWS: { SES: I_AWSSESConfig };
    getCurrentEnvironment: () => 'PRODUCTION' | 'STAGING' | 'DEVELOPMENT';
    USER_PORT: string;
    API_PORT: string;
    WEB_PROTOCOL: string;
    API_HOST_NAME: string;
    USER_HOST_NAME: string;
    USER_HTTP_URI: string;
    RESTAPI_HTTP_URI: string;
    CORS_WHITELIST: string[];
    MONGO_URI: string;
}

const currentDir = path.resolve(__dirname, '../');
const envPath = path.join(currentDir, `.env.${process.env.ENV ?? 'development'}`);
dotenv.config({
    path: envPath,
});

const config: I_Config = {
    IS_DEV: process.env.NODE_ENV === 'development',
    IS_STAG: process.env.NODE_ENV === 'production' && process.env.ENV === 'staging',
    IS_PROD: process.env.NODE_ENV === 'production' && process.env.ENV === 'production',
    ENV_PATH: envPath,
    BODY_PARSER_LIMIT: process.env.BODY_PARSER_LIMIT || '50mb',
    HOST_NAME: process.env.HOST_NAME || '127.0.0.1',
    PORT: parseInt(process.env.PORT || '9000', 10),
    GRAPHQL_ENDPOINT: process.env.GRAPHQL_ENDPOINT || '/graphql',
    RESTAPI_ENDPOINT: process.env.RESTAPI_ENDPOINT || '/rest',
    MONGO_HOST: process.env.MONGO_HOST || '127.0.0.1',
    MONGO_PORT: parseInt(process.env.DB_PORT || '27017', 10),
    MONGO_NAME: process.env.DB_NAME || 'good-goat',
    MONGO_USERNAME: process.env.MONGO_USERNAME || '',
    MONGO_PASSWORD: process.env.MONGO_PASSWORD || '',
    SESSION: {
        COLLECTION_NAME: 'sessions',
        SECRET: 'good-goat-api-session',
        MAX_AGE: 24 * 60 * 60 * 1000, // 24h
        TTL: 24 * 60 * 60,
    },
    WS_PORT: parseInt(process.env.WS_PORT || '7999', 10),
    SECRET: process.env.SECRET || 'ixN0-Vqnj9JAQzE(u*Z59xj#8ZKujr%w', // 32 chars required
    UPLOAD_FOLDER: process.env.UPLOAD_FOLDER || 'bixso',
    DATABASE_COLLECTIONS: {
        USERS: process.env.USER_COLLECTION_NAME || 'users',
        PETS: process.env.PETS_COLLECTION_NAME || 'pets',
        USER_VERIFICATIONS: process.env.USER_VERIFICATION_COLLECTION_NAME || 'user-verifications',
        USER_LEVELS: process.env.USER_LEVELS_COLLECTION_NAME || 'user-levels',
        USER_PETS: process.env.USER_PETS_COLLECTION_NAME || 'user-pets',
        PET_LEVELS: process.env.PET_LEVELS_COLLECTION_NAME || 'pet-levels',
        RARITIES: process.env.RARITY_COLLECTION_NAME || 'rarities',
        EXERCISES: process.env.EXERCISE_COLLECTION_NAME || 'exercises',
        USER_EXERCISES: process.env.USER_EXERCISES_COLLECTION_NAME || 'user-exercises',
        TOPICS: process.env.TOPIC_COLLECTION_NAME || 'topics',
        QUESTIONS: process.env.QUESTION_COLLECTION_NAME || 'questions',
        NEWS: process.env.NEWS_COLLECTION_NAME || 'news',
        EVENTS: process.env.EVENT_COLLECTION_NAME || 'events',
    },
    SMS: {
        TWILIO: {
            ACCOUNT_SID: process.env.TWILIO_SID || '',
            AUTH_TOKEN: process.env.TWILIO_AUTH_TOKEN || '',
            SENDER_PHONE: process.env.TWILIO_SENDER_PHONE || '',
        },
    },
    AWS: {
        SES: {
            API_VERSION: '2010-12-01',
            ACCESS_KEY_ID: process.env.AWS_ACCESS_KEY_ID || '',
            SECRET_ACCESS_KEY: process.env.AWS_SECRET_ACCESS_KEY || '',
            REGION: process.env.AWS_REGION || '',
        },
    },
    getCurrentEnvironment: function (): 'PRODUCTION' | 'STAGING' | 'DEVELOPMENT' {
        throw new Error('Function not implemented.');
    },
    USER_PORT: '',
    API_PORT: '',
    WEB_PROTOCOL: '',
    API_HOST_NAME: '',
    USER_HOST_NAME: '',
    USER_HTTP_URI: '',
    RESTAPI_HTTP_URI: '',
    CORS_WHITELIST: [],
    MONGO_URI: '',
};

config.getCurrentEnvironment = () => {
    if (config.IS_PROD) {
        return 'PRODUCTION';
    }

    if (config.IS_STAG) {
        return 'STAGING';
    }

    return 'DEVELOPMENT';
};

config.USER_PORT = process.env.USER_PORT || (config.IS_STAG ? '' : config.IS_PROD ? '' : `:${8001}`);

config.API_PORT = process.env.API_PORT || (config.IS_STAG ? '' : config.IS_PROD ? '' : `:${config.PORT}`);

config.WEB_PROTOCOL = process.env.WEB_PROTOCOL || `http${config.IS_STAG || config.IS_PROD ? 's' : ''}`;

config.API_HOST_NAME =
    process.env.API_HOST_NAME ||
    (config.IS_STAG ? 'apistaging.goodgoat.com' : config.IS_PROD ? 'api.goodgoat.com' : 'localhost');

config.USER_HOST_NAME =
    process.env.USER_HOST_NAME ||
    (config.IS_STAG ? 'staging.goodgoat.com' : config.IS_PROD ? 'goodgoat.com' : 'localhost');

config.USER_HTTP_URI =
    process.env.USER_HTTP_URI || `${config.WEB_PROTOCOL}://${config.USER_HOST_NAME}${config.USER_PORT}`;

config.RESTAPI_HTTP_URI =
    process.env.RESTAPI_HTTP_URI ||
    `${config.WEB_PROTOCOL}://${config.API_HOST_NAME}${config.API_PORT}${config.RESTAPI_ENDPOINT}`;

config.CORS_WHITELIST =
    process.env.CORS_WHITELIST || config.IS_DEV
        ? ['https://studio.apollographql.com', 'http://localhost:8001']
        : config.IS_STAG
          ? ['https://studio.apollographql.com', 'http://localhost:8001', 'https://staging.goodgoat.com']
          : ['https://studio.apollographql.com'];

config.MONGO_URI =
    process.env.MONGO_URI || config.IS_DEV
        ? `mongodb://${config.MONGO_HOST}:${config.MONGO_PORT}/${config.MONGO_NAME}`
        : `mongodb://${encodeURIComponent(config.MONGO_USERNAME)}:${encodeURIComponent(config.MONGO_PASSWORD)}@${config.MONGO_HOST}:${config.MONGO_PORT}/${config.MONGO_NAME}?authSource=admin`;

export default config;
