const config = require('./config')[process.env.NODE_ENV || 'development'];

const { ApolloServer } = require('apollo-server');

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
        const auth = req.headers && req.headers.Authorization || '';
        return await factory.getInstance(MODELS.user).checkToken(auth);
    },
    dataSources: () => ({ factory }),
    introspection: true,
    playground: true,
    // plugins: [plugins],
});

server
    .listen({ port: config.PORT })
    .then(({ url }) => {
        console.log(`Server running at ${url}`)
    });
