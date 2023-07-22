"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const apollo_server_express_1 = require("apollo-server-express");
const booksTypeDefs = (0, apollo_server_express_1.gql) `
  type Book {
    _id: ID!
    title: String!
    author: String!
    date: String!
    cover_Image: String!
    ratings: [Rating]!
    average_rating: Float
  }

  type Rating {
    _id: ID!
    user_id: ID!
    stars: String!
    comment: String!
  }

  input BookInput {
    title: String!
    author: String!
    cover_Image: String!
  }

  type Query {
    books: [Book]!
  }

  type Mutation {
    book(id: ID!): Book!
    createBook(book: BookInput!): Book!
    updateBook(id: ID!, book: BookInput!): Book!
    deleteBook(id: ID!): Book!
  }
`;
exports.default = booksTypeDefs;
