/* eslint-disable */
// this is an auto generated file. This will be overwritten

export const getReplay = /* GraphQL */ `
  query GetReplay($id: ID!) {
    getReplay(id: $id) {
      id
      rname
      rurl
      upVotes
      downVotes
      createdAt
      updatedAt
      owner
    }
  }
`;
export const listReplays = /* GraphQL */ `
  query ListReplays(
    $filter: ModelReplayFilterInput
    $limit: Int
    $nextToken: String
  ) {
    listReplays(filter: $filter, limit: $limit, nextToken: $nextToken) {
      items {
        id
        rname
        rurl
        upVotes
        downVotes
        createdAt
        updatedAt
        owner
      }
      nextToken
    }
  }
`;
