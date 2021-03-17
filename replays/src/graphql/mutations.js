/* eslint-disable */
// this is an auto generated file. This will be overwritten

export const createReplay = /* GraphQL */ `
  mutation CreateReplay(
    $input: CreateReplayInput!
    $condition: ModelReplayConditionInput
  ) {
    createReplay(input: $input, condition: $condition) {
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
export const updateReplay = /* GraphQL */ `
  mutation UpdateReplay(
    $input: UpdateReplayInput!
    $condition: ModelReplayConditionInput
  ) {
    updateReplay(input: $input, condition: $condition) {
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
export const deleteReplay = /* GraphQL */ `
  mutation DeleteReplay(
    $input: DeleteReplayInput!
    $condition: ModelReplayConditionInput
  ) {
    deleteReplay(input: $input, condition: $condition) {
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
