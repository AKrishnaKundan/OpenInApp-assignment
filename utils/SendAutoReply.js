const { google } = require('googleapis');
const hasThreadBeenReplied = require("./CheckThreadReplied");
const moveToLabel = require("./MoveToLabel");

const fetchMessages = async(gmail)=>{
  try{
    const response = await gmail.users.messages.list({
      userId: 'me',
      maxResults:5
    });
    return response.data.messages || [];
  }
  catch(err){
    return err;
  }
}

const fetchMail = async(gmail, auth, messageId)=>{
  try{
    const email = await gmail.users.messages.get({
      auth,
      userId: "me",
      id: messageId,
    });
    return email;
  }
  catch(err){
    return err;
  }
}

const findReplyToAddress = (email)=>{
  try{
    const from = email.data.payload.headers.find(header => header.name === 'From').value;
    const replyTo = email.data.payload.headers.find(header => header.name === 'Reply-to').value;

    if (replyTo){
      return replyTo;
    }
    if (from.search("no-reply") !== -1){
      return from;
    }
    return null;
  }
  catch(err){
    return err;
  }
}

const sendAutoReply = async(auth)=>{
    try{
    const gmail = google.gmail({ version: 'v1', auth });

    const messages = await fetchMessages(gmail);

    if (messages.length > 0) {
      for (const message of messages) {

        const email = await fetchMail(gmail, auth, message.id);
        
        const threadId = message.threadId;
        console.log(threadId);
        
        const replyTo = findReplyToAddress(email);
        if (!replyTo) continue;
        const threadReplied = await hasThreadBeenReplied(gmail, threadId);    
        
        if (!threadReplied) {

          //if Reply-to present then go for that.
          //if only From then check for no-reply;
        
          // Extract relevant information
          const messageIdHeader = email.data.payload.headers.find(header => header.name === 'Message-ID');
          const messageId = messageIdHeader ? messageIdHeader.value : null;
          
          // Prepare the reply
          const replyMessage = `I am not able to reply as I am out of station. I will get back to very soon.`;

          // Send the reply
          await gmail.users.messages.send({
            userId: 'me',
            resource: {
                raw: Buffer.from(
                    `To: ${replyTo}\n` +
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
        moveToLabel(auth, message.id);
        } 
        else {
          console.log('Thread has been replied to before. No action taken.');
        }
      }
    }
    }
    catch(err){
        return err;
    }
  }

  module.exports = sendAutoReply;