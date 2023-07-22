"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const apollo_server_express_1 = require("apollo-server-express");
const userTypeDefs = (0, apollo_server_express_1.gql) `
  type User {
    _id: ID!
    name: String!
    email: String!
    password: String!
    role: String!
  }

  input UserInput {
    name: String!
    email: String!
    password: String!
  }

  input UserLoginInput {
    email: String!
    password: String!
  }

  type LoginResult {
    token: String!
    user: User!
    message:String!
  }

  type Query {
    user(id: ID!): User!
    users: [User]!
  }

  type Mutation {
    login(user: UserLoginInput!): LoginResult!
    createUser(user: UserInput!): User!
    updateUser(id: ID!, user: UserInput!): User!
    deleteUser(id: ID!): User!
  }
`;
exports.default = userTypeDefs;
