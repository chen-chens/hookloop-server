enum ApiStatus {
  SUCCESS = "success", // client req OK, server res OK
  FAIL = "fail", // client req with invalid issue: 4XX
  ERROR = "error", // server's issue: 5XX
}

export default ApiStatus;
