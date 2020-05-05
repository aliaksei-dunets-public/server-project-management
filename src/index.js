const config = require('./config')[process.env.NODE_ENV || 'development'];

const { ApolloServer } = require('apollo-server');

const typeDefs = require('./service/schema');
const resolvers = require('./service/resolvers');
// const plugins = require('./plugins');
const { ControllerFactory } = require('./db/controllers');

// Set up Apollo Server
const server = new ApolloServer({
    typeDefs,
    resolvers,
    dataSources: () => ({ factory: new ControllerFactory() }),
    introspection: true,
    playground: true,
    // plugins: [plugins],
});

server
    .listen({ port: config.PORT })
    .then(({ url }) => {
        console.log(`Server running at ${url}`)
    });
