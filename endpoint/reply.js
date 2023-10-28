"use strict";

const faker = require("faker");
const express = require("express");
const xlsx = require("xlsx");
const reply = express.Router({});
const dateFormat = require("dateformat");
const { ObjectId } = require("mongodb");
const tms = require("../helper/tms");

//--------------------------------------------------
// New functions
//--------------------------------------------------

reply.get("/somename", async (req, res) => {
  // log('getOneMulti : req.query :', req.query)
  try {
    let qry = req.query;

    let multi = await MultiPlace.findOne(qry).populate("possess");
    log("multi : ", multi);
    res.json({ msg: RCODE.OPERATION_SUCCEED, data: { item: multi } });
  } catch (err) {
    log("err=", err);
    res.status(500).json({ msg: RCODE.SERVER_ERROR, data: {} });
  }
});

reply.get("/getReply", async (req, res) => {
  // log('getOneMulti : req.query :', req.query)
  try {
    let qry = req.query;

    let replies = await MultiPlace.find(qry);
    log("replies : ", replies);
    res.json({ msg: RCODE.OPERATION_SUCCEED, data: { item: replies } });
  } catch (err) {
    log("err=", err);
    res.status(500).json({ msg: RCODE.SERVER_ERROR, data: {} });
  }
});

// createReply
reply.post("/createReply", async (req, res) => {
  try {
    var qry = req.body;
    // console.log('Qry : ', qry)
    const accessKey = req.body.accessKey;
    var user_info = tms.jwt.verify(accessKey, TOKEN.SECRET);
    console.log('TMS user_info : ', user_info)
    var user_id = user_info._id;

    let params = {
      user_id: user_id,
      nickname: user_info.nickname,
      user_img: user_info.user_img,
      parent_id: qry.parent_id,
      comment: qry.comment,
      type: qry.type
    };

    let reply = await Reply.create(params);
    let result
    if(qry.type === 'STORY') {
      await Post.findOneAndUpdate( { _id: qry.parent_id }, { $push: { reply: reply._id} } );
      result = await Post.findOne({ _id: qry.parent_id }).populate("reply");
    } else {
      await Place.findOneAndUpdate( { _id: qry.parent_id }, { $push: { reply: reply._id} } );
      result = await Place.findOne({ _id: qry.parent_id }).populate("reply");
    }
    
    res
      .status(200)
      .json({ msg: RCODE.OPERATION_SUCCEED, data: { item: result } });
  } catch (err) {
    log("err=", err);
    res.status(500).json({ msg: RCODE.SERVER_ERROR, data: {} });
  }
});

module.exports = reply;
