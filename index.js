
const process = require('process');
const express = require("express");
const app = express();

const authorizeUser = require("./AuthorizeUser");
const sendReply = require("./SendReply");
let auth;

app.use("/", authorizeUser, (req, res, next)=>{
  let intervalId;
  try{
    const auth = req.auth;
    intervalId = setInterval(()=>{
      sendReply(auth).catch((err)=>{
        throw err;
      })
    }, 10000);
    //Math.floor(Math.random() * (120000 - 45000 + 1)) + 45000
  }
  catch(err){
    clearInterval(intervalId);
    next(err);
  }
})

app.use((err, req, res, next)=>{
  res.status(500).json({"message":"Internal  Server Error"})
})

app.listen(8000, ()=>console.log("listening"))
