// General CRUD Response
export enum ApiResults {
  SUCCESS_CREATE = "Create Successfully！",
  SUCCESS_UPDATE = "Update Successfully！",
  SUCCESS_DELETE = "Delete Successfully！",
  SUCCESS_DOWNLOAD = "Download Successfully！",
  SUCCESS_SEND_EMAIL = "The letter has been delivered！Please check your email!",
  FAIL_CREATE = "Failed to create！",
  FAIL_READ = "Failed to get information from server！",
  FAIL_UPDATE = "Failed to upadte！",
  FAIL_DELETE = "Failed to delete !",
  FAIL_DOWNLOAD = "Failed to Download !",
  FAIL_TO_SEND_EMAIL = "Failed to send your email !",
}

// Log In Response
export enum ApiLogInResults {
  SUCCESS_LOG_IN = "Log In Successfully！",
  FAIL_LOG_IN = "Failed to log in !",
  MIS_MATCH_PASSWORD = "Invalid password! Please try again.",
  UNAUTHORIZED_IDENTITY = "Authentication failed. Please check if your account and password are correct.",
}
