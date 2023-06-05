import { google } from "googleapis";

// init Google Oauth2.0 config: Setting global or service-level auth
const { OAuth2 } = google.auth;
const oauth2Client = new OAuth2(
  process.env.GOOGLE_AUTH_CLIENT_ID,
  process.env.GOOGLE_AUTH_CLIENT_SECRET,
  "https://developers.google.com/oauthplayground", // YOUR_REDIRECT_URL
);

// set auth as a global default
google.options({
  auth: oauth2Client,
});

export default oauth2Client;
