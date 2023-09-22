"use strict";

const faker = require("faker");
const express = require("express");
const xlsx = require("xlsx");
const facility = express.Router({});
const dateFormat = require("dateformat");
const policy = require("../helper/sharing_policy.js");
const { ObjectId } = require('mongodb');

//--------------------------------------------------
// Default Boiler Function 2022
//--------------------------------------------------

facility.get("/name", async (req, res) => {
  log("req.query :", req.query);
  // log('test : req.query :', req.query)

  try {
    let qry = req.query;
    // let infocenter = await Infocenter.find().sort({$natural:-1}).limit(1)
    // let facility = await Facility.create(params)
    res.json({ msg: RCODE.OPERATION_SUCCEED, data: { item: facility } });
  } catch (err) {
    log("err=", err);
    res.status(500).json({ msg: RCODE.SERVER_ERROR, data: {} });
  }
});

facility.post("/name", async (req, res) => {
  log("req.body :", req.body);

  try {
    let qry = req.body;
    // let infocenter = await Infocenter.find().sort({$natural:-1}).limit(1)
    // let facility = await Facility.create(params)
    res.json({ msg: RCODE.OPERATION_SUCCEED, data: { item: facility } });
  } catch (err) {
    log("err=", err);
    res.status(500).json({ msg: RCODE.SERVER_ERROR, data: {} });
  }
});

//--------------------------------------------------
// New functions 2022
//--------------------------------------------------

facility.get("/getRewardPointPolicy", async (req, res) => {
  log("req.query :", req.query);
  // log('test : req.query :', req.query)

  try {
    let qry = req.query;
    const pointPolicy = policy.reward_point;
    // let infocenter = await Infocenter.find().sort({$natural:-1}).limit(1)
    // let facility = await Facility.create(params)
    res.json({ msg: RCODE.OPERATION_SUCCEED, data: { item: pointPolicy } });
  } catch (err) {
    log("err=", err);
    res.status(500).json({ msg: RCODE.SERVER_ERROR, data: {} });
  }
});

facility.get("/getFacility", async (req, res) => {
  log("req.query :", req.query);
  // log('test : req.query :', req.query)

  try {
    let qry = req.query;
    // let infocenter = await Infocenter.find().sort({$natural:-1}).limit(1)
    let facility = await Facility.findOne(qry)
    res.json({ msg: RCODE.OPERATION_SUCCEED, data: { item: facility } });
  } catch (err) {
    log("err=", err);
    res.status(500).json({ msg: RCODE.SERVER_ERROR, data: {} });
  }
});

facility.get("/getFacilitys", async (req, res) => {
  log("req.query :", req.query);
  // log('test : req.query :', req.query)

  try {
    let qry = req.query;
    // let infocenter = await Infocenter.find().sort({$natural:-1}).limit(1)
    let facilitys = await Facility.find(qry).sort({floor: 1})
    res.json({ msg: RCODE.OPERATION_SUCCEED, data: { item: facilitys } });
  } catch (err) {
    log("err=", err);
    res.status(500).json({ msg: RCODE.SERVER_ERROR, data: {} });
  }
});

facility.post("/addFacility", async (req, res) => {
  log("req.body :", req.body);

  try {
    let qry = req.body;


    let params = {
      parent_id: qry.parent_id,
      parent_name: qry.parent_name,
      facility_name: qry.name,
      category: qry.category,
      floor: qry.floor,
      area: qry.area,
      admin_address: qry.address,
      r_depth_1: qry.r_depth_1,
      r_depth_2: qry.r_depth_2,
      r_depth_3: qry.r_depth_3,
      admin_name:"황상익",
      admin_email:"mothcar@naver.com",
    };
    /*
    owner_name: "황상익",
      owner_email: "mothcar@naver.com",
    */ 
    // let infocenter = await Infocenter.find().sort({$natural:-1}).limit(1)
    let facility = await Facility.create(params);
    // console.log('facility Result : ', facility)
    // let parentId = mongoose.Types.ObjectId(facility.parent_id)
    let parentId = facility.parent_id
    let parentResult
    if(qry.isPublic){
      await PublicPlace.updateOne({_id:parentId},{ $push: {possess:new ObjectId(facility._id) }} )
      parentResult = await PublicPlace.findOne({_id:parentId})
      // console.log('Parent Result : ', parentResult)
    } else {
      await Place.updateOne({_id:parentId},{ $push: {possess:new ObjectId(facility._id) }} )
      parentResult = await Place.findOne({_id:parentId}).populate('possess post')
      // console.log('Parent Result : ', parentResult)
    }
    
    res.json({ msg: RCODE.OPERATION_SUCCEED, data: { item: parentResult } });
  } catch (err) {
    log("err=", err);
    res.status(500).json({ msg: RCODE.SERVER_ERROR, data: {} });
  }
});

