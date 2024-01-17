
const process = require('process');
const express = require("express");
const app = express();

const authorizeUser = require("./middlewares/AuthorizeUser");
const autoReplyController = require("./controllers/AutoReplyController");

app.get("/send/autoReplies", authorizeUser, autoReplyController);

app.use((req, res, next)=>{
  res.status(404).json({"message":"url not found"})
})

app.use((err, req, res, next)=>{
  res.status(500).json({"message":"Internal  Server Error"})
})

app.listen(3002, ()=>console.log("listening"))
