"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.io = void 0;
const apollo_server_1 = require("apollo-server");
const mongoose_1 = __importDefault(require("mongoose"));
const connection_1 = require("./configuration/connection");
const merge_1 = require("@graphql-tools/merge");
const http_1 = __importDefault(require("http"));
const socket_io_1 = require("socket.io");
const express_1 = __importDefault(require("express"));
const app = (0, express_1.default)();
const socket = http_1.default.createServer(app);
const io = new socket_io_1.Server(socket, {
    cors: {
        origin: "*",
        methods: ["GET", "POST"],
        credentials: true,
    },
});
exports.io = io;
app.use(express_1.default.static(__dirname + "/public"));
app.use(express_1.default.static("public"));
const user_schema_1 = __importDefault(require("./server/api/user/user.schema"));
const user_resolvers_1 = __importDefault(require("./server/api/user/user.resolvers"));
const books_schema_1 = __importDefault(require("./server/api/books/books.schema"));
const books_resolver_1 = __importDefault(require("./server/api/books/books.resolver"));
const shelve_schema_1 = __importDefault(require("./server/api/shelve/shelve.schema"));
const shelve_resolver_1 = __importDefault(require("./server/api/shelve/shelve.resolver"));
const rating_schema_1 = __importDefault(require("./server/api/rating/rating.schema"));
const rating_resolver_1 = __importDefault(require("./server/api/rating/rating.resolver"));
const typeDefs = (0, merge_1.mergeTypeDefs)([
    user_schema_1.default,
    books_schema_1.default,
    shelve_schema_1.default,
    rating_schema_1.default,
]);
const resolvers = (0, merge_1.mergeResolvers)([
    user_resolvers_1.default,
    books_resolver_1.default,
    shelve_resolver_1.default,
    rating_resolver_1.default,
]);
mongoose_1.default
    .connect(connection_1.mongoDBUrl, {})
    .then(() => console.log("Database Connection Sucessfull"))
    .catch((err) => console.log(err));
new apollo_server_1.ApolloServer({
    typeDefs,
    resolvers,
    context: ({ req }) => {
        const context = {
            token: "", // set default value
        };
        const authHeader = req.headers.authorization;
        if (authHeader && authHeader.split(" ")[0] === "Bearer") {
            context.token = authHeader.split(" ")[1];
        }
        return context;
    },
}).listen(3001, () => {
    console.log("GraphQl Server is listening on Port 3001");
});
app.listen(4000, () => {
    console.log("Image Loader Server is listening on Port 4000");
});
socket.listen(5000, () => {
    console.log("Socket Server is Listening on Port 5000");
});
io.on("connection", (socket) => {
    console.log("Socket is Listening....");
    socket.on("disconnect", () => {
        console.log("Socket is Disconnected....");
    });
});
