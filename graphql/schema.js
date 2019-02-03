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
    email: string!
    name: string!
    password: string!
}

type RootMutation {
    createUser(userInput: userDataInput): User!
}

schema {
    mutation: RootMutation
}
`);
