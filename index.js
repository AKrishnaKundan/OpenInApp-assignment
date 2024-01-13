const fs = require('fs').promises;
const path = require('path');
const process = require('process');
const { authenticate } = require('@google-cloud/local-auth');
const { google } = require('googleapis');

const express = require("express");
const app = express();

// If modifying these scopes, delete token.json.
const SCOPES = [
  'https://www.googleapis.com/auth/gmail.readonly', 
  'https://www.googleapis.com/auth/gmail.send',
  "https://www.googleapis.com/auth/gmail.labels",
  "https://mail.google.com/",
  'https://www.googleapis.com/auth/gmail.modify'
];

app.use("/", ()=>{

// The file token.json stores the user's access and refresh tokens and is created automatically when the authorization flow completes for the first time.
const TOKEN_PATH = path.join(process.cwd(), 'token.json');
const CREDENTIALS_PATH = path.join(process.cwd(), 'credentials.json');

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
}

/**
 * Load or request authorization to call APIs.
 */
async function authorize() {
  let client = await loadSavedCredentialsIfExist();
  if (client) {
    return client;
  }
  client = await authenticate({
    scopes: SCOPES,
    keyfilePath: CREDENTIALS_PATH,
  });
  if (client.credentials) {
    await saveCredentials(client);
  }
  return client;
}

/**
 * Send a reply to the last email in the inbox.
 *
 * @param {google.auth.OAuth2} auth An authorized OAuth2 client.
 */
async function sendReply(auth) {
  const gmail = google.gmail({ version: 'v1', auth });

  // Get the last email in the inbox
  const res = await gmail.users.messages.list({
    userId: 'me',
    maxResults:1
  });


  const messages = res.data.messages||[];
  if (messages.length > 0) {
    for (const message of messages) {
      const email = await gmail.users.messages.get({
        auth,
        userId: "me",
        id: message.id,
      }); 
      //const threadId = message.data.threadId || null; // Use email.data.threadId if it exists, otherwise use null
      
      const threadId = message.threadId;
      
      const threadReplied = await hasThreadBeenReplied(gmail, threadId);    
      
      if (!threadReplied) {
      
        // Extract relevant information
        const from = email.data.payload.headers.find(header => header.name === 'From').value;
        const messageIdHeader = email.data.payload.headers.find(header => header.name === 'Message-ID');
        const messageId = messageIdHeader ? messageIdHeader.value : null;
        
        // Prepare the reply
        const replyMessage = `I am not able to reply as I am out of station. I will get back to very soon.`;

        // Send the reply
        await gmail.users.messages.send({
          userId: 'me',
          resource: {
              raw: Buffer.from(
                  `To: ${from}\n` +
                  `In-Reply-To: ${messageId}\n` +
                  `References: ${messageId}\n` +
                  `Subject: ${email.data.payload.headers.find(header => header.name === 'Subject').value}\n\n` +
                  `${replyMessage}`
              ).toString('base64'),
              labelIds: ['INBOX'],
              threadId: `${threadId}`
          },
      });

      addLabelAndMoveToLabel(auth)
      
      console.log('Reply sent successfully.');
      } 
      else {
        //console.log('Thread has been replied to before. No action taken.');
      }
    }

  }
}
  async function hasThreadBeenReplied(gmail, threadId) {
    const res = await gmail.users.threads.get({
      userId: 'me',
      id: threadId,
    });

    const messages = res.data.messages || [];
    
    
    let reply =  messages.some(message => message.labelIds.includes('SENT'));
    return reply;
  }

  async function addLabelAndMoveToLabel(auth) {
      const labelName = "Automated Reply"
      const gmail = google.gmail({ version: "v1", auth });
      try {
        const response = await gmail.users.labels.create({
          userId: "me",
          requestBody: {
            name: labelName,
            labelListVisibility: "labelShow",
            messageListVisibility: "show",
          },
        });
        const labelId = response.data.id;
        console.log(labelId);
        changeLabel(labelId, auth);
        console.log("Moved to automated reply label")
      } catch (error) {
         console.log(error);
        if (error.code === 409) {
          const response = await gmail.users.labels.list({
            userId: "me",
          });
          const label = response.data.labels.find(
            (label) => label.name === labelName
          );
          return label.id;
        } else {
          /*throw error;*/
        }
      }
  
  }

  const changeLabel = async()=>{
    await gmail.users.messages.modify({
      auth,
      userId: "me",
      id: message.id,
      resource: {
        addLabelIds: [labelId],
        removeLabelIds: ["INBOX"],
      },
    });
  }


  setInterval(()=>authorize().then(sendReply).catch(console.error), 1000);
})

app.listen(8000, ()=>console.log("listening"))
