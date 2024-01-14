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
module.exports = addLabelAndMoveToLabel;