import { ApolloServer } from '@apollo/server';
import { expressMiddleware } from '@apollo/server/express4';
import { ApolloServerPluginDrainHttpServer } from '@apollo/server/plugin/drainHttpServer';
import {
    ApolloServerPluginLandingPageLocalDefault,
    ApolloServerPluginLandingPageProductionDefault,
} from '@apollo/server/plugin/landingPage/default';
import { json } from 'body-parser';
import compression from 'compression';
import mongoStore from 'connect-mongo';
import cors from 'cors';
import express from 'express';
import device from 'express-device';
import session, { SessionOptions } from 'express-session';
import { useServer } from 'graphql-ws/lib/use/ws';
import { createServer } from 'http';
import mongoose from 'mongoose';
import notifier from 'node-notifier';
import { WebSocketServer } from 'ws';

import config from '#config';
import { mainRouter } from '#modules/rest-api';
import schema from '#shared/graphql/schema';

(async () => {
    // const { authCtr, cronJobCtr }: any = getControllers();
    // Create an Express app and HTTP server; we will attach both the WebSocket
    // server and the ApolloServer to this HTTP server.
    const app = express();

    app.use(express.urlencoded({ extended: true }));
    app.use(express.json({ limit: config.BODY_PARSER_LIMIT }));
    app.use(compression());
    app.use(express.static(config.UPLOAD_FOLDER));
    app.use(device.capture());

    const sessionOptions: SessionOptions = {
        secret: config.SESSION.SECRET,
        resave: false,
        saveUninitialized: false,
        store: mongoStore.create({
            mongoUrl: config.MONGO_URI,
            ttl: config.SESSION.TTL,
            collectionName: config.SESSION.COLLECTION_NAME,
        }),
        cookie: {
            maxAge: config.SESSION.MAX_AGE,
        },
    };

    if (app.get('env') !== 'development') {
        app.set('trust proxy', 1); // trust first proxy

        if (sessionOptions.cookie) {
            sessionOptions.cookie.secure = true; // serve secure cookies
            sessionOptions.cookie.sameSite = 'none';
        }
    }

    app.use(session(sessionOptions));

    const corsOptionsDelegate = {
        origin(requestOrigin, callback) {
            let newOrigin;

            if (!config.IS_PROD) {
                newOrigin = false;
            } else {
                if (config.CORS_WHITELIST.indexOf(requestOrigin) !== -1 || !requestOrigin) {
                    newOrigin = true;
                } else {
                    newOrigin = false;
                }
            }

            callback(null, { origin: newOrigin });
        },
        credentials: true,
    };

    app.use(
        config.RESTAPI_ENDPOINT,
        cors<cors.CorsRequest>(corsOptionsDelegate),
        // authCtr.checkAuthorizedRest,
        // eslint-disable-next-line @typescript-eslint/ban-ts-comment
        //@ts-ignore
        mainRouter,
    );

    if (!config.IS_PROD) {
        mongoose.set('debug', true);
    }

    const httpServer = createServer(app);

    // Create our WebSocket server using the HTTP server we just set up.
    const wsServer = new WebSocketServer({
        server: httpServer,
        path: config.GRAPHQL_ENDPOINT,
    });

    // Save the returned server's info so we can shutdown this server later
    const serverCleanup = useServer({ schema }, wsServer);

    // Set up ApolloServer.
    const server = new ApolloServer({
        schema,
        csrfPrevention: config.IS_DEV || config.IS_STAG ? false : true,
        plugins: [
            ...(config.getCurrentEnvironment() === 'PRODUCTION'
                ? [ApolloServerPluginLandingPageProductionDefault()]
                : [ApolloServerPluginLandingPageLocalDefault()]),
            // Proper shutdown for the HTTP server.
            ApolloServerPluginDrainHttpServer({ httpServer }),
            // Proper shutdown for the WebSocket server.
            {
                async serverWillStart() {
                    return {
                        async drainServer() {
                            await serverCleanup.dispose();
                        },
                    };
                },
            },
        ],
        ...(config.IS_STAG
            ? {
                  introspection: true,
                  includeStacktraceInErrorResponses: true,
              }
            : config.IS_DEV
              ? {
                    introspection: true,
                    includeStacktraceInErrorResponses: true,
                }
              : {}),
    });

    await server.start();

    app.use(
        config.GRAPHQL_ENDPOINT,
        cors<cors.CorsRequest>(corsOptionsDelegate),
        json({ limit: config.BODY_PARSER_LIMIT }),
        expressMiddleware(server, {
            context: async ({ req }) => {
                // await authCtr.checkAuthorizedGraphql(req);

                return {
                    SECRET: config.SECRET,
                    req,
                };
            },
        }),
    );

    ['SIGINT', 'SIGTERM'].forEach((signal) => {
        process.on(signal, async () => {
            await serverCleanup.dispose();
            console.info('Gracefully shutting down server...');
            process.exit(1);
        });
    });

    mongoose
        .connect(config.MONGO_URI)
        .then(async () => {
            console.info(`MongoDb is now running on ${config.MONGO_URI}`);
            // Now that our HTTP server is fully set up, we can listen to it.
            httpServer.listen(config.PORT, async () => {
                // cronJobCtr.start();

                notifier.notify({
                    title: 'Success',
                    message: 'Server started!',
                });

                console.info(`Running RestAPI on http://${config.HOST_NAME}:${config.PORT}${config.RESTAPI_ENDPOINT}`);

                console.info(`Running GRAPHQL on http://${config.HOST_NAME}:${config.PORT}${config.GRAPHQL_ENDPOINT}`);
            });
        })
        .catch((err) => {
            console.error('Server start error:', err);
        });

    mongoose.connection.on('error', (err) => {
        console.error('Mongoose connection error:', err);
        notifier.notify({
            title: 'Error',
            message: 'Mongoose error!',
        });
    });
})();
