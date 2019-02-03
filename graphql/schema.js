const {buildSchema}  = require('graphql');

module.exports = buildSchema(`
type TestData {
    text: String!
    views: 12345!
}

type RootQuery {
    hello: TestData
}

schema {
    query: RootQuery
}
`)