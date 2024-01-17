const sendAutoReply = require("../utils/SendAutoReply");
const watchInbox = require("../middlewares/WatchInbox");
const autoReplyController = (req, res, next)=>{
    
    let auth = req.auth;
    //Math.floor(Math.random() * (120000 - 45000 + 1)) + 45000
    try {
        req.intervalId = setInterval(async () => {
            try {
                watchInbox(auth);// FUNCTION TO SET PUB/SUB 
                const response = await sendAutoReply(auth);
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

module.exports = autoReplyController;