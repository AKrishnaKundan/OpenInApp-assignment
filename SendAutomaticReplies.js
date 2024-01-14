const sendReply = require("./SendReply");
const sendAutomaticReplies = (req, res, next)=>{
    
    let auth = req.auth;
    //Math.floor(Math.random() * (120000 - 45000 + 1)) + 45000
    try {
        req.intervalId = setInterval(async () => {
            try {
                const response = await sendReply(auth);
            } catch (err) {
                //throw err;
                // return err;
            }
        }, 10000);
        
    } catch (err) {
        clearInterval(req.intervalId); // Clear the interval here as well
        next(err);
    }
    
}

module.exports = sendAutomaticReplies;