/**
 * Send a reply to the last email in the inbox.
 *
 * @param {google.auth.OAuth2} auth An authorized OAuth2 client.
 */
  
async function hasThreadBeenReplied(gmail, threadId) {
    try{
        const res = await gmail.users.threads.get({
        userId: 'me',
        id: threadId,
        });

        const messages = res.data.messages || [];
        
        
        let reply =  messages.some(message => message.labelIds.includes('SENT'));
        return reply;
    }
    catch(err){
        return err;
    }
  }

module.exports = hasThreadBeenReplied;