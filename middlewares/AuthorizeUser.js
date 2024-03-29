const fs = require('fs').promises;
const path = require('path');
const { google } = require('googleapis');


// The file token.json stores the user's access and refresh tokens and is created automatically when the authorization flow completes for the first time.
const TOKEN_PATH = path.join(process.cwd(), 'data/token.json');
const CREDENTIALS_PATH = path.join(process.cwd(), 'data/credentials.json');
const { authenticate } = require('@google-cloud/local-auth');
// If modifying these scopes, delete token.json.
const SCOPES = [
    'https://www.googleapis.com/auth/gmail.readonly', 
    'https://www.googleapis.com/auth/gmail.send',
    "https://www.googleapis.com/auth/gmail.labels",
    "https://mail.google.com/",
    'https://www.googleapis.com/auth/gmail.modify',
    'https://www.googleapis.com/auth/pubsub'
  ];
  
/**
 * Reads previously authorized credentials from the save file.
 *
 * @return {Promise<OAuth2Client|null>}
 */
async function loadSavedCredentialsIfExist() {
    try {
        const content = await fs.readFile(TOKEN_PATH);
        const credentials = JSON.parse(content);
        return google.auth.fromJSON(credentials);
    } catch (err) {
        console.log(err);
        return null;
    }
}

/**
 * Serializes credentials to a file compatible with GoogleAUth.fromJSON.
 *
 * @param {OAuth2Client} client
 * @return {Promise<void>}
 */
async function saveCredentials(client) {
    try{
        const content = await fs.readFile(CREDENTIALS_PATH);
        const keys = JSON.parse(content);
        const key = keys.installed || keys.web;
        const payload = JSON.stringify({
            type: 'authorized_user',
            client_id: key.client_id,
            client_secret: key.client_secret,
            refresh_token: client.credentials.refresh_token,
        });
        await fs.writeFile(TOKEN_PATH, payload);
    }catch(err){
        return err;
    }
}

/**
 * Load or request authorization to call APIs.
 */
async function authorize(){
    try{
        let client = await loadSavedCredentialsIfExist();
        if (client) {
            return client;
        }
        const authOptions = {
            keyfilePath: CREDENTIALS_PATH,
            scopes: SCOPES,
            openAuthUri: {
                includeGrantedScopes: true,
                response_type: 'code', // Specify the response_type parameter here
            }
        };
        client = await authenticate(authOptions);
        if (client.credentials) {
            await saveCredentials(client);
        }
        console.log("authentication done");
        return client;
    }
    catch(err){
        console.log(err);
        return err;
    }
}

const authorizeUser = async(req, res, next)=>{
    try{
        const response = await authorize();
        req.auth = response;
        next();        
    }
    catch(err){
        next(err);
    }
}

module.exports = authorizeUser;
