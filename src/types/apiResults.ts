// General CRUD Notes
enum ApiResults {
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
  NOT_FOUND = "Failed to find this page, please check your URL！",
  UNEXPECTED_ERROR = "Unexpected error occurred, please contact the administrator！",
}
export default ApiResults;