facility.post("/editPlaceInfo", async (req, res) => {
  try {
    var qry = req.body;
    // console.log('Qry : ', qry)
    let facility = await Facility.findOneAndUpdate({ _id: qry._id }, qry.content);
    console.log('Updated : ', facility)
    res.json({ msg: RCODE.OPERATION_SUCCEED, data: { item: facility } });
    // res.status(200).json({ msg: RCODE.OPERATION_SUCCEED, data: { item: place } });
  } catch (err) {
    log("err=", err);
    res.status(500).json({ msg: RCODE.SERVER_ERROR, data: {} });
  }
});










//--------------------------------------------------
// Old functions
//--------------------------------------------------
facility.post("/createShop", async (req, res) => {
  log("test : req.body :", req.body);
  // log('test : req.query :', req.query)
  let qry = req.body;

  let imageUrl;
  if (qry.brand == "스타벅스") {
    imageUrl =
      "https://res.cloudinary.com/mothcar/image/upload/w_50,h_50,c_scale/v1619281249/Starbucks_fiwd8y.png";
  } else {
    // 이디야
    imageUrl =
      "https://res.cloudinary.com/mothcar/image/upload/w_50,h_50,c_scale/v1619330974/%EC%9D%B4%EB%94%94%EC%95%BC_rboxbx.png";
  }

  let params = {
    brand: qry.brand,
    brand_en: qry.brand_en,
    zip: qry.zip_code,
    tel: qry.telephone,
    shop_name: qry.shopName,
    address_admin: qry.address_admin,
    address_road: qry.address_road,
    image: imageUrl,
    location: {
      type: "Point",
      coordinates: [Number(qry.lng), Number(qry.lat)],
    },
  };

  try {
    // let infocenter = await Infocenter.find().sort({$natural:-1}).limit(1)
    let facility = await Facility.create(params);
    res.json({ msg: RCODE.OPERATION_SUCCEED, data: { item: facility } });
  } catch (err) {
    log("err=", err);
    res.status(500).json({ msg: RCODE.SERVER_ERROR, data: {} });
  }
});

facility.get("/getShops", async (req, res) => {
  log("test : req.query :", req.query);

  let b_lat = Number(req.query.b_lat);
  let b_lng = Number(req.query.b_lng);
  let t_lat = Number(req.query.t_lat);
  let t_lng = Number(req.query.t_lng);
  // res.ok(params)
  log("lat Type : ", typeof b_lat);

  var shop = await Facility.find({
    location: {
      $geoWithin: {
        $box: [
          [b_lng, b_lat],
          [t_lng, t_lat],
        ],
      },
    },
  });
  // var places = await Place.find({
  //    location: { $geoWithin: { $box:  [ [ b_lng,b_lat ], [ t_lng,t_lat ] ] } }
  // })

  // var lotMarker = shop.concat(places)
  // await Infocenter.find()
  log("position return : ", shop);
  res.status(200).json({ msg: RCODE.OPERATION_SUCCEED, data: { item: shop } });
});

facility.get("/getShop", async (req, res) => {
  // log('test : req.body :', req.body)
  log("test : req.query :", req.query);
  let qry = req.query;

  try {
    // let infocenter = await Infocenter.find().sort({$natural:-1}).limit(1)
    let shop = await Facility.findOne(qry);
    res.json({ msg: RCODE.OPERATION_SUCCEED, data: { item: shop } });
  } catch (err) {
    log("err=", err);
    res.status(500).json({ msg: RCODE.SERVER_ERROR, data: {} });
  }
});

module.exports = facility;
