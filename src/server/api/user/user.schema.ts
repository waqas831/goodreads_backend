import { gql } from 'apollo-server-express';

const userTypeDefs = gql`
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

export default userTypeDefs;