/* eslint-disable */
// this is an auto generated file. This will be overwritten

export const createReport = /* GraphQL */ `
  mutation CreateReport(
    $input: CreateReportInput!
    $condition: ModelReportConditionInput
  ) {
    createReport(input: $input, condition: $condition) {
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
export const updateReport = /* GraphQL */ `
  mutation UpdateReport(
    $input: UpdateReportInput!
    $condition: ModelReportConditionInput
  ) {
    updateReport(input: $input, condition: $condition) {
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
export const deleteReport = /* GraphQL */ `
  mutation DeleteReport(
    $input: DeleteReportInput!
    $condition: ModelReportConditionInput
  ) {
    deleteReport(input: $input, condition: $condition) {
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
