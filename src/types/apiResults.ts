// General CRUD Response
export enum ApiResults {
  SUCCESS_CREATE = "Create Successfully！",
  SUCCESS_UPDATE = "Update Successfully！",
  SUCCESS_DELETE = "Delete Successfully！",
  SUCCESS_GET_DATA = "Get Data Successfully！",
  SUCCESS_DOWNLOAD = "Download Successfully！",
  SUCCESS_SEND_EMAIL = "The letter has been delivered！Please check your email!",
  FAIL_CREATE = "Failed to create！",
  FAIL_READ = "Failed to get information from server！",
  FAIL_UPDATE = "Failed to upadte！",
  FAIL_DELETE = "Failed to delete !",
  FAIL_TO_GET_DATA = "Failed to Get Data!",
  FAIL_DOWNLOAD = "Failed to Download !",
  FAIL_TO_SEND_EMAIL = "Failed to send your email !",
  FILE_HANDLER_FAIL = "No file or file size over than 1MB.",
  FILE_NOT_FOUND = "File not found.",
  NOT_FOUND = "Failed to find this page, please check your URL！",
  UNEXPECTED_ERROR = "Unexpected error occurred, please contact the administrator！",
}

// Log In Response
export enum ApiLogInResults {
  SUCCESS_LOG_IN = "Log In Successfully！",
  FAIL_LOG_IN = "Failed to log in !",
  MIS_MATCH_PASSWORD = "Invalid password! Please try again.",
  UNAUTHORIZED_IDENTITY = "Authentication failed. Please check if your account and password are correct.",
}
