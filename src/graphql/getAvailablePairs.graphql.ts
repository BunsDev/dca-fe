import gql from 'graphql-tag';

const getAvailablePairs = gql`
  query getAvailablePairs($first: Int, $skip: Int) {
    pairs(first: $first, skip: $skip) {
      id
      tokenA {
        id
      }
      tokenB {
        id
      }
      swaps(first: 1, orderBy: executedAtTimestamp, orderDirection: desc) {
        executedAtTimestamp
      }
      createdAtTimestamp
    }
  }
`;

export default getAvailablePairs;
