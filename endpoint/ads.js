"use strict";

const faker = require("faker");
const express = require("express");
const xlsx = require("xlsx");
const ads = express.Router({});
const dateFormat = require("dateformat");
const { ObjectId } = require('mongodb');
const tms = require("../helper/tms");

ads.post("/createAd", async (req, res) => {
  // log('getOneMulti : req.query :', req.query)
  try {
    let qry = req.body;

    /*
    parent_id:  
    place_type: 
    user_id:    
    title:      
    content:    
    money:      
    expire_date:
    level: 
    */ 

    let ad = await Ads.create(qry);
    log("ad : ", ad);
    res.json({ msg: RCODE.OPERATION_SUCCEED, data: { item: ad } });
  } catch (err) {
    log("err=", err);
    res.status(500).json({ msg: RCODE.SERVER_ERROR, data: {} });
  }
});


module.exports = ads;