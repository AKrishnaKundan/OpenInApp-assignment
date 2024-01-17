const { google } = require('googleapis');

async function watchInbox(auth) {
  const gmail = google.gmail({
    version: 'v1',
    auth: auth 
  });

  const requestData = {
    topicName: 'projects/gmailreply-411105/topics/gmailreply_topics',
    labelIds: ['INBOX'],
    labelFilterBehavior: "INCLUDE",
  };

  try {
    const res = await gmail.users.watch({
      userId: 'me',
      requestBody: requestData
    });
    console.log(res.data);
  } catch (error) {
    console.error('Error:', error);
  }
}

module.exports = watchInbox;

