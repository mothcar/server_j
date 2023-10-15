"use strict";

const faker = require("faker");
const express = require("express");
const xlsx = require("xlsx");
const multiPlace = express.Router({});
const dateFormat = require("dateformat");
const { ObjectId } = require('mongodb');

//--------------------------------------------------
// New functions
//--------------------------------------------------
multiPlace.get("/getMultiPlaceByDefault", async (req, res) => {
  // log('getMultiPlaceByDefault : req.query :', req.query)
  try {
    let qry = req.query;

    let b_lat = Number(qry.b_lat);
    let b_lng = Number(qry.b_lng);
    let t_lat = Number(qry.t_lat);
    let t_lng = Number(qry.t_lng);

    let level = req.query.levelType;
    // log('lat Type : ', typeof b_lat)

    let multis = await MultiPlace.find({
      // level: { $lte: level },
      location: {
        $geoWithin: {
          $box: [
            [b_lng, b_lat],
            [t_lng, t_lat],
          ],
        },
      },
    })
      .limit(50); // 15
    res.json({ msg: RCODE.OPERATION_SUCCEED, data: { item: multis } });
  } catch (err) {
    log("err=", err);
    res.status(500).json({ msg: RCODE.SERVER_ERROR, data: {} });
  }
});

multiPlace.get("/getOneMulti", async (req, res) => {
  // log('getOneMulti : req.query :', req.query)
  try {
    let qry = req.query;
    
    let multi = await MultiPlace.findOne(qry).populate('possess')
    log('multi : ', multi)
    res.json({ msg: RCODE.OPERATION_SUCCEED, data: { item: multi } });
  } catch (err) {
    log("err=", err);
    res.status(500).json({ msg: RCODE.SERVER_ERROR, data: {} });
  }
});

multiPlace.post("/createPlace", async (req, res) => {
  try {
    var qry = req.body;
    // console.log('Qry : ', qry)

    let createParams = {
      parent_id: qry._id,
      place_name: qry.place_name.trim(),
      place_type: "PLACE",
      admin_address: qry.admin_address.trim(),
      road_address: qry.road_address.trim(),
      category: qry.category,
      sub_name: qry.sub_name,
      // bj_code: qry.bj_code,
      r_depth_1: qry.r_depth_1.trim(),
      r_depth_2: qry.r_depth_2.trim(),
      r_depth_3: qry.r_depth_3.trim(),
      // jibun:qry.jibun,
      // eup_myun:qry.eup_myun,
      // ri:qry.ri,
      // zip: road_set.zone_no.trim(),
      location: qry.location,
      post: [],
    };
    const createdPlace = await Place.create(createParams);
    console.log("Create Place .....");

    // CATEGORY.apart
    // update Multi Place with Place _id 
    await MultiPlace.updateOne({_id:qry._id}, {multi_type: qry.category, $push: {possess: createdPlace._id}})
    let multiPlace = await MultiPlace.findOne({_id: qry._id}).populate('possess')
    res.json({ msg: RCODE.OPERATION_SUCCEED, data: { item: multiPlace } });
    // res.status(200).json({ msg: RCODE.OPERATION_SUCCEED, data: { item: place } });
  } catch (err) {
    log("err=", err);
    res.status(500).json({ msg: RCODE.SERVER_ERROR, data: {} });
  }
});

// editPlaceInfo
multiPlace.post("/editPlaceInfo", async (req, res) => {
  try {
    var qry = req.body;
    // console.log('Qry : ', qry)
    let place = await MultiPlace.findOneAndUpdate({_id:qry._id}, qry.content)
    res.json({ msg: RCODE.OPERATION_SUCCEED, data: { item: place } });
    // res.status(200).json({ msg: RCODE.OPERATION_SUCCEED, data: { item: place } });
  } catch (err) {
    log("err=", err);
    res.status(500).json({ msg: RCODE.SERVER_ERROR, data: {} });
  }
});

// editPosition
multiPlace.post("/editPosition", async (req, res) => {
  try {
    var qry = req.body;
    // console.log('Qry : ', qry)
    let location= {
      type: "Point",
      coordinates: [Number(qry.lng), Number(qry.lat)],
    }
    let place = await MultiPlace.findOneAndUpdate({_id:qry._id},{location: location})
    res.json({ msg: RCODE.OPERATION_SUCCEED, data: { item: place } });
    // res.status(200).json({ msg: RCODE.OPERATION_SUCCEED, data: { item: place } });
  } catch (err) {
    log("err=", err);
    res.status(500).json({ msg: RCODE.SERVER_ERROR, data: {} });
  }
});

// deleteById
multiPlace.post("/deleteById", async (req, res) => {
  try {
    var qry = req.body;
    // console.log('Qry : ', qry)

    let place = await MultiPlace.deleteOne(qry)
    res.json({ msg: RCODE.OPERATION_SUCCEED, data: { item: place } });
    // res.status(200).json({ msg: RCODE.OPERATION_SUCCEED, data: { item: place } });
  } catch (err) {
    log("err=", err);
    res.status(500).json({ msg: RCODE.SERVER_ERROR, data: {} });
  }
});

module.exports = multiPlace;
