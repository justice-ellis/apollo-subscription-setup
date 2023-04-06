
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

import { readFileSync } from 'fs';
import { gql } from 'graphql-tag';
import { PubSub } from 'graphql-subscriptions';
import { createServer } from 'http';
import { buildSubgraphSchema } from '@apollo/subgraph';
import {applyMiddleware} from 'graphql-middleware'
import { makeExecutableSchema } from '@graphql-tools/schema';


import bodyParser from 'body-parser';

interface MyContext {
  token?: String;
}

( async function () {
        
    const app = express();
    const httpServer = http.createServer(app);

    const wsServer = new WebSocketServer({
    server: httpServer,
    path: '/graphql',
    });
  
    const serverCleanup = useServer( { schema: subgraphSchema } , wsServer);

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
      app.use('/graphql', cors<cors.CorsRequest>(), bodyParser.json(), expressMiddleware(server));
      
      const PORT: string | undefined = process.env.PORT;
      
      httpServer.listen(PORT, () => {
        console.log(`Server is now running on http://localhost:${PORT}/graphql`);
      });

})()
