"use strict";

const faker = require("faker");
const express = require("express");
const xlsx = require("xlsx");
const managedb = express.Router({});
const dateFormat = require("dateformat");
const policy = require("../helper/sharing_policy.js");

//--------------------------------------------------
// Default Boiler Function 2022
//--------------------------------------------------

//
managedb.post("/deleteAllSimpleMsg", async (req, res) => {
  log("qry :", req.body);

  try {
    const qry = req.body;
    console.log('Connected To Server.................... ')
    const users = await Users.find({ simple_msg: { $exists: true}}) 
    users.forEach(async user=>{
      const updatedData =  await Users.updateOne({_id:user._id}, {$set: {simple_msg:[]}})
      console.log('Updated Data : ', updatedData)
    })
    res.status(200).json({ msg: RCODE.OPERATION_SUCCEED, data: { item: 'Done' } });
  } catch (err) {
    log("err=", err);
    res.status(500).json({ msg: RCODE.SERVER_ERROR, data: {} });
  }
});

managedb.post("/deleteAllPosts", async (req, res) => {
  log("qry :", req.body);

  try {
    const qry = req.body;
    console.log('Connected To Server.................... ')
    const allPosts = await Post.find({})
    allPosts.forEach(async post=>{
        let replies = post.reply
        replies.forEach(async reply=>{
            await Reply.deleteOne({_id:reply._id})
        })
        if(post.place_type==='MULTI') await MultiPlace.findOneAndUpdate({_id:post.parent_id}, {post:[]})
        if(post.place_type==='PLACE') await MultiPlace.findOneAndUpdate({_id:post.parent_id}, {post:[]})
        await Post.deleteOne({_id:post._id})
    })
    res.status(200).json({ msg: RCODE.OPERATION_SUCCEED, data: { item: 'Done' } });
  } catch (err) {
    log("err=", err);
    res.status(500).json({ msg: RCODE.SERVER_ERROR, data: {} });
  }
});


//--------------------------------------------------
// New functions 2022
//--------------------------------------------------

module.exports = managedb;
