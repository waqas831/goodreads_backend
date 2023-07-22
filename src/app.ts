import { ApolloServer } from "apollo-server";
import mongoose from "mongoose";
import { mongoDBUrl } from "./configuration/connection";
import { mergeTypeDefs, mergeResolvers } from "@graphql-tools/merge";
import http from "http";
import { Server } from "socket.io";
import express from "express";
const app = express();
const socket = http.createServer(app);
const io = new Server(socket, {
  cors: {
    origin: "*",
    methods: ["GET", "POST"],
    credentials: true,
  },
});

app.use(express.static(__dirname + "/public"));
app.use(express.static("public"));

import userTypeDefs from "./server/api/user/user.schema";
import userResolver from "./server/api/user/user.resolvers";
import booksTypeDefs from "./server/api/books/books.schema";
import bookResolver from "./server/api/books/books.resolver";
import shelveTypeDefs from "./server/api/shelve/shelve.schema";
import shelveResolver from "./server/api/shelve/shelve.resolver";
import ratingTypeDefs from "./server/api/rating/rating.schema";
import ratingResolver from "./server/api/rating/rating.resolver";

const typeDefs = mergeTypeDefs([
  userTypeDefs,
  booksTypeDefs,
  shelveTypeDefs,
  ratingTypeDefs,
]);
const resolvers = mergeResolvers([
  userResolver,
  bookResolver,
  shelveResolver,
  ratingResolver,
]);
mongoose
  .connect(mongoDBUrl, {})
  .then(() => console.log("Database Connection Sucessfull"))
  .catch((err) => console.log(err));

new ApolloServer({
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

export { io };
