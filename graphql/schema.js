const { buildSchema } = require('graphql');

module.exports = buildSchema(`
type Post {
    _id: ID!,
    title: String!
    content: String!
    imageUrl: String!
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

type AuthData {
    token: String!
    userId: String!
}

type PostsData {
    posts: [Post!]!
    totalPosts: Int!
}

type StatusData {
    status: String!
}

input UserInputData {
    email: String!
    name: String!
    password: String!
}

input PostInputData {
    title: String!
    content: String!
    imageUrl: String!
}

type RootQuery {
    login(email: String!, password: String!): AuthData!
    getPost(postId: ID!):Post!
    getPosts(page: Int!): PostsData!
    getUserStatus: StatusData!
}

type RootMutation {
    createUser(userInput: UserInputData): User!
    createPost(postInput: PostInputData): Post!
    updatePost(postInput: PostInputData, postId: ID!): Post!
    deletePost(postId: ID!): Boolean
    updateUserStatus(userStatus: String!): StatusData!
    
}

schema {
    query: RootQuery
    mutation: RootMutation
    }
`);
