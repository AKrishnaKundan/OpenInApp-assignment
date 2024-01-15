const { google } = require('googleapis');

const watchInbox = async(auth)=>{
  console.log("watchinbox");
  const gmail = google.gmail({
    version: 'v1',
    auth: auth // Replace 'YOUR_AUTH_OBJECT' with your authenticated OAuth2 client
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
    console.error('Error:', error.response.data.error);
  }
}

module.exports = watchInbox;
