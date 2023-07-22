"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const apollo_server_express_1 = require("apollo-server-express");
const ratingTypeDefs = (0, apollo_server_express_1.gql) `
  type Rating {
    _id: ID!
    user_id: ID!
    book_id: ID!
    stars: String!
    comment: String!
  }

  input RatingInput {
    book_id: ID!
    stars: String!
    comment: String!
  }

  type Mutation {
    createRating(rating: RatingInput!): Rating!
    updateRating(id: ID!, rating: RatingInput!): Rating!
  }
`;
exports.default = ratingTypeDefs;
