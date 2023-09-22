"use strict";

const faker = require("faker");
const express = require("express");
const xlsx = require("xlsx");
const notice = express.Router({});
const dateFormat = require("dateformat");
const { ObjectId } = require('mongodb');

//--------------------------------------------------
// New functions
//--------------------------------------------------

notice.get("/getNotices", async (req, res) => {
  // log('getOneMulti : req.query :', req.query)
  try {
    let qry = req.query;
    log('getNotices qry : ', qry)

    if(qry.rDepth) {
      let notices = await Notice.find({public_depth: 0}).populate('user_id').sort({_id:-1})
      return res.json({ msg: RCODE.OPERATION_SUCCEED, data: { item: notices } });
    }
    if(qry.public_depth==0) {
      let notices0 = await Notice.find({public_depth: 0}).populate('user_id').sort({_id:-1})
      let notices1 = await Notice.find({parent_id: qry.parent_id}).populate('user_id').sort({_id:-1})
      let notices = [...notices1, ...notices0]
      return res.json({ msg: RCODE.OPERATION_SUCCEED, data: { item: notices } });
    }

    let notices1 = await Notice.find({parent_id: qry.parent_id}).populate('user_id').sort({_id:-1})
    delete qry.parent_id
    let newQry = qry
    let notices2 = await Notice.find(qry).populate('user_id')
    // public_depth
    let notices3 = await Notice.find({public_depth: 0}).populate('user_id').sort({_id:-1})
    // let notices = notices1.concat(notices2) 
    let notices = [...notices3, ...notices2, ...notices1]
    // log("notices : ", notices);
    res.json({ msg: RCODE.OPERATION_SUCCEED, data: { item: notices } });
  } catch (err) {
    log("err=", err);
    res.status(500).json({ msg: RCODE.SERVER_ERROR, data: {} });
  }
});

notice.get("/getNotice", async (req, res) => {
  // log('getOneMulti : req.query :', req.query)
  try {
    let qry = req.query;

    let notice = await Notice.findOne(qry).populate('user_id reply')
    log("notices : ", notice);
    res.json({ msg: RCODE.OPERATION_SUCCEED, data: { item: notice } });
  } catch (err) {
    log("err=", err);
    res.status(500).json({ msg: RCODE.SERVER_ERROR, data: {} });
  }
});

// createNotice
notice.post("/createNotice", async (req, res) => {
  try {
    var qry = req.body;
    // console.log('Qry : ', qry)
    let notice = await Notice.create(qry);
    res.status(200).json({ msg: RCODE.OPERATION_SUCCEED, data: { item: notice } });
  } catch (err) {
    log("err=", err);
    res.status(500).json({ msg: RCODE.SERVER_ERROR, data: {} });
  }
});

module.exports = notice;
