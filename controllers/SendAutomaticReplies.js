const sendReply = require("../utils/SendReply");
//const watchInbox = require("../webhooks");
const sendAutomaticReplies = (req, res, next)=>{
    
    let auth = req.auth;
    //Math.floor(Math.random() * (120000 - 45000 + 1)) + 45000
    try {
        req.intervalId = setInterval(async () => {
            try {
                //watchInbox(auth);
                const response = await sendReply(auth);
            } catch (err) {
                //throw err;
                // return err;
            }
        }, 30000);
        
    } catch (err) {
        clearInterval(req.intervalId); // Clear the interval here as well
        next(err);
    }
    
}

module.exports = sendAutomaticReplies;