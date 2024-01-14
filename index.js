
const process = require('process');
const express = require("express");
const app = express();

const authorizeUser = require("./AuthorizeUser");
const sendAutomaticReplies = require("./SendAutomaticReplies");

app.use("/", authorizeUser, sendAutomaticReplies);

app.use((err, req, res, next)=>{
  res.status(500).json({"message":"Internal  Server Error"})
})

app.listen(3002, ()=>console.log("listening"))
