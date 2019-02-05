const { buildSchema } = require('graphql');

module.exports = buildSchema(`
type Post {
    _id: ID!,
    content: String!,
    creator: User!
    createdAt: String!
    updatedAt: String!
}

type User {
    _id: ID!
    name: String!
    email: String!
    password: String
    status: String!
    posts: [Post!]!
}

input userDataInput {
    email: String!
    name: String!
    password: String!
}

type RootQuery {
    hello: String
}

type RootMutation {
    createUser(userInput: userDataInput): User!
}


schema {
    query: RootQuery
    mutation: RootMutation
}
`);
