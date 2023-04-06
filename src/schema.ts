import { buildSubgraphSchema } from '@apollo/subgraph';

import { PubSub } from 'graphql-subscriptions';
import { gql } from 'graphql-tag';
const pubsub = new PubSub(); // Publish and Subscribe, Publish -> everyone gets to hear it

    // GraphQL Typedefs and resolvers
    export const typeDefs = gql`
        
        type Query {
            placeholder: Boolean
        }
        
        type Greeting {
            hello: String
        }

        type NewsEvent {
            title: String
            description: String
        }

        type PostEvent {
            author: String
            comment: String
        }

        type Mutation {
            createNewsEvent(title: String, description: String) : NewsEvent
            createPostEvent(author: String, comment: String): PostEvent
        }

        type Subscription {
            newsFeed: NewsEvent
            postCreated: PostEvent
            hello: Greeting
        }
    `

    interface createNewsEventInput {
        title: string
        description: string
    }

    interface createPostEventInput {
        author: String
        comment: String
    }

    export const resolvers = {
        Query: {
            placeholder: () => { return true }
        },
        Mutation: {
            createNewsEvent: (_parent : any, args : createNewsEventInput ) => {
                pubsub.publish('EVENT_CREATED', { newsFeed: args });
                // Datastore Logics ..
                return args;
            },
            createPostEvent: (_parent: any, args: createPostEventInput ) => {
                pubsub.publish('POST_CREATED', { postCreated: args });
                // Datastore Logic here!
                return args;
            }
        },
        Subscription: {
            newsFeed: {
                subscribe: () => pubsub.asyncIterator(['EVENT_CREATED'])
            },
            hello: {
                // Example using an async generator
                subscribe: async function* () {
                  for await (const word of ['Hello', 'Bonjour', 'Ciao']) {
                    yield { hello: word };
                  }
                },
            },
            postCreated: {
                // More on pubsub below
                subscribe: () => pubsub.asyncIterator(['POST_CREATED']),
            },
        },
            // ...other resolvers...
        
    }

    export const subgraphSchema = buildSubgraphSchema({
        typeDefs,
        resolvers,
    });
      
      // Export the schema for use in other parts of your application
      //export { subgraphSchema };
