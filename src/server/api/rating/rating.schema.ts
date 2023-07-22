import { gql } from "apollo-server-express";

const ratingTypeDefs = gql`
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

export default ratingTypeDefs;
