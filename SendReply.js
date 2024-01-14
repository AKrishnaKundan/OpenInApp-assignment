const { google } = require('googleapis');
const hasThreadBeenReplied = require("./CheckThreadReplied");

const sendReply = async(auth)=>{
    console.log(sendReply);
    try{
    const gmail = google.gmail({ version: 'v1', auth });

    // Get the last email in the inbox
    const res = await gmail.users.messages.list({
      userId: 'me',
      maxResults:5
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
        console.log(threadId);
        
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
        console.log('Reply sent successfully.');
        } 
        else {
          console.log('Thread has been replied to before. No action taken.');
        }
      }
    }
    }
    catch(err){
        console.log(err);
    }
  }

  module.exports = sendReply;