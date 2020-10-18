const config = require('./config')[process.env.NODE_ENV || 'development'];

// const { ApolloServer } = require('apollo-server');
const express = require('express');
var path = require('path');
const { ApolloServer } = require('apollo-server-express');

const app = express();

const typeDefs = require('./service/schema');
const resolvers = require('./service/resolvers');
// const plugins = require('./plugins');
const { ControllerFactory, MODELS } = require('./db/controllers');

const factory = new ControllerFactory();

// Set up Apollo Server
const server = new ApolloServer({
    typeDefs,
    resolvers,
    context: async ({ req }) => {
        // simple auth check on every request
        const auth = req.headers && req.headers.authorization || '';
        const user = await factory.getInstance(MODELS.user).checkToken(auth);
        return { user }
    },
    dataSources: () => ({ factory }),
    introspection: true,
    playground: true,
    // plugins: [plugins],
});

server.applyMiddleware({ app, path: '/graphql' });

app.use('/static', express.static(path.join(__dirname, '../public')));

app.listen({ port: config.PORT }, () => {
    console.log(`Server running on PORT: ${config.PORT}`)
});
