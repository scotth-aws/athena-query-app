/* eslint-disable */
// this is an auto generated file. This will be overwritten

export const getReport = /* GraphQL */ `
  query GetReport($id: ID!) {
    getReport(id: $id) {
      id
      query
      name
      description
      result
      resultSummary
      outputLocation
      createdAt
      updatedAt
      queryState
      queryError
    }
  }
`;
export const listReports = /* GraphQL */ `
  query ListReports(
    $filter: ModelReportFilterInput
    $limit: Int
    $nextToken: String
  ) {
    listReports(filter: $filter, limit: $limit, nextToken: $nextToken) {
      items {
        id
        query
        name
        description
        result
        resultSummary
        outputLocation
        createdAt
        updatedAt
        queryState
        queryError
      }
      nextToken
    }
  }
`;
