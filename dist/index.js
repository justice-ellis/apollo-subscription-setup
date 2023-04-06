import { ApolloServerPluginDrainHttpServer } from '@apollo/server/plugin/drainHttpServer';
import { expressMiddleware } from '@apollo/server/express4';
import { useServer } from 'graphql-ws/lib/use/ws';
import { ApolloServer } from '@apollo/server';
import { subgraphSchema } from './schema.js';
import { WebSocketServer } from 'ws';
import express from 'express';
import http from 'http';
import cors from 'cors';
import dotenv from 'dotenv';
dotenv.config();
import bodyParser from 'body-parser';
(async function () {
    const app = express();
    const httpServer = http.createServer(app);
    const wsServer = new WebSocketServer({
        server: httpServer,
        path: '/graphql',
    });
    const serverCleanup = useServer({ schema: subgraphSchema }, wsServer);
    const server = new ApolloServer({
        schema: subgraphSchema,
        plugins: [
            ApolloServerPluginDrainHttpServer({ httpServer }),
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
    });
    await server.start();
    app.use('/graphql', cors(), bodyParser.json(), expressMiddleware(server));
    const PORT = process.env.PORT;
    httpServer.listen(PORT, () => {
        console.log(`Server is now running on http://localhost:${PORT}/graphql`);
    });
})();
