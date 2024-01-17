const { google } = require('googleapis');
const labelName = "Automated Reply"

async function labelAlreadyPresent(gmail, labelName){
  try{
    const response = await gmail.users.labels.list({
      userId: "me",
    });
    const label = response.data.labels.find(
      (label) => label.name === labelName
    );
    if (label) return label.id;
    else return null;
  }
  catch(err){
    return err;
  }
}

async function createLabel(gmail){
  try{
    const response = await gmail.users.labels.create({
      userId: "me",
      requestBody: {
        name: labelName,
        labelListVisibility: "labelShow",
        messageListVisibility: "show",
      },
    });
    const labelId = response.data.id;
    return labelId;
  }
  catch(err){
    return err;
  }
}

const moveToLabel = async(auth, messageId)=>{
  console.log("moveToLabel");
  const gmail = google.gmail({ version: "v1", auth });

  try{
    let labelId = await labelAlreadyPresent(gmail, labelName);
    if (!labelAlreadyPresent){
      labelId = await createLabel(gmail);
    }
    
    await gmail.users.messages.modify({
      auth,
      userId: "me",
      id: messageId,
      resource: {
        addLabelIds: [labelId],
        removeLabelIds: ["INBOX"],
      },
    });
    console.log("mail moved to new label");
  }
  catch(err){
    return err;
  }
}

module.exports = moveToLabel;