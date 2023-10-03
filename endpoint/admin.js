"use strict";

const faker = require("faker");
const express = require("express");
const xlsx = require("xlsx");
const admin = express.Router({});
const dateFormat = require("dateformat");
const dictionary = require("../helper/dictionary");
const { ObjectId } = require("mongodb");
const { Blob } = require("buffer");
const tms = require("../helper/tms");
const getBankUrl = BANK_URL + "/ledger/findUserRecord";
const postBankUrl = BANK_URL + "/ledger/insertRecord";

var dotenv = require("dotenv");
// const multiPlace = require("../model/multiPlace.js");
dotenv.config();

//--------------------------------------------------
// test functions
//--------------------------------------------------

admin.get("/checkAdmin", async (req, res) => {
  try {
    const accessKey = req.query.accessKey;
    var user_info = tms.jwt.verify(accessKey, TOKEN.SECRET);
    // console.log('User Info by Token : ', user_info)
    if (user_info.email == SUPER_USER) {
      return res.json({ msg: RCODE.OPERATION_SUCCEED, data: { item: true } });
    } else
      return res.json({ msg: RCODE.OPERATION_SUCCEED, data: { item: false } });
  } catch (err) {
    log("err=", err);
    res.status(500).json({ msg: RCODE.SERVER_ERROR, data: {} });
  }
});

admin.get("/checkMe", async (req, res) => {
  try {
    const accessKey = req.query.accessKey;
    let user_info = tms.jwt.verify(accessKey, TOKEN.SECRET);
    console.log("User Info by Token : ", user_info);
    let userId = user_info._id;
    res.json({ msg: RCODE.OPERATION_SUCCEED, data: { item: userId } });
  } catch (err) {
    log("err=", err);
    res.status(500).json({ msg: RCODE.SERVER_ERROR, data: {} });
  }
});

admin.get("/getMinimumUserInfo", async (req, res) => {
  try {
    let qry = req.query;
    const user = await Users.findOne(qry);
    let userImg = "";
    if (user.user_img.length > 0)
      userImg = user.user_img[user.user_img.length - 1];
    // console.log('typeof : ', typeof user._id)
    // console.log('user id  : ', user._id)
    const qs = {
      service_name: "pinpoint",
      user_id: user._id.toString(),
    };

    // 은행정보 가져오기 **************************************************
    // let getLatest = await axios.get(getBankUrl, { params: qs })
    // let userLastBalance = 0
    // console.log('Get Latest : ', getLatest.data.data.item)
    // userLastBalance = getLatest.data.data.item.balance

    // let returnParam = {
    //   _id: user._id,
    //   waiting: user.waiting,
    //   user_name : user.name,
    //   email : user.email,
    //   user_img: user.user_img,
    //   simple_msg: user.simple_msg,
    //   job: user.job,
    //   poss_multi: user.poss_multi,
    //   poss_bldg: user.poss_bldg,
    //   poss_facil: user.poss_facil,
    //   poss_outdoor: user.poss_outdoor,
    //   post: user.post,
    //   contribution: user.contribution,
    //   introduction: user.introduction,
    //   balance: userLastBalance,
    // }
    let returnParam = {
      _id: user._id,
      user_name: user.name,
      nickname: user.nickname,
      year: user.year,
      email: user.email,
      user_img: user.user_img,
      simple_msg: user.simple_msg,
      job: user.job,
      post: user.post,
      balance: user.balance,
      agit: user.agit,
    };
    res.json({ msg: RCODE.OPERATION_SUCCEED, data: { item: returnParam } });
  } catch (err) {
    log("err=", err);
    res.status(500).json({ msg: RCODE.SERVER_ERROR, data: {} });
  }
});

// setFollow
admin.post("/setFollow", async (req, res) => {
  try {
    const accessKey = req.body.accessKey;
    let user_info = tms.jwt.verify(accessKey, TOKEN.SECRET);
    console.log("User Info by Token : ", user_info);
    let userId = user_info._id;
    // follow
    let myInfo = await Users.findOneAndUpdate(
      { _id: userId },
      { $push: { follow: req.body.option.follow } }
    );
    let userInfo = await Users.findOneAndUpdate(
      { _id: req.body.option.userId },
      { $push: { follower: userId } }
    );
    res.json({ msg: RCODE.OPERATION_SUCCEED, data: { item: userInfo } });
  } catch (err) {
    log("err=", err);
    res.status(500).json({ msg: RCODE.SERVER_ERROR, data: {} });
  }
});
// getFollows
admin.get("/getFollows", async (req, res) => {
  try {
    // follow
    let followUsers = await Users.findOne(req.query);
    let follows = followUsers.follow;
    getfollow().then(function(results){
      // access results here by chaining to the returned promise
      res.json({ msg: RCODE.OPERATION_SUCCEED, data: { item: results } });
  });
    async function getfollow() {
      let result = []
      for (let i = 0; follows.length > i; i++) {
        let strId = follows[i].valueOf();
        console.log("strId : ", strId);
        let user = await Users.findOne({ _id: strId });
        // console.log('user : ', user)
        let innerUser = {
          _id: user._id,
          nickname: user.nickname,
          year: user.year,
          user_img: user.user_img,
          simple_msg: user.simple_msg,
          job: user.job,
          post: user.post,
          agit: user.agit,
        };
        result.push(innerUser)
      }
      // console.log('result : ', result )
      return result
    }
    // console.log('final : ', final )
    
    
  } catch (err) {
    log("err=", err);
    res.status(500).json({ msg: RCODE.SERVER_ERROR, data: {} });
  }
});
// getFollowers
admin.get("/getFollowers", async (req, res) => {
  try {
    // follow
    let followUsers = await Users.findOne(req.query);
    let followers = followUsers.follower;
    getfollow().then(function(results){
      // access results here by chaining to the returned promise
      res.json({ msg: RCODE.OPERATION_SUCCEED, data: { item: results } });
  });
    async function getfollow() {
      let result = []
      for (let i = 0; followers.length > i; i++) {
        let strId = followers[i].valueOf();
        console.log("strId : ", strId);
        let user = await Users.findOne({ _id: strId });
        // console.log('user : ', user)
        let innerUser = {
          _id: user._id,
          nickname: user.nickname,
          year: user.year,
          user_img: user.user_img,
          simple_msg: user.simple_msg,
          job: user.job,
          post: user.post,
          agit: user.agit,
        };
        result.push(innerUser)
      }
      // console.log('result : ', result )
      return result
    }
    // console.log('final : ', final )
    
    
  } catch (err) {
    log("err=", err);
    res.status(500).json({ msg: RCODE.SERVER_ERROR, data: {} });
  }
});

//
admin.post("/editProfile", async (req, res) => {
  try {
    log("editProfile :", req.body);
    const qry = req.body;
    const accessKey = qry.accessKey;
    var user_info = tms.jwt.verify(accessKey, TOKEN.SECRET);
    let updateUser = await Users.findOneAndUpdate(
      { _id: user_info._id },
      { $set: qry.data }
    );
    let user = await Users.findOne({ _id: user_info._id });
    const qs = {
      service_name: "pinpoint",
      user_id: user._id.toString(),
    };

    // 은행정보 가져오기 **************************************************
    let getLatest = await axios.get(getBankUrl, { params: qs });
    let userLastBalance = 0;
    console.log("Get Latest : ", getLatest.data.data.item);
    userLastBalance = getLatest.data.data.item.balance;

    let returnParam = {
      _id: user._id,
      waiting: user.waiting,
      user_name: user.name,
      email: user.email,
      user_img: user.user_img,
      simple_msg: user.simple_msg,
      job: user.job,
      poss_multi: user.poss_multi,
      poss_bldg: user.poss_bldg,
      poss_facil: user.poss_facil,
      poss_outdoor: user.poss_outdoor,
      post: user.post,
      contribution: user.contribution,
      introduction: user.introduction,
      balance: userLastBalance,
    };
    res.json({ msg: RCODE.OPERATION_SUCCEED, data: { item: returnParam } });
  } catch (err) {
    log("err=", err);
    res.status(500).json({ msg: RCODE.SERVER_ERROR, data: {} });
  }
});

admin.get("/getImage", async (req, res) => {
  console.log("Get image params : ", req.query);
  try {
    let getUser = await Users.findOne(req.query);
    let image;
    if (getUser.user_img.length > 0) {
      image = getUser.user_img[getUser.user_img.length - 1];
    } else image = getUser.user_img[0];
    const id = getUser._id;
    const nickName = getUser.nickname;
    const sendParams = {
      id: id,
      nickName: nickName,
      image: image,
    };

    console.log("User Image : ", image);
    res.json({ msg: RCODE.OPERATION_SUCCEED, data: { item: sendParams } });
  } catch (err) {
    log("err=", err);
    res.status(500).json({ msg: RCODE.SERVER_ERROR, data: {} });
  }
});

admin.post("/updateUserImage", async (req, res) => {
  try {
    log("updateUserImage :", req.body);
    const qry = req.body;
    await Users.findOneAndUpdate(
      { _id: qry._id },
      { $push: { user_img: qry.image } }
    );

    const qs = {
      service_name: "pinpoint",
      user_id: qry._id.toString(),
    };

    let getLatest = await axios.get(getBankUrl, { params: qs });
    let userLastBalance = 0;
    console.log("Get Latest : ", getLatest.data.data.item);
    userLastBalance = getLatest.data.data.item.balance;

    let user = await Users.findOne({ _id: qry._id });
    let returnParam = {
      _id: user._id,
      waiting: user.waiting,
      user_name: user.name,
      email: user.email,
      user_img: user.user_img,
      simple_msg: user.simple_msg,
      job: user.job,
      poss_multi: user.poss_multi,
      poss_bldg: user.poss_bldg,
      poss_facil: user.poss_facil,
      poss_outdoor: user.poss_outdoor,
      post: user.post,
      contribution: user.contribution,
      introduction: user.introduction,
      balance: userLastBalance,
    };
    res.json({ msg: RCODE.OPERATION_SUCCEED, data: { item: returnParam } });
  } catch (err) {
    log("err=", err);
    res.status(500).json({ msg: RCODE.SERVER_ERROR, data: {} });
  }
});

admin.get("/checkExpire", async (req, res) => {
  try {
    const accessKey = req.query.accessKey;
    var user_info = tms.jwt.verify(accessKey, TOKEN.SECRET);
    console.log("User Info by Token : ", user_info);
    if (user_info.iat >= user_info.exp)
      return res.json({ msg: RCODE.OPERATION_SUCCEED, data: { item: false } });
    if (user_info)
      return res.json({ msg: RCODE.OPERATION_SUCCEED, data: { item: true } });
  } catch (err) {
    log("err=", err);
    res.json({ msg: RCODE.SERVER_ERROR, data: { item: false } });
  }
});
// 국회의사당 생성 MULTI -> PUBLIC
admin.post("/createAssembly", async (req, res) => {
  try {
    log("test req.body= :", req.body);
    // GovType: ["LEGISLATIVE", "JUDICIAL", "ADMINI"],
    // PlaceType: ["PUBLIC", "MULTI", "PLACE"],
    // 국회의사당
    let getFromMulti = await MultiPlace.findOne({
      road_address: "서울특별시 영등포구 의사당대로 1",
    });
    let setParams = {
      place_name: "국회의사당",
      place_type: "PUBLIC",
      gov_type: "LEGISLATIVE",
      public_type: "N_ASSEMBLY",
      admin_address: "서울특별시 영등포구 여의도동 1",
      road_address: "서울특별시 영등포구 의사당대로 1",
      r_depth_1: "서울",
      r_depth_2: "영등포구",
      r_depth_3: "여의도동",
      zip: "07233",
      location: getFromMulti.location,
      owner_name: "황상익",
      owner_email: "mothcar@naver.com",
      interest: 1000,
    };
    let changedPublic = await PublicPlace.create(setParams);
    await MultiPlace.deleteOne({
      road_address: "서울특별시 영등포구 의사당대로 1",
    });
    res.json({ msg: RCODE.OPERATION_SUCCEED, data: { item: changedPublic } });
  } catch (err) {
    log("err=", err);
    res.status(500).json({ msg: RCODE.SERVER_ERROR, data: {} });
  }
});

admin.post("/", async (req, res) => {
  try {
    log("test req.body= :", req.body);
    res.json({
      msg: RCODE.OPERATION_SUCCEED,
      data: { item: "Good Server1234~~~" },
    });
  } catch (err) {
    log("err=", err);
    res.status(500).json({ msg: RCODE.SERVER_ERROR, data: {} });
  }
});

admin.get("/aa", async (req, res) => {
  try {
    log("@@ Env : ", process.env);
    res.json({
      msg: RCODE.OPERATION_SUCCEED,
      data: { item: "Good Server~~~" },
    });
  } catch (err) {
    log("err=", err);
    res.status(500).json({ msg: RCODE.SERVER_ERROR, data: {} });
  }
});

// js test
admin.get("/jsTest", async (req, res) => {
  try {
    let arr = [1, 2, 3, 4];
    if (arr.includes(5)) {
      console.log("1st stop?");
    } else if (arr.includes(2)) {
      console.log("2nd stop?");
    } else {
      console.log("last stop?");
    }

    res.json({
      msg: RCODE.OPERATION_SUCCEED,
      data: { item: "Good Server~~~" },
    });
  } catch (err) {
    log("err=", err);
    res.status(500).json({ msg: RCODE.SERVER_ERROR, data: {} });
  }
});

// Simple CSV Read
admin.get("/readCSV", async (req, res) => {
  try {
    const csvFilePath = "./multi_basic.csv";
    // const csvFilePath = "./part_s1.csv";
    const csv = require("csvtojson");
    //   const converter = csv({
    //     noheader: true,
    //     // delimiter: '\n',
    //     delimiter: ",",
    //   });

    let raw = await csv().fromFile(csvFilePath);

    console.log("@@ length ; ", raw.length);

    // 전국 아파트 단지 18,629개
    // for(let i=0; raw.length>i;i++) {
    for (let i = 12914; 12915 > i; i++) {
      // for(let i=1421; 1422>i;i++) {
      console.log("i : ", i);
    }

    res.json({ msg: RCODE.OPERATION_SUCCEED, data: { item: "Done!!" } });
    // res.json({msg:RCODE.OPERATION_SUCCEED, data:{item:raw[100]}})
  } catch (err) {
    // log("err=", err);
    res.status(500).json({ msg: RCODE.SERVER_ERROR, data: {} });
  }
}); // Simple CSV Read

// Simple Read Json
admin.get("/readJson", async (req, res) => {
  try {
    let ori = require("../dj_bld.json");
    // let ori = require("../gangnam.json");
    // let ori = require("../gumchun.json");
    // let ori = require("../gj_donggu.json");
    let raw = ori.Data;

    // 강남 건물 24,130개
    console.log("Lines Length : ", raw.length);
    let count = 0;
    for (let i = 0; raw.length > i; i++) {
      // for (let i = 0; 5 > i; i++) {

      let editedAddress = raw[i].PLAT_PLC.replace("번지", "");
      if (editedAddress === "서울특별시 동작구 노량진동 323") {
        console.log(`${i} : ${raw[i]}`);
        count += 1;
        console.log("Count : ", count);
      }

      //   console.log("i : ", i);
    } // End of For Loop

    res.json({ msg: RCODE.OPERATION_SUCCEED, data: { item: "Good~~~" } });
  } catch (err) {
    log("err=", err);
    res.status(500).json({ msg: RCODE.SERVER_ERROR, data: {} });
  }
}); // Simple Read Json

// simple Get Data
admin.get("/getPlace", async (req, res) => {
  try {
    let getPlace = await Place.findOne({
      _id: "62b8af9c0574dc9ca6431d81",
    }).populate("possess");
    console.log("Get Place : ", getPlace);
  } catch (err) {
    log("err=", err);
    res.status(500).json({ msg: RCODE.SERVER_ERROR, data: {} });
  }
});

// 광주 Test : gj_dong_sansu.json
admin.get("/readcsv", async (req, res) => {
  try {
    console.log("READ...............");
    const csvFilePath = "./multi_basic.csv";
    const csv = require("csvtojson");
    //   const converter = csv({
    //     noheader: true,
    //     // delimiter: '\n',
    //     delimiter: ",",
    //   });

    //   let raw = await csv().fromFile(csvFilePath);
    let ori = require("../gj_dong_sansu.json");
    let raw = ori.Data;

    console.log("@@ length ; ", raw.length);

    // 전체 18629개
    // for(let i=0; raw.length>i;i++) {
    for (let i = 5700; 5701 > i; i++) {
      // for(let i=1421; 1422>i;i++) {
      console.log("i : ", i);
      let editedAddress = raw[i].PLAT_PLC.replace("번지", "");
      // console.log(i)
      // if(edit === "광주광역시 동구 산수동 689") console.log('raw[i] : ', `raw[${i}] : ${edit}`)
      console.log(raw[i]);

      let params = {
        bld_plot_area: raw[i].TOTAREA, // 연면적 ㎡
        bld_place_area: raw[i].PLAT_AREA, // 대지면적
        bld_area: raw[i].ARCH_AREA, // 건축면적
        bld_yong: raw[i].VL_RAT, // 용적율 %
        bld_gunpe: raw[i].BC_RAT, // 건폐율 %
        bld_floor: raw[i].GRND_FLR_CNT, // 지상층수
        bld_under: raw[i].UGRND_FLR_CNT, // 지하층수
        bld_park: raw[i].INDR_AUTO_UTCNT, // 주차대수
        bld_park_area: raw[i].INDR_AUTO_AREA, // 주차면적
      };

      if (raw[i].DONG_NM.length > 1) {
        // APARTMENT
        // params.bldg_no = raw[i].DONG_NM
        console.log(`${editedAddress} , ${raw[i].DONG_NM}`);
        let dong = raw[i].DONG_NM.replace("동", "");
        let updatePlace = await Place.findOneAndUpdate(
          { admin_address: editedAddress, bldg_no: dong },
          { $set: params },
          { upsert: true, new: true }
        );
        console.log("update result : ", updatePlace);
      } else {
        // Builidng
        let updatePlace = await Place.findOneAndUpdate(
          { admin_address: editedAddress },
          { $set: params },
          { upsert: true, new: true }
        );
        console.log("update result : ", updatePlace);
      }
    }

    res.json({ msg: RCODE.OPERATION_SUCCEED, data: { item: "Done!!" } });
    // res.json({msg:RCODE.OPERATION_SUCCEED, data:{item:raw[100]}})
  } catch (err) {
    log("err=", err);
    res.status(500).json({ msg: RCODE.SERVER_ERROR, data: {} });
  }
}); // 광주 Test

// **********************************************************************************************************************
// Admin Project  *******************************************************************************************************
// **********************************************************************************************************************

// Check 면적정보 *********************************************************************************************
// checkCsv
admin.get("/checkCsv", async (req, res) => {
  try {
    const csvFilePath = "./part_s51.csv";
    const csv = require("csvtojson");
    let raw = await csv().fromFile(csvFilePath);

    console.log("@@ length ; ", raw.length);

    for (let i = 0; raw.length > i; i++) {
      // for (let i = 0; 1 > i; i++) {
      // for (let i = 8791; 8792 > i; i++) {
      // for(let i=1421; 1422>i;i++) {
      if (raw[i].법정동명 === "서울특별시 동작구 신대방동") {
        console.log("i : ", i);
        console.log("i : ", raw[i]);
        return;
      }
      // console.log("i else : ", i);
      // console.log("i else : ", raw[i]);
    }

    res.json({ msg: RCODE.OPERATION_SUCCEED, data: { item: "Done!!" } });
    // res.json({msg:RCODE.OPERATION_SUCCEED, data:{item:raw[100]}})
  } catch (err) {
    // log("err=", err);
    res.status(500).json({ msg: RCODE.SERVER_ERROR, data: {} });
  }
}); // checkCsv

// paul Check 건축물대장 *********************************************************************************************
admin.get("/checkBldInfo", async (req, res) => {
  try {
    let ori = require("../gangdong.json");
    // let ori = require("../ydp.json");
    // let ori = require("../guro.json");
    // let ori = require("../gwanak.json");
    // let ori = require("../dj_bld.json");
    // let ori = require("../gangnam.json");
    // let ori = require("../gumchun.json");
    // let ori = require("../gj_donggu.json");
    let raw = ori.Data;

    // 강남 건물 24,130개
    console.log("Lines Length : ", raw.length);

    for (let i = 20118; 20120 > i; i++) {
      // for (let i = 11396; 11397 > i; i++) {
      //   console.log("i : ", i);
      let editedAddress = raw[i].PLAT_PLC.replace("번지", "");
      // console.log(i)
      // if(edit === "광주광역시 동구 산수동 689") console.log('raw[i] : ', `raw[${i}] : ${edit}`)

      console.log("i : ", i);
      console.log("Result ....................... : ", raw[i]);

      //   if (raw[i].BLD_NM === /주민센터/) continue;  //주민센터

      // if (editedAddress === "서울특별시 관악구 신림동 산56-1") {
      //   console.log(i);
      //   console.log("Result ....................... : ", raw[i]);
      // }

      //   if (raw[i].MGM_BLDRGST_PK === '11545-17018') {
      //       console.log(i)
      //       console.log('Result ....................... : ', raw[i].BLD_NM)
      //       console.log('Result ....................... : ', raw[i].PLAT_PLC)
      //   }

      // if (raw[i].MAIN_PURPS_CD === '10000') {
      //     console.log(i)
      //     console.log('Result ....................... : ', raw[i].BLD_NM)
      //     console.log('Result ....................... : ', raw[i].PLAT_PLC)
      // }

      // if (raw[i].MAIN_PURPS_CD === '02000' || raw[i].MAIN_PURPS_CD === '01000') {
      //     console.log(i)
      //     console.log('Result ....................... : ', raw[i].BLD_NM)
      //     console.log('Result ....................... : ', raw[i].PLAT_PLC)
      // }

      // if (typeof raw[i].BLD_NM !== "undefined") {
      //   let term = raw[i].BLD_NM;
      //   // console.log('term : ', term)
      //   if (term.includes("주민센터") && raw[i].MAIN_PURPS_CD === "03000")
      //     continue;
      // }

      // if (typeof raw[i].BLD_NM !== "undefined") {
      //   let term = raw[i].BLD_NM;
      //   // console.log('term : ', term)
      //   if (term.includes("서울대학교")){
      //     console.log(i)
      //     console.log(raw[i])
      //   }
      // }

      //   let placeName = "일반건물";
      //   if(typeof raw[i].BLD_NM !== 'undefined') placeName = raw[i].BLD_NM
      //     if(raw[i].BLD_NM==='두암 그린파크') {
      //         console.log("i : ", i);

      //         placeName = raw[i].BLD_NM
      //         console.log('Place Name : ', placeName)
      //         console.log(raw[i]);
      //     }
      // console.log('Place Name : ', placeName)

      //   if(raw[i].ETC_PURPS === '아파트') {
      //       console.log("i : ", i);

      //       placeName = raw[i].BLD_NM
      //       console.log(raw[i].MAIN_PURPS_CD_NM);
      //   }

      // MAIN_PURPS_CD_NM === "공동주택"
      // ETC_PURPS === "아파트"

      //   let API_KEY = process.env.SK_API_KEY;
      // //   let createKeyword = editedAddress;
      // //   let poiKeyword = encodeURIComponent(createKeyword);

      //   let addressArr = editedAddress.split(" ");
      //   //   console.log("addressArr : ", addressArr);
      //   let cityDo_str = addressArr[0];
      //   let guGun_str = addressArr[1];
      //   let dong_str = addressArr[2];
      //   let bunji_str = addressArr[3];
      // //   let cityDo_str = "서울특별시"
      // //   let guGun_str = "관악구"
      // //   let dong_str = "신림동"
      // //   let bunji_str = "산 168-10"
      //   if(bunji_str === '산') bunji_str = addressArr[3]+addressArr[4]
      //   let cityDo = encodeURIComponent(cityDo_str);
      //   let guGun = encodeURIComponent(guGun_str);
      //   let dong = encodeURIComponent(dong_str);
      //   let bunji = encodeURIComponent(bunji_str);

      //   //   let getPoiApi = `https://apis.openapi.sk.com/tmap/pois?version=1&appKey=${API_KEY}&searchKeyword=${poiKeyword}&searchType=all&searchtypCd=A&page=1&count=5&reqCoordType=WGS84GEO&resCoordType=WGS84GEO&multiPoint=N&poiGroupYn=N`;
      //     // let getPoiApi = `https://apis.openapi.sk.com/tmap/geo/fullAddrGeo?addressFlag=F01&coordType=WGS84GEO&page=1&count=20&appKey=${API_KEY}&version=1&fullAddr=${poiKeyword}`;
      //   // Geocode
      //   let getPoiApi = `https://apis.openapi.sk.com/tmap/geo/geocoding?version=1&city_do=${cityDo}&gu_gun=${guGun}&dong=${dong}&bunji=${bunji}&addressFlag=F01&coordType=WGS84GEO&appKey=${API_KEY}`;

      //   let result = await axios.get(getPoiApi);
      //   //   console.log("result 0 : ", result);

      //   let onePoi = result.data.coordinateInfo;
      //   console.log('One Poi : ', onePoi)
    } // End of For Loop

    res.json({ msg: RCODE.OPERATION_SUCCEED, data: { item: "Good~~~" } });
  } catch (err) {
    log("err=", err);
    res.status(500).json({ msg: RCODE.SERVER_ERROR, data: {} });
  }
}); // Check 건축물대장

// 1. 일반빌딩 건축물대장 ----------------------------------------------------------------------------------------------------------
admin.get("/insertBuilding", async (req, res) => {
  let ori = require("../gumchun.json");
  //   let ori = require("../gangnam.json");
  // let ori = require("../gj_donggu.json");
  let raw = ori.Data;

  // 강남 건물 24,130개
  console.log("Lines Length : ", raw.length);

  // 21178부터 20000건으로 stop
  // for (let i = 0; raw.length > i; i++) {
  for (let i = 15194; 15195 > i; i++) {
    try {
      //   console.log("i : ", i);
      let editedAddress = raw[i].PLAT_PLC.replace("번지", "");

      // 아파트면 raw continue
      // MAIN_PURPS_CD_NM === "공동주택"
      // ETC_PURPS === "아파트"
      if (raw[i].MAIN_PURPS_CD === "02000" || raw[i].MAIN_PURPS_CD === "01000")
        continue;
      //주민센터이면 pass
      if (typeof raw[i].BLD_NM !== "undefined") {
        let term = raw[i].BLD_NM;
        // console.log('term : ', term)
        if (term.includes("주민센터") || raw[i].MAIN_PURPS_CD === "03000")
          continue;
      }

      // 아파트가 아니면 sk 불러와서 좌표 입력
      let API_KEY = process.env.SK_API_KEY;
      //   let createKeyword = editedAddress;
      //   let poiKeyword = encodeURIComponent(createKeyword);

      let addressArr = editedAddress.split(" ");
      //   console.log("addressArr : ", addressArr);
      let cityDo_str = addressArr[0];
      let guGun_str = addressArr[1];
      let dong_str = addressArr[2];
      let bunji_str = addressArr[3];
      if (bunji_str === "산") bunji_str = addressArr[3] + addressArr[4];
      let cityDo = encodeURIComponent(cityDo_str);
      let guGun = encodeURIComponent(guGun_str);
      let dong = encodeURIComponent(dong_str);
      let bunji = encodeURIComponent(bunji_str);

      //   let getPoiApi = `https://apis.openapi.sk.com/tmap/pois?version=1&appKey=${API_KEY}&searchKeyword=${poiKeyword}&searchType=all&searchtypCd=A&page=1&count=5&reqCoordType=WGS84GEO&resCoordType=WGS84GEO&multiPoint=N&poiGroupYn=N`;
      // let getPoiApi = `https://apis.openapi.sk.com/tmap/geo/fullAddrGeo?addressFlag=F01&coordType=WGS84GEO&page=1&count=20&appKey=${API_KEY}&version=1&fullAddr=${poiKeyword}`;
      // Geocode
      let getPoiApi = `https://apis.openapi.sk.com/tmap/geo/geocoding?version=1&city_do=${cityDo}&gu_gun=${guGun}&dong=${dong}&bunji=${bunji}&addressFlag=F01&coordType=WGS84GEO&appKey=${API_KEY}`;

      let result = await axios.get(getPoiApi);
      //   console.log("result 0 : ", result);

      let onePoi = result.data.coordinateInfo;

      let placeName = "일반건물";
      if (typeof raw[i].BLD_NM !== "undefined") placeName = raw[i].BLD_NM;
      if (placeName === ".") placeName = "일반건물";
      console.log("Place Name : ", placeName);

      let lat = Number(onePoi.lat);
      let lng = Number(onePoi.lon);
      let createParams = {
        mgm_id: raw[i].MGM_BLDRGST_PK,
        admin_address: editedAddress, // 주소
        place_name: placeName, // 건물명
        place_type: "BUILDING", // 건물 type
        place_code: raw[i].MAIN_PURPS_CD, // 장소 type code
        // road_address: onePoi.newAddressList.newAddress.fullAddressRoad, // 도로명주소
        road_address: raw[i].NEW_PLAT_PLC, // 도로명주소
        r_depth_1: onePoi.city_do,
        r_depth_2: onePoi.gu_gun,
        r_depth_3: onePoi.adminDong,
        owner_name: "황상익",
        owner_email: "mothcar@naver.com",
        location: {
          type: "Point",
          coordinates: [lng, lat],
        },
        bld_plot_area: raw[i].TOTAREA, // 연면적 ㎡
        bld_place_area: raw[i].PLAT_AREA, // 대지면적
        bld_area: raw[i].ARCH_AREA, // 건축면적
        bld_yong: raw[i].VL_RAT, // 용적율 %
        bld_gunpe: raw[i].BC_RAT, // 건폐율 %
        bld_floor: raw[i].GRND_FLR_CNT, // 지상층수
        bld_under: raw[i].UGRND_FLR_CNT, // 지하층수
        bld_park: raw[i].INDR_AUTO_UTCNT, // 주차대수
        bld_park_area: raw[i].INDR_AUTO_AREA, // 주차면적
      };

      let createdBuilding = await Place.create(createParams);
      console.log("Created Building : ", createdBuilding);
    } catch (err) {
      console.log(`Iteration ${i} catch block`);
      continue;
      // log("err=", err);
      // res.status(500).json({ msg: RCODE.SERVER_ERROR, data: {} });
    }
  } // End of For Loop

  res.json({ msg: RCODE.OPERATION_SUCCEED, data: { item: "Good~~~" } });
});
// 일반빌딩 insert By 건축물대장

// 1.  누락된 것 넣기 Add place name  *********************************************************************************************
admin.get("/insertPlaceName", async (req, res) => {
  try {
    let ori = require("../dj_bld.json");
    // let ori = require("../gangnam.json");
    // let ori = require("../gumchun.json");
    // let ori = require("../gj_donggu.json");
    let raw = ori.Data;

    // 강남 건물 24,130개
    console.log("Lines Length : ", raw.length);

    for (let i = 8577; raw.length > i; i++) {
      if (typeof raw[i].DONG_NM !== "undefined") {
        let place = await Place.findOne({ mgm_id: raw[i].MGM_BLDRGST_PK });
        if (place) {
          await Place.updateOne(
            { _id: place._id },
            { place_name: raw[i].DONG_NM }
          );
          console.log(`Dong : name : ${i} : ${raw[i].DONG_NM}`);
        }
      } else if (typeof raw[i].BLD_NM !== "undefined") {
        if (raw[i].BLD_NM.length > 2) {
          let place = await Place.findOne({ mgm_id: raw[i].MGM_BLDRGST_PK });
          // console.log('Place : ', place)
          if (place) {
            if (place.place_name === "")
              await Place.updateOne(
                { _id: place._id },
                { place_name: raw[i].BLD_NM }
              );
            console.log(`BLD name : ${i} : ${raw[i].BLD_NM}`);
          }
        }
      } else {
        let place = await Place.findOne({ mgm_id: raw[i].MGM_BLDRGST_PK });
        // console.log('Place : ', place)
        if (place) {
          if (place.place_name === "")
            await Place.updateOne(
              { _id: place._id },
              { place_name: "일반건물" }
            );
          console.log(`BLD name : ${i} : 일반건물`);
        }
      }
    }

    res.json({ msg: RCODE.OPERATION_SUCCEED, data: { item: "Good~~~" } });
  } catch (err) {
    log("err=", err);
    res.status(500).json({ msg: RCODE.SERVER_ERROR, data: {} });
  }
}); // Add place name

// 1.  누락된 것 넣기 Add parent_id   *********************************************************************************************
admin.get("/addParentId", async (req, res) => {
  try {
    let ori = require("../dj_bld.json");
    // let ori = require("../gangnam.json");
    // let ori = require("../gumchun.json");
    // let ori = require("../gj_donggu.json");
    let raw = ori.Data;

    // 강남 건물 24,130개
    console.log("Lines Length : ", raw.length);

    // find 동작구 Multi
    let multies = await Place.find({
      r_depth_2: "동작구",
      place_type: "MULTI",
    });
    // console.log('Multi conunt : ', multies)
    for (let i = 0; multies.length > i; i++) {
      let children = multies[i].bldg;
      console.log("Children : ", children);
      children.forEach(async (id) => {
        await Place.updateOne(
          { _id: id },
          { parent_id: new ObjectId(multies[i]._id) }
        );
        console.log("Updated id : ", id);
      });

      // if(place.place_name==='') await Place.updateOne({_id:place._id}, {place_name:'일반건물'})
      // console.log(`BLD name : ${i} : 일반건물`)
    }

    res.json({ msg: RCODE.OPERATION_SUCCEED, data: { item: "Good~~~" } });
  } catch (err) {
    log("err=", err);
    res.status(500).json({ msg: RCODE.SERVER_ERROR, data: {} });
  }
}); // Add parent_id

// 2. Add MGM_PK to 건축물대장 *********************************************************************************************
admin.get("/addPK", async (req, res) => {
  try {
    // let ori = require("../dj_bld.json");
    // let ori = require("../gangnam.json");
    let ori = require("../gumchun.json");
    // let ori = require("../gj_donggu.json");
    let raw = ori.Data;

    // 강남 건물 24,130개
    console.log("Lines Length : ", raw.length);

    // for (let i = 0; raw.length > i; i++) {
    for (let i = 0; 5 > i; i++) {
      //   console.log("i : ", i);
      let editedAddress = raw[i].PLAT_PLC.replace("번지", "");
      let plotArea = raw[i].TOTAREA;
      let area = raw[i].ARCH_AREA;

      let params = {
        admin_address: editedAddress,
        bld_plot_area: plotArea,
        bld_area: area,
      };

      let updatePlace = await Place.findOneAndUpdate(
        params,
        { $set: { mgm_id: raw[i].MGM_BLDRGST_PK } },
        { upsert: true, new: true }
      );

      console.log("Updated... : ", updatePlace);
    } // End of For Loop

    res.json({ msg: RCODE.OPERATION_SUCCEED, data: { item: "Good~~~" } });
  } catch (err) {
    log("err=", err);
    res.status(500).json({ msg: RCODE.SERVER_ERROR, data: {} });
  }
}); // Add MGM_PK

// 3. Bld Info to Multi paul
admin.get("/insertBldToMulti", async (req, res) => {
  var API_KEY = process.env.SK_API_KEY;
  // console.log("Get env : ", API_KEY);

  let ori = require("../gwanak.json");
  // let ori = require("../dj_bld.json");
  // let ori = require("../gangnam.json");
  // let ori = require("../gumchun.json");
  // let ori = require("../gj_donggu.json");

  let raw = ori.Data;
  console.log("Lines Length : ", raw.length);

  // update special data
  // for (let i = 3070; 3087 > i; i++) {
  //   try {
  //     let pk_code = raw[i].MGM_BLDRGST_PK;
  //     let dongName = raw[i].DONG_NM
  //     if(dongName === '') dongName =raw[i].BLD_NM
  //     let params ={
  //       place_name: dongName
  //     }
  //     let updatePlace = await Place.findOneAndUpdate(
  //       { mgm_id: pk_code },
  //       { $set: params },
  //       { upsert: false }
  //     );

  //     console.log('Result : ', updatePlace)

  //      } catch (err) {
  //     console.log(`Iteration ${i} catch block`);
  //     continue;
  //   }
  // }

  // for(let i=0; raw.length>i;i++) {
  for (let i = 30776; 30800 > i; i++) {
    try {
      // console.log("i : ", i);
      // console.log("raw[i] : ", raw[i].MAIN_PURPS_CD);

      // if (raw[i].MAIN_PURPS_CD === '03000' || raw[i].MAIN_PURPS_CD === '18000'|| raw[i].MAIN_PURPS_CD === '04000'|| raw[i].MAIN_PURPS_CD === '10000'|| raw[i].MAIN_PURPS_CD === '13000' || raw[i].MAIN_PURPS_CD === '09000' ) continue;
      // console.log("raw[i] after : ", raw[i].MAIN_PURPS_CD);
      // console.log("i : ", i);
      // console.log("raw[i]  : ", raw[i]);
      //주민센터이면 pass
      if (typeof raw[i].BLD_NM !== "undefined") {
        let term = raw[i].BLD_NM;
        // console.log('term : ', term)
        if (term.includes("주민센터") || raw[i].MAIN_PURPS_CD === "03000")
          continue;
      }

      let editedAddress = raw[i].PLAT_PLC.replace("번지", "");
      // 서울특별시 동작구 노량진동 323  우성아파트
      //

      // MGM_BLDRGST_PK
      let isMgmParams = {
        mgm_id: raw[i].MGM_BLDRGST_PK,
      };
      let isMgm = await Place.find(isMgmParams);
      // console.log('IsMgm : ', isMgm)
      if (isMgm.length < 1) {
        let addressArr = editedAddress.split(" ");
        //   console.log("addressArr : ", addressArr);
        let cityDo_str = addressArr[0];
        let guGun_str = addressArr[1];
        let dong_str = addressArr[2];
        let bunji_str = addressArr[3];
        if (bunji_str === "산") bunji_str = addressArr[3] + addressArr[4];
        let cityDo = encodeURIComponent(cityDo_str);
        let guGun = encodeURIComponent(guGun_str);
        let dong = encodeURIComponent(dong_str);
        let bunji = encodeURIComponent(bunji_str);

        //   let getPoiApi = `https://apis.openapi.sk.com/tmap/pois?version=1&appKey=${API_KEY}&searchKeyword=${poiKeyword}&searchType=all&searchtypCd=A&page=1&count=5&reqCoordType=WGS84GEO&resCoordType=WGS84GEO&multiPoint=N&poiGroupYn=N`;
        // let getPoiApi = `https://apis.openapi.sk.com/tmap/geo/fullAddrGeo?addressFlag=F01&coordType=WGS84GEO&page=1&count=20&appKey=${API_KEY}&version=1&fullAddr=${poiKeyword}`;
        // Geocode
        let getPoiApi = `https://apis.openapi.sk.com/tmap/geo/geocoding?version=1&city_do=${cityDo}&gu_gun=${guGun}&dong=${dong}&bunji=${bunji}&addressFlag=F01&coordType=WGS84GEO&appKey=${API_KEY}`;

        let result = await axios.get(getPoiApi);
        //   console.log("result 0 : ", result);

        let onePoi = result.data.coordinateInfo;

        // let placeName = "일반건물";
        // if (typeof raw[i].BLD_NM !== "undefined") placeName = raw[i].BLD_NM;
        // if (placeName === ".") placeName = "일반건물";
        // console.log("Place Name : ", placeName);

        let dongName = "";
        if (typeof raw[i].DONG_NM !== "undefined") {
          dongName = raw[i].DONG_NM;
        } else if (typeof raw[i].BLD_NM !== "undefined") {
          dongName = raw[i].BLD_NM;
          if (dongName === ".") dongName = "일반건물";
        } else {
          dongName = "일반건물";
        }
        console.log(`${i} : ${dongName}`);

        let lat = Number(onePoi.lat);
        let lng = Number(onePoi.lon);
        let createParams = {
          mgm_id: raw[i].MGM_BLDRGST_PK,
          admin_address: editedAddress, // 주소
          place_name: dongName, // 건물명
          place_type: "BUILDING", // 건물 type
          place_code: raw[i].MAIN_PURPS_CD, // 장소 type code
          // road_address: onePoi.newAddressList.newAddress.fullAddressRoad, // 도로명주소
          road_address: raw[i].NEW_PLAT_PLC, // 도로명주소
          r_depth_1: onePoi.city_do,
          r_depth_2: onePoi.gu_gun,
          r_depth_3: onePoi.adminDong,
          location: {
            type: "Point",
            coordinates: [lng, lat],
          },
          bld_plot_area: raw[i].TOTAREA, // 연면적 ㎡
          bld_place_area: raw[i].PLAT_AREA, // 대지면적
          bld_area: raw[i].ARCH_AREA, // 건축면적
          bld_yong: raw[i].VL_RAT, // 용적율 %
          bld_gunpe: raw[i].BC_RAT, // 건폐율 %
          bld_floor: raw[i].GRND_FLR_CNT, // 지상층수
          bld_under: raw[i].UGRND_FLR_CNT, // 지하층수
          bld_park: raw[i].INDR_AUTO_UTCNT, // 주차대수
          bld_park_area: raw[i].INDR_AUTO_AREA, // 주차면적
        };

        let createdBuilding = await Place.create(createParams);
        // console.log("Created Building : ", createdBuilding);

        let findParams = {
          admin_address: editedAddress,
          place_type: "BUILDING",
        };

        let isPlaces = await Place.find(findParams);
        if (isPlaces.length > 1) {
          let isMultiParams = {
            admin_address: editedAddress,
            place_type: "MULTI",
          };
          let isMulti = await Place.findOne(isMultiParams);
          if (isMulti) {
            let updateMulti = await Place.findOneAndUpdate(
              { _id: isMulti._id },
              {
                $push: { bldg: new ObjectId(createdBuilding._id) },
                $inc: { child: 1 },
              }
            );
          } else {
            // MAIN_ATCH_GB_CD_NM: '주건축물',
            let arr = [];
            isPlaces.forEach((item) => {
              arr.push(new ObjectId(item._id));
            });
            // console.log('Check arr : ', arr)
            if (typeof raw[i].BLD_NM !== "undefined") {
              dongName = raw[i].BLD_NM;
              if (dongName === ".") dongName = "일반건물";
            } else {
              dongName = "일반건물";
            }
            console.log(`Multi : ${dongName}`);

            let createMultiParams = {
              place_name: dongName,
              admin_address: editedAddress,
              place_type: "MULTI",
              place_code: raw[i].MAIN_PURPS_CD, // 장소 type code
              // road_address: onePoi.newAddressList.newAddress.fullAddressRoad, // 도로명주소
              road_address: raw[i].NEW_PLAT_PLC, // 도로명주소
              r_depth_1: onePoi.city_do,
              r_depth_2: onePoi.gu_gun,
              r_depth_3: onePoi.adminDong,
              bldg: arr,
              child: isPlaces.length,
              location: {
                type: "Point",
                coordinates: [lng, lat],
              },
            };
            let createMulti = await Place.create(createMultiParams);
            console.log("Created MUlti : ", createMulti);

            isPlaces.forEach(async (place) => {
              await Place.findOneAndUpdate(
                { _id: place._id },
                { parent_id: new ObjectId(createMulti._id) }
              );
            });
          }
        } // if multiple building And Continue...
      } // if not MGM

      // continue
    } catch (err) {
      console.log(`Iteration ${i} catch block`);
      continue;
      // log("err=", err);
      // res.status(500).json({ msg: RCODE.SERVER_ERROR, data: {} });
    }
  } // For Loop

  res.json({ msg: RCODE.OPERATION_SUCCEED, data: { item: "Done !!!" } });
  // res.json({msg:RCODE.OPERATION_SUCCEED, data:{item:raw[100]}})
}); // to Multi

// Check csv content  +++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++
admin.get("/checkcsvcontent", async (req, res) => {
  try {
    const csvFilePath = "./s49.csv";
    // const csvFilePath = "./part_s50.csv";
    // const csvFilePath = "./part_s51.csv";
    // const csvFilePath = "./part_s52.csv";
    const csv = require("csvtojson");
    let raw = await csv().fromFile(csvFilePath);

    console.log("@@ length ; ", raw.length);

    for (let i = 0; raw.length > i; i++) {
      // for (let i = 0; 1 > i; i++) {
      // for (let i = 232812; 232814 > i; i++) {
      // for (let i = 223113; raw.length > i; i++) {
      // for(let i=1421; 1422>i;i++) {

      let address = raw[i].법정동명 + " " + raw[i].지번;
      // // let ho = raw[i].호명
      // console.log('Address : ', address)
      if (address === "서울특별시 동작구 신대방동 395-69") {
        console.log("i : ", i);
        return;
      }
      // console.log('Address : ', raw[i])
      // console.log('Init previous: ', Object.keys(previous).length)
    }

    res.json({ msg: RCODE.OPERATION_SUCCEED, data: { item: "Done!!" } });
    // res.json({msg:RCODE.OPERATION_SUCCEED, data:{item:raw[100]}})
  } catch (err) {
    log("err=", err);
    res.status(500).json({ msg: RCODE.SERVER_ERROR, data: {} });
  }
}); // Check csv content

// Fix : add force update Place +++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++
admin.get("/fixForceUpdate", async (req, res) => {
  try {
    const csvFilePath = "./part_s49.csv";
    // const csvFilePath = "./part_s50.csv";
    // const csvFilePath = "./part_s51.csv";
    // const csvFilePath = "./part_s52.csv";
    const csv = require("csvtojson");
    let raw = await csv().fromFile(csvFilePath);

    console.log("@@ length ; ", raw.length);

    // for(let i=0; raw.length>i;i++) {
    // for (let i = 0; 1 > i; i++) {
    for (let i = 270826; 278249 > i; i++) {
      // for (let i = 223113; raw.length > i; i++) {
      // for(let i=1421; 1422>i;i++) {
      let address = raw[i].법정동명 + " " + raw[i].지번;
      // is Facility
      let isParams = {
        admin_address: address,
        facility_name: raw[i].호명 + "호",
        bldg_no: raw[i].동명,
        // floor: raw[i].층명,
        no: raw[i].호명,
      };

      let isFacility = await Facility.find(isParams);

      if (isFacility.length === 1) {
        console.log("F : 1");
        // Add to Place  *************************************************************
        let findParams = {
          place_type: "BUILDING",
          admin_address: "서울특별시 동작구 상도동 414",
        };
        // console.log('TYPE : ', raw[i].동명)
        if (raw[i].동명 !== "") findParams.place_name = raw[i].동명 + "동";

        let isPlace = await Place.find(findParams);

        // find Place and is Place : update Place +++++++++++
        if (isPlace.length > 0) {
          console.log("P : ", isPlace.length);
          await Place.updateOne(
            { _id: isPlace[0]._id },
            {
              $push: { possess: new ObjectId(isFacility[0]._id) },
            }
          );
          await Facility.updateOne(
            { _id: isFacility[0]._id },
            { parent_id: new ObjectId(isPlace[0]._id) }
          );
          console.log("Added facility To Place !");

          // There is no Place : Create Place and Update Place
        }
      }
    }

    res.json({ msg: RCODE.OPERATION_SUCCEED, data: { item: "Done!!" } });
    // res.json({msg:RCODE.OPERATION_SUCCEED, data:{item:raw[100]}})
  } catch (err) {
    log("err=", err);
    res.status(500).json({ msg: RCODE.SERVER_ERROR, data: {} });
  }
}); // Fix : add force update Place

// Add Facility to Place noww +++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++
admin.get("/addFacilityToPlace", async (req, res) => {
  try {
    const csvFilePath = "./part_s49.csv";
    // const csvFilePath = "./part_s50.csv";
    // const csvFilePath = "./part_s51.csv";
    // const csvFilePath = "./part_s52.csv";
    const csv = require("csvtojson");
    let raw = await csv().fromFile(csvFilePath);

    console.log("@@ length ; ", raw.length);

    // 동작구 start 223113
    // for(let i=0; raw.length>i;i++) {
    // for (let i = 0; 1 > i; i++) {
    for (let i = 223113; 278249 > i; i++) {
      // for (let i = 223113; raw.length > i; i++) {
      // for(let i=1421; 1422>i;i++) {
      console.log(i);

      let address = raw[i].법정동명 + " " + raw[i].지번;
      // console.log('Address : ', address)
      // console.log('Address : ', raw[i])

      // is Facility
      let isParams = {
        admin_address: address,
        facility_name: raw[i].호명 + "호",
        bldg_no: raw[i].동명,
        // floor: raw[i].층명,
        no: raw[i].호명,
      };

      let isFacility = await Facility.find(isParams);
      // console.log("is Facility ?: ", isFacility.length);

      // if is facility : update facility ++++++++++++++++
      if (isFacility.length > 0) {
        // console.log('Replace Err - isFacility.description : ', isFacility[0].description)
        let prePrice = Number(isFacility[0].description);
        let curPrice = Number(raw[i].기준연도);
        // console.log("curPrice Number : ", curPrice);
        // console.log("prePrice < curPrice: ", prePrice < curPrice);
        if (prePrice < curPrice) {
          let current_price = raw[i].공시가격;
          // console.log("isFacility[0] : ", isFacility[0]);
          // await Facility.updateOne({_id: isFacility[0]._id}, {$set: {current_price: 1000}})
          await Facility.updateOne(
            { _id: isFacility[0]._id },
            { current_price: current_price, description: raw[i].기준연도 }
          );
          // console.log(`Facility Updated...      i:${i}         !!!`)
          // createdFacility = await Facility.findOne({ _id: isFacility[0]._id });
        }
        // if not exists : create Facility +++++++++++++++++
      } else {
        // console.log("Else.....");
        // Create Facility
        let facilityParams = {
          parent_name: raw[i].공동주택명,
          category: raw[i].공동주택구분명,
          facility_name: raw[i].호명 + "호",
          admin_address: address,
          house_code: raw[i].공동주택코드,
          description: raw[i].기준연도,
          bldg_no: raw[i].동명,
          area: raw[i].전용면적,
          floor: raw[i].층명,
          no: raw[i].호명,
          current_price: raw[i].공시가격,
          admin_email: "mothcar@naver.com",
        };
        // console.log("facilityParams : ", facilityParams);
        let createdFacility = await Facility.create(facilityParams);
        // console.log("Create Result : ", createdFacility);
        console.log("Facility Created !");

        // Add to Place  *************************************************************
        let findParams = {
          place_type: "BUILDING",
          admin_address: address,
        };
        // console.log('TYPE : ', raw[i].동명)
        if (raw[i].동명 !== "") findParams.place_name = raw[i].동명 + "동";

        let isPlace = await Place.find(findParams);

        // find Place and is Place : update Place +++++++++++
        if (isPlace.length > 0) {
          console.log("isPlace.length ", isPlace.length);
          await Place.updateOne(
            { _id: isPlace[0]._id },
            {
              $push: { possess: new ObjectId(createdFacility._id) },
            }
          );
          await Facility.updateOne(
            { _id: createdFacility._id },
            { parent_id: new ObjectId(isPlace[0]._id) }
          );
          console.log("Added facility To Place !");

          // There is no Place : Create Place and Update Place
        } else {
          console.log(`No Parent...........??? ${address}`);
        }
      } // ElSE
    }

    res.json({ msg: RCODE.OPERATION_SUCCEED, data: { item: "Done!!" } });
    // res.json({msg:RCODE.OPERATION_SUCCEED, data:{item:raw[100]}})
  } catch (err) {
    // log("err=", err);
    res.status(500).json({ msg: RCODE.SERVER_ERROR, data: {} });
  }
}); // Add Facility to Place

// Add Parent_id to Facility  ++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++
admin.get("/addParentIdToFacility", async (req, res) => {
  try {
    // const csvFilePath = "./part_s51.csv";
    // const csv = require("csvtojson");
    // let raw = await csv().fromFile(csvFilePath);

    // console.log("@@ length ; ", raw.length);

    const nullishs = await Facility.find({ parent_id: null });

    for (let i = 0; nullishs.length > i; i++) {
      let address = nullishs[i].admin_address;
      let parent = await Place.find({ admin_address: address });
      if (parent.length === 1) {
        await Facility.updateOne(
          { _id: nullishs[i]._id },
          { parent_id: new ObjectId(parent[0]._id) }
        );
        await Place.updateOne(
          { _id: parent[0]._id },
          { $push: { possess: new ObjectId(nullishs[i]._id) } }
        );
        console.log(`Facility ${i} : Updated`);
      }
    }

    res.json({ msg: RCODE.OPERATION_SUCCEED, data: { item: "Done!!" } });
    // res.json({msg:RCODE.OPERATION_SUCCEED, data:{item:raw[100]}})
  } catch (err) {
    // log("err=", err);
    res.status(500).json({ msg: RCODE.SERVER_ERROR, data: {} });
  }
}); // checkCsv

// ------------------------------------------------------------------------------------------------------------------
// 대한민국 청와대         ------------------------------------------------------------------------------------------------
// ------------------------------------------------------------------------------------------------------------------
admin.get("/insertHQ", async (req, res) => {
  try {
    // var url = 'https://apis.openapi.sk.com/tmap/geo/convertAddress?version=1&format=json&callback=result'
    var API_KEY = process.env.SK_API_KEY;
    // console.log("Get env : ", API_KEY);

    let poiKeyword = encodeURIComponent("청와대"); // 경남 함양 행복복지센터

    let getPoiApi = `https://apis.openapi.sk.com/tmap/pois?version=1&appKey=${API_KEY}&searchKeyword=${poiKeyword}&searchType=all&searchtypCd=A&page=1&count=5&reqCoordType=WGS84GEO&resCoordType=WGS84GEO&multiPoint=N&poiGroupYn=N`;

    let result = await axios.get(getPoiApi);
    console.log("result : ", result.data.searchPoiInfo.pois.poi[0]);
    // result.data.searchPoiInfo?.pois.poi[0]

    let onePoi = result.data.searchPoiInfo.pois.poi[0];

    // if (typeof result.data.searchPoiInfo?.pois.poi[0] === "undefined") {
    //   poiKeyword = encodeURIComponent(Object.values(raw[i])[7]); // 주소
    //   getPoiApi = `https://apis.openapi.sk.com/tmap/pois?version=1&appKey=${API_KEY}&searchKeyword=${poiKeyword}&searchType=all&searchtypCd=A&page=1&count=5&reqCoordType=WGS84GEO&resCoordType=WGS84GEO&multiPoint=N&poiGroupYn=N`;

    //   result = await axios.get(getPoiApi);
    //   console.log("result : ", result.data.searchPoiInfo);
    //   onePoi = result.data.searchPoiInfo.pois.poi[0];
    // } else {
    //   onePoi = result.data.searchPoiInfo.pois.poi[0];
    // }

    var inputParam = {};
    // var intCode = parseInt(raw[i].기관코드);
    // var intZip = parseInt(Object.values(raw[i])[7]);
    // inputParam.center_code = intCode.toString();
    inputParam.public_type = "0국가_국"; // ['1시도_시','2시도_도','3시군구_시','4시군구_군','5시군구_구','6읍면동_읍','7읍면동_면','8읍면동_동','9읍면동_센터']
    inputParam.place_name = "청와대";
    // inputParam.admin_address = onePoi.newAddressList.newAddress[0].fullAddressRoad;
    inputParam.road_address =
      onePoi.newAddressList.newAddress[0].fullAddressRoad; // raw[i].도로명주소
    inputParam.tel = "";
    inputParam.zip = onePoi.zipCode;
    inputParam.level = 0;
    inputParam.bj_code = "";
    inputParam.r_depth_1 = onePoi.upperAddrName;
    inputParam.r_depth_2 = onePoi.middleAddrName;
    inputParam.r_depth_3 = onePoi.lowerAddrName;
    // inputParam.jibun = onePoi;
    // inputParam.eup_myun = onePoi;
    // inputParam.ri = onePoi;
    // inputParam.admin_id =  ''
    inputParam.admin_name = "";
    inputParam.admin_email = "";
    inputParam.infocenter_level = ""; // tab-1 or tab-2
    inputParam.description = "";

    var lat = Number(onePoi.noorLat);
    var lng = Number(onePoi.noorLon);

    inputParam.location = {
      type: "Point",
      coordinates: [lng, lat],
    };

    console.log("input params : ", inputParam);

    const inputData = await PublicPlace.create(inputParam);
    log("new infocenter reuslt : ", inputData);

    // console.log("onePoi : ", onePoi);

    res.json({ msg: RCODE.OPERATION_SUCCEED, data: { item: "Done!!" } });
    // res.json({msg:RCODE.OPERATION_SUCCEED, data:{item:raw[100]}})
  } catch (err) {
    log("err=", err);
    res.status(500).json({ msg: RCODE.SERVER_ERROR, data: {} });
  }
}); //inserDB

// ------------------------------------------------------------------------------------------------------------------
// 가끔 쓰는 것         ------------------------------------------------------------------------------------------------
// ------------------------------------------------------------------------------------------------------------------

// Create csv 2 failed collect ++++++++++++
admin.get("/editcsv2", async (req, res) => {
  try {
    const csvFilePath = "./part_s49.csv";
    // const csvFilePath = "./part_s50.csv";
    // const csvFilePath = "./part_s51.csv";
    // const csvFilePath = "./part_s52.csv";
    const csv = require("csvtojson");
    let data = await csv().fromFile(csvFilePath);
    const pre = data.map(
      ({
        고유번호,
        법정동코드,
        특수지구분코드,
        특수지구분명,
        기준월,
        공동주택구분코드,
        특수지명,
        데이터기준일자,
        ...keepAttrs
      }) => keepAttrs
    );
    const raw = pre.reverse();
    // const raw = pre

    console.log("@@ length ; ", raw.length);

    let csvContent = [];

    // for(let i=0; raw.length>i;i++) {
    // for (let i = 0; 1 > i; i++) {
    // for (let i = 270826; 278250 > i; i++) {
    // for (let i = 270826; 271850 > i; i++) {
    //   let rawAddress = raw[i].법정동명+' '+raw[i].지번
    //   // console.log('i : ', i)
    //   // 일단 완성된 code +++++++++++++++++++++++++++++++++++++++++++++++++++
    //   // console.log('Init previous: ', Object.keys(previous).length)
    //   let obj
    //   if(csvContent.length === 0) {
    //     obj = raw[i]
    //     // console.log('Obj : ',obj)
    //     csvContent.push(obj)
    //   } else {
    //     console.log(`In  : ${i} ; `)
    //     let pre = Number(raw[i-1].기준연도)
    //     let cur = Number(raw[i].기준연도)
    //     // console.log(cur)
    //     // console.log("cur Number : ", cur);
    //     if (pre === cur) {
    //       obj = raw[i]
    //       csvContent.push(obj)
    //     } else {
    //       continue
    //     }
    //   } // else
    // }

    csvContent = raw.reduce((unique, o) => {
      // if(!unique.some(obj => obj.기준연도 !== o.기준연도 && obj.공시가격 !== o.공시가격)) {
      // 공동주택명,,층명,호명
      if (
        !unique.some(
          (obj) =>
            obj.공동주택명 === o.공동주택명 &&
            obj.동명 === o.동명 &&
            obj.호명 === o.호명
        )
      ) {
        unique.push(o);
      }
      return unique;
    }, []);
    // console.log(result);

    // Create CSV +++++++++++++++++++++++++++++++++++++++++++
    const fs = require("fs");
    var jsonexport = require("jsonexport");

    // console.log('Result : ', csvContent)

    jsonexport(csvContent, function (err, csv) {
      fs.writeFile("a49.csv", csv, function (err) {
        if (err) {
        }
      });
    });

    res.json({ msg: RCODE.OPERATION_SUCCEED, data: { item: "Done!!" } });
    // res.json({msg:RCODE.OPERATION_SUCCEED, data:{item:raw[100]}})
  } catch (err) {
    log("err=", err);
    res.status(500).json({ msg: RCODE.SERVER_ERROR, data: {} });
  }
}); // Create csv 2

// Create csv file failed collect ++++++++++++
admin.get("/editcsv", async (req, res) => {
  try {
    const csvFilePath = "./part_s49.csv";
    // const csvFilePath = "./part_s50.csv";
    // const csvFilePath = "./part_s51.csv";
    // const csvFilePath = "./part_s52.csv";
    const csv = require("csvtojson");
    let raw = await csv().fromFile(csvFilePath);

    console.log("@@ length ; ", raw.length);

    let csvContent = [];

    // for(let i=0; raw.length>i;i++) {
    // for (let i = 0; 1 > i; i++) {
    // for (let i = 270826; 278250 > i; i++) {
    for (let i = 270826; 271850 > i; i++) {
      // 310

      let rawAddress = raw[i].법정동명 + " " + raw[i].지번;
      // console.log('i : ', i)
      // 일단 완성된 code +++++++++++++++++++++++++++++++++++++++++++++++++++
      // console.log('Init previous: ', Object.keys(previous).length)
      let obj;
      if (csvContent.length === 0) {
        obj = raw[i];
        // console.log('Obj : ',obj)
        csvContent.push(obj);
      } else {
        console.log(`In  : ${i} ; `);
        let pre = Number(raw[i - 1].기준연도);
        let cur = Number(raw[i].기준연도);
        // console.log(cur)
        // console.log("cur Number : ", cur);
        if (pre === cur) {
          obj = raw[i];
          csvContent.push(obj);
        } else {
          continue;
        }
      } // else
    }

    // Create CSV +++++++++++++++++++++++++++++++++++++++++++
    const fs = require("fs");
    var jsonexport = require("jsonexport");

    // console.log('Result : ', csvContent)

    jsonexport(csvContent, function (err, csv) {
      fs.writeFile("a49.csv", csv, function (err) {
        if (err) {
        }
      });
    });

    res.json({ msg: RCODE.OPERATION_SUCCEED, data: { item: "Done!!" } });
    // res.json({msg:RCODE.OPERATION_SUCCEED, data:{item:raw[100]}})
  } catch (err) {
    log("err=", err);
    res.status(500).json({ msg: RCODE.SERVER_ERROR, data: {} });
  }
}); // Create csv file

// 4. Create A House with area and price 공시가격DB
admin.get("/createHouse", async (req, res) => {
  try {
    var API_KEY = process.env.SK_API_KEY;
    // console.log("Get env : ", API_KEY);

    const csvFilePath = "./part1.csv";
    const csv = require("csvtojson");
    // const converter = csv({
    //   noheader: true,
    //   // delimiter: '\n',
    //   delimiter: ",",
    // });

    let raw = await csv().fromFile(csvFilePath);
    console.log("@@ length ; ", raw.length);

    // 전국 아파트 단지 18,629개
    // for(let i=0; raw.length>i;i++) {
    // 85936부터 두암그린파크
    for (let i = 85936; 85973 > i; i++) {
      // for(let i=1421; 1422>i;i++) {
      console.log("i : ", i);
      // console.log("raw[i] : ", raw[i]);
      // if(true) continue

      if (raw[i].공동주택명 !== "두암그린파크") continue;

      // let isRecord = await PublicPlace.findOne({center_code:Object.values(raw[i])[0]})
      // console.log('isRecord : ',i+'  '+ isRecord)
      let str1 = raw[i].법정동명;
      let str2 = raw[i].지번;
      let address = str1 + " " + str2;

      // is Facility
      let isParams = {
        // parent_name: raw[i].공동주택명,
        // category: raw[i].공동주택구분명,
        // facility_name: raw[i].공동주택명,
        admin_address: address,
        house_code: raw[i].공동주택코드,
        bldg_no: raw[i].동명,
        // floor: raw[i].층명,
        no: raw[i].호명,
      };

      let isFacility = await Facility.find(isParams);
      let createdFacility = isFacility;
      console.log("isFacility.length : ", isFacility.length);

      if (isFacility.length > 0) {
        // console.log('Replace Err - isFacility.description : ', isFacility[0].description)
        let prePrice = Number(isFacility[0].description.replace(/-/gi, ""));
        let curPrice = Number(raw[i].기준연도.replace(/-/gi, ""));
        // console.log("curPrice Number : ", curPrice);
        // console.log("prePrice < curPrice: ", prePrice < curPrice);
        if (prePrice < curPrice) {
          let current_price = raw[i].공시가격;
          // console.log("isFacility[0] : ", isFacility[0]);
          // await Facility.updateOne({_id: isFacility[0]._id}, {$set: {current_price: 1000}})
          await Facility.updateOne(
            { _id: isFacility[0]._id },
            { current_price: current_price }
          );
          createdFacility = await Facility.findOne({ _id: isFacility[0]._id });
        }
      } else {
        console.log("Else.....");
        // Create Facility
        let facilityParams = {
          parent_name: raw[i].공동주택명,
          category: raw[i].공동주택구분명,
          facility_name: raw[i].호명,
          admin_address: address,
          house_code: raw[i].공동주택코드,
          description: raw[i].기준연도,
          bldg_no: raw[i].동명,
          area: raw[i].전용면적,
          floor: raw[i].층명,
          no: raw[i].호명,
          current_price: raw[i].공시가격,
          admin_email: "mothcar@naver.com",
        };
        // console.log("facilityParams : ", facilityParams);
        createdFacility = await Facility.create(facilityParams);
        // console.log("Create Result : ", createdFacility);
        console.log("Facility Created.............................");
      } // ElSE

      // ***********************************************************************************************************
      // Create Place Building *************************************************************************************
      let isPlace = await Place.find({
        multi_code: "AA" + raw[i].공동주택코드,
        bldg_no: raw[i].동명,
      });
      if (isPlace.length > 0) {
        console.log("isPlace.length ", isPlace.length);
        await Place.updateOne(
          { _id: isPlace[0]._id },
          {
            $push: { possess: new ObjectId(createdFacility._id) },
            $inc: { houses: 1 },
          }
        );
      } else {
        // Create New Place
        var API_KEY = process.env.SK_API_KEY;
        let createKeyword = address + " " + raw[i].공동주택명;
        let poiKeyword = encodeURIComponent(createKeyword);

        let getPoiApi = `https://apis.openapi.sk.com/tmap/pois?version=1&appKey=${API_KEY}&searchKeyword=${poiKeyword}&searchType=all&searchtypCd=A&page=1&count=5&reqCoordType=WGS84GEO&resCoordType=WGS84GEO&multiPoint=N&poiGroupYn=N`;

        let result = await axios.get(getPoiApi);
        // console.log("result 0 : ", result.data.searchPoiInfo.pois.poi[0])

        let onePoi = result.data.searchPoiInfo.pois.poi[0];

        // if (typeof result.data.searchPoiInfo?.pois.poi[0] === "undefined") {
        //   let newKeyword =
        //     raw[i].시도 +
        //     " " +
        //     raw[i].시군구 +
        //     " " +
        //     raw[i].읍면 +
        //     " " +
        //     raw[i].동리 +
        //     " " +
        //     raw[i].단지명;
        //   poiKeyword = encodeURIComponent(newKeyword); //도로명주소는 없는곳이 많음
        //   getPoiApi = `https://apis.openapi.sk.com/tmap/pois?version=1&appKey=${API_KEY}&searchKeyword=${poiKeyword}&searchType=all&searchtypCd=A&page=1&count=5&reqCoordType=WGS84GEO&resCoordType=WGS84GEO&multiPoint=N&poiGroupYn=N`;

        //   result = await axios.get(getPoiApi);
        //   // console.log("result : ", result.data.searchPoiInfo);
        //   onePoi = result.data.searchPoiInfo.pois.poi[0];
        // } else if (
        //   typeof result.data.searchPoiInfo?.pois.poi[0] === "undefined"
        // ) {
        //   poiKeyword = encodeURIComponent(raw[i].도로명주소);
        //   getPoiApi = `https://apis.openapi.sk.com/tmap/pois?version=1&appKey=${API_KEY}&searchKeyword=${poiKeyword}&searchType=all&searchtypCd=A&page=1&count=5&reqCoordType=WGS84GEO&resCoordType=WGS84GEO&multiPoint=N&poiGroupYn=N`;

        //   result = await axios.get(getPoiApi);
        //   // console.log("result : ", result.data.searchPoiInfo);
        //   onePoi = result.data.searchPoiInfo.pois.poi[0];
        // } else {
        //   onePoi = result.data.searchPoiInfo.pois.poi[0];
        // }

        // console.log("onePoi : ", onePoi);

        let placeName = "";
        if (raw[i].동명.length > 0)
          placeName = onePoi.name + " " + raw[i].동명 + "동";
        else placeName = onePoi.name;

        let inputParam = {};
        inputParam.multi_code = "AA" + raw[i].공동주택코드;
        inputParam.place_name = placeName;
        inputParam.place_type = "APARTMENT";
        inputParam.admin_address = address;
        inputParam.road_address =
          onePoi.newAddressList.newAddress.fullAddressRoad;
        inputParam.bldg_no = raw[i].동명;
        inputParam.houses = 1;
        inputParam.r_depth_1 = onePoi.upperAddrName;
        inputParam.r_depth_2 = onePoi.middleAddrName;
        inputParam.r_depth_3 = onePoi.lowerAddrName;
        inputParam.tel = onePoi.telNo;
        // inputParam.jibun = onePoi;
        // inputParam.eup_myun = onePoi;
        // inputParam.ri = onePoi;
        // inputParam.admin_id =  ''
        inputParam.owner_name = "황상익";
        inputParam.owner_email = "mothcar@naver.com";
        inputParam.description = "";
        inputParam.possess = [new ObjectId(createdFacility._id)];

        var lat = Number(onePoi.noorLat);
        var lng = Number(onePoi.noorLon);

        inputParam.location = {
          type: "Point",
          coordinates: [lng, lat],
        };
        let createdPlace = await Place.create(inputParam);
        /*
        parent_id:    
        zip:            raw[i].
        
        */
        let updateParams = {
          parent_name: createdPlace.place_name,
          parent_id: new ObjectId(createdPlace._id),
          r_depth_1: onePoi.upperAddrName,
          r_depth_2: onePoi.middleAddrName,
          r_depth_3: onePoi.lowerAddrName,
          location: {
            type: "Point",
            coordinates: [lng, lat],
          },
        };
        await Facility.updateOne({ _id: createdFacility._id }, updateParams);
        let confirmFacility = await Facility.findOne({
          _id: createdFacility._id,
        }).populate("parent_id");
        console.log("confirmFacility: ", confirmFacility);
        console.log("createdPlace: ", createdPlace);
        // if()
        let isMulti = await Place.find({
          multi_code: "AA" + raw[i].공동주택코드,
          place_type: "MULTI",
        });
        if (isMulti.length > 0) {
          await Place.updateOne(
            { _id: isMulti[0]._id },
            { $addToSet: { bldg: new ObjectId(createdPlace._id) } }
          );
          let updatedplace = await Place.findOne({ _id: isMulti[0]._id });
          console.log("Updated Multi..... : ", updatedplace);
        } else {
          let isAny = await Place.find({
            multi_code: "AA" + raw[i].공동주택코드,
          });
          if (isAny.length > 1) {
            console.log("is any : ", isAny);
            inputParam.place_name = onePoi.name;
            inputParam.place_type = "MULTI";
            inputParam.bldg = [
              new ObjectId(isAny[0]._id),
              new ObjectId(createdPlace._id),
            ];
            inputParam.bldg_no = "";
            inputParam.possess = [];
            let createdMulti = await Place.create(inputParam);
            console.log("Created Multi..... : ", createdMulti);
          }
        }
      }
    } // For Loop

    res.json({ msg: RCODE.OPERATION_SUCCEED, data: { item: "Done !!!" } });
    // res.json({msg:RCODE.OPERATION_SUCCEED, data:{item:raw[100]}})
  } catch (err) {
    log("err=", err);
    res.status(500).json({ msg: RCODE.SERVER_ERROR, data: {} });
  }
}); // 공시지가 for Facility

// 5. 전국 아파트 단지 정보(단지코드, 동수, 세대수)
admin.get("/insertMulti", async (req, res) => {
  try {
    let API_KEY = process.env.SK_API_KEY;
    // console.log("Get env : ", API_KEY);

    const csvFilePath = "./multi_basic.csv";
    const csv = require("csvtojson");
    const converter = csv({
      noheader: true,
      // delimiter: '\n',
      delimiter: ",",
    });

    let raw = await csv().fromFile(csvFilePath);

    console.log("@@ length ; ", raw.length);

    // 전국 아파트 단지 18,629개
    // 전체 작업 50분 소요
    // 12914 14438 14525 15069 16166 16711 17115 18080 18213 18505
    // for(let i=0; raw.length>i;i++) {
    for (let i = 12914; 12915 > i; i++) {
      // for(let i=1421; 1422>i;i++) {
      console.log("i : ", i);

      // let isRecord = await PublicPlace.findOne({center_code:Object.values(raw[i])[0]})
      // console.log('isRecord : ',i+'  '+ isRecord)

      let createKeyword = raw[i].법정동주소;

      let poiKeyword = encodeURIComponent(createKeyword);

      // console.log("raw[i] : ", raw[i]);

      let getPoiApi = `https://apis.openapi.sk.com/tmap/pois?version=1&appKey=${API_KEY}&searchKeyword=${poiKeyword}&searchType=all&searchtypCd=A&page=1&count=5&reqCoordType=WGS84GEO&resCoordType=WGS84GEO&multiPoint=N&poiGroupYn=N`;

      let result = await axios.get(getPoiApi);
      // console.log("result 0 : ", result.data.searchPoiInfo.pois.poi[0])
      // console.log("tel nember : ", raw[i].관리사무소연락처)
      // if(typeof result.data.searchPoiInfo?.pois === "undefined") continue

      let onePoi;

      if (typeof result.data.searchPoiInfo.pois.poi[0] === "undefined") {
        let newKeyword =
          raw[i].시도 +
          " " +
          raw[i].시군구 +
          " " +
          raw[i].읍면 +
          " " +
          raw[i].동리 +
          " " +
          raw[i].단지명;
        poiKeyword = encodeURIComponent(newKeyword); //도로명주소는 없는곳이 많음
        getPoiApi = `https://apis.openapi.sk.com/tmap/pois?version=1&appKey=${API_KEY}&searchKeyword=${poiKeyword}&searchType=all&searchtypCd=A&page=1&count=5&reqCoordType=WGS84GEO&resCoordType=WGS84GEO&multiPoint=N&poiGroupYn=N`;

        result = await axios.get(getPoiApi);
        // console.log("result : ", result.data.searchPoiInfo);
        onePoi = result.data.searchPoiInfo.pois.poi[0];
      } else if (typeof result.data.searchPoiInfo.pois.poi[0] === "undefined") {
        poiKeyword = encodeURIComponent(raw[i].도로명주소);
        getPoiApi = `https://apis.openapi.sk.com/tmap/pois?version=1&appKey=${API_KEY}&searchKeyword=${poiKeyword}&searchType=all&searchtypCd=A&page=1&count=5&reqCoordType=WGS84GEO&resCoordType=WGS84GEO&multiPoint=N&poiGroupYn=N`;

        result = await axios.get(getPoiApi);
        // console.log("result : ", result.data.searchPoiInfo);
        onePoi = result.data.searchPoiInfo.pois.poi[0];
      } else {
        onePoi = result.data.searchPoiInfo.pois.poi[0];
      }

      // console.log("onePoi : ", onePoi);

      let removeComma = raw[i].세대수.replace(",", "");
      let oriAddress = raw[i].법정동주소.split(" ");
      let address;
      if (oriAddress.length === 4)
        address = oriAddress[0] + oriAddress[1] + oriAddress[2] + oriAddress[3];
      else
        address =
          oriAddress[0] +
          oriAddress[1] +
          oriAddress[2] +
          oriAddress[3] +
          oriAddress[4];

      var inputParam = {};
      inputParam.multi_code = raw[i].단지코드;
      inputParam.place_name = raw[i].단지명;
      inputParam.place_type = "MULTI";
      inputParam.admin_address = address;
      inputParam.road_address = raw[i].도로명주소; // raw[i].도로명주소
      inputParam.tel = raw[i].관리사무소연락처;
      inputParam.a_type = raw[i].분양형태;
      inputParam.child = raw[i].동수;
      inputParam.houses = removeComma;
      inputParam.zip = onePoi.zipCode;
      inputParam.bj_code = "";
      inputParam.r_depth_1 = onePoi.upperAddrName;
      inputParam.r_depth_2 = onePoi.middleAddrName;
      inputParam.r_depth_3 = onePoi.lowerAddrName;
      // inputParam.jibun = onePoi;
      // inputParam.eup_myun = onePoi;
      // inputParam.ri = onePoi;
      // inputParam.admin_id =  ''
      inputParam.owner_name = "황상익";
      inputParam.owner_email = "mothcar@naver.com";
      inputParam.description = "";

      var lat = Number(onePoi.noorLat);
      var lng = Number(onePoi.noorLon);

      inputParam.location = {
        type: "Point",
        coordinates: [lng, lat],
      };

      const inputData = await Place.create(inputParam);
      log("new Place reuslt : ", inputData);
    }

    res.json({ msg: RCODE.OPERATION_SUCCEED, data: { item: "Done!!" } });
    // res.json({msg:RCODE.OPERATION_SUCCEED, data:{item:raw[100]}})
  } catch (err) {
    // log("err=", err);
    res.status(500).json({ msg: RCODE.SERVER_ERROR, data: {} });
  }
}); //inser Multi

//--------------------------------------------------
// crawling  functions
//--------------------------------------------------
admin.get("/getCSVss", async (req, res) => {
  try {
    // const fs = require("fs");
    // csv = fs.readFileSync("./sejong_price.csv");

    const csvFilePath = "./gj.csv";
    const csv = require("csvtojson");
    const converter = csv({
      noheader: true,
      // delimiter: '\n',
      delimiter: ",",
    });

    let raw = await csv().fromFile(csvFilePath);

    // const array = csv.toString().split("\n");
    console.log("Lines : ", raw[0]);

    res.json({ msg: RCODE.OPERATION_SUCCEED, data: { item: "Good~~~" } });
  } catch (err) {
    log("err=", err);
    res.status(500).json({ msg: RCODE.SERVER_ERROR, data: {} });
  }
});

// useless : General Building Info
admin.get("/getGong", async (req, res) => {
  try {
    console.log("Start........");
    const csvFilePath = "./part7_gs.csv";
    const csv = require("csvtojson");
    //   const converter = csv({
    //     noheader: true,
    //     // delimiter: '\n',
    //     delimiter: ",",
    //   });

    let raw = await csv().fromFile(csvFilePath);

    console.log("@@ length ; ", raw.length);

    let tempAddress = "";
    let tempYear = 0;
    let count = 0;
    // 전국 아파트 단지 18,629개
    // for(let i=0; raw.length>i;i++) {
    for (let i = 0; 20 > i; i++) {
      // for(let i=1421; 1422>i;i++) {
      console.log("i : ", i);
      // console.log('raw[i] : ', raw[i])

      let str1 = raw[i].법정동명;
      let str2 = raw[i].지번;

      let regex = /[.,'"\s]/g;
      // console.log("year : ", year);

      let now = raw[i];
      if (count === 0) {
        tempAddress = str1 + " " + str2;
      }
      if (
        tempAddress === raw[i].법정동명 + " " + raw[i].지번 &&
        tempYear < Number(raw[i].기준연도.replace(regex, ""))
      ) {
        tempYear = Number(raw[i].기준연도.replace(regex, ""));

        console.log("raw[i] : ", raw[i]);
      } else {
        console.log("raw[i-1] : ", raw[i - 1]);
        count = 0;
      }
    }

    res.json({ msg: RCODE.OPERATION_SUCCEED, data: { item: "Done!!" } });
    // res.json({msg:RCODE.OPERATION_SUCCEED, data:{item:raw[100]}})
  } catch (err) {
    // log("err=", err);
    res.status(500).json({ msg: RCODE.SERVER_ERROR, data: {} });
  }
}); // General Building Info

// *****************************************************
// Admin insert DB
// *****************************************************

// import DB INIT

admin.get("/insertDb", async (req, res) => {
  try {
    log("test req.body= :", req.body);

    const fetch = require("node-fetch");
    // var url = 'https://apis.openapi.sk.com/tmap/geo/convertAddress?version=1&format=json&callback=result'
    var API_KEY = process.env.SK_API_KEY;

    var newData = [];

    const csvFilePath = "./admini2021.csv";
    const csv = require("csvtojson");
    const converter = csv({
      noheader: true,
      // delimiter: '\n',
      delimiter: ",",
    });

    let raw = await csv().fromFile(csvFilePath);

    // raw.forEach(row=>{
    //   // console.log('raw : ', );
    // })

    // for(var i=0; data.length>i;i++){
    //
    //   // console.log('## bStart : ', bStart)
    //
    //   data[i].options =
    //     {
    //       a: {name: fullString.slice(0, bStart-1), userRes:'(A)'},
    //       b: {name: fullString.slice(bStart-1, cStart-1), userRes:'(B)'} ,
    //       c: {name: fullString.slice(cStart-1, dStart-1), userRes:'(C)'} ,
    //       d: {name: fullString.slice(dStart-1, fullLength), userRes:'(D)'}
    //     }
    // } // for

    // const forLoop = async _ => {
    //   console.log('Start')
    //
    //   for (let index = 0; index < fruitsToGet.length; index++) {
    //     const fruit = fruitsToGet[index]
    //     const numFruit = await getNumFruit(fruit)
    //     console.log(numFruit)
    //   }
    //
    //   console.log('End')
    // } // forLoop

    console.log("@@ length ; ", raw.length);

    // 12,649여개를 불러오면 limit 에 걸릴까봐 일부러 적은 수를 Loop test하기위해 조정 : 3610까지 0개이고 이후로 10씩 증가했는데 3개 나옴
    // 3615
    // for(var i=0; raw.length>i;i++) {
    for (var i = 0; 3900 > i; i++) {
      // for(var i=0; 3>i;i++) {
      var list = [
        "1시도_시",
        "2시도_도",
        "3시군구_시",
        "4시군구_군",
        "5시군구_구",
        "6읍면동_읍",
        "7읍면동_면",
        "8읍면동_동",
        "9읍면동_센터",
      ];
      var check = raw[i].유형_2;

      if (list.includes(check)) {
        // newData.push(Object.values(raw[i])[8])
        // newData.push(raw[i])
        // console.log('@@@ start')
        // console.log('@@@ adress : ', Object.values(raw[i])[8])

        var params = "&appKey=" + API_KEY;
        params = params + "&searchTypCd=" + "NtoO";
        params =
          params + "&reqAdd=" + encodeURIComponent(Object.values(raw[i])[8]);

        await fetch(
          `https://api2.sktelecom.com/tmap/geo/convertAddress?version=1&format=json&callback=result` +
            params,
          {
            headers: {
              Authorization: `${API_KEY}`,
            },
          }
        )
          .then((response) => response.json())
          .then((json) => {
            // 받은 json으로 기능 구현
            newData.push(json);

            var inputParam = {};
            var intCode = parseInt(raw[i].기관코드);
            var intZip = parseInt(Object.values(raw[i])[7]);
            inputParam.center_code = intCode.toString();
            inputParam.type = raw[i].유형_2;
            inputParam.name = raw[i].최하위기관명;
            inputParam.full_address = json.ConvertAdd.primary;
            inputParam.road_address = Object.values(raw[i])[8];
            inputParam.tel = raw[i].대표전화번호;
            inputParam.zip = intZip.toString();
            inputParam.bjcode = "";
            inputParam.floor = "";
            inputParam.place_type = "";
            inputParam.r_depth_1 = "";
            inputParam.r_depth_2 = "";
            inputParam.r_depth_3 = "";
            // inputParam.admin_id =  ''
            inputParam.admin_name = "";
            inputParam.infocenter_level = ""; // tab-1 or tab-2
            inputParam.description = "";
            inputParam.image = "";

            // var pre_lat = json.ConvertAdd.newAddressList.newAddress[0].newLat
            var pre_lat = json.ConvertAdd.oldLat;
            var lat = Number(pre_lat);
            // var pre_lng = json.ConvertAdd.newAddressList.newAddress[0].newLon
            var pre_lng = json.ConvertAdd.oldLon;
            var lng = Number(pre_lng);

            inputParam.location = {
              type: "Point",
              coordinates: [lng, lat],
            };

            // find if no
            Infocenter.create(inputParam).then((result) => {
              // log('new infocenter reuslt : ', result)
            });
          })
          .catch(function () {
            console.log("@@ No insert : ", Object.values(raw[i])[8]);
          }); // end of then
      } // end of if
    }

    res.json({ msg: RCODE.OPERATION_SUCCEED, data: { item: newData } });
    // res.json({msg:RCODE.OPERATION_SUCCEED, data:{item:raw[100]}})
  } catch (err) {
    log("err=", err);
    res.status(500).json({ msg: RCODE.SERVER_ERROR, data: {} });
  }
}); //inserDB

//GET ADDRESS by Fetch TEST
admin.get("/getAddre", async (req, res) => {
  try {
    log("test req.body= :", req.body);

    const fetch = require("node-fetch");
    // var url = 'https://apis.openapi.sk.com/tmap/geo/convertAddress?version=1&format=json&callback=result'
    var API_KEY = process.env.SK_API_KEY;

    var newData = [];

    var params = "&appKey=" + API_KEY;
    params = params + "&searchTypCd=" + "NtoO";
    params =
      params +
      "&reqAdd=" +
      encodeURIComponent("강원도 평창군 미탄면 청옥산1길");

    await fetch(
      `https://api2.sktelecom.com/tmap/geo/convertAddress?version=1&format=json&callback=result` +
        params,
      {
        headers: {
          Authorization: `${API_KEY}`,
        },
      }
    )
      .then((response) => response.json())
      .then((json) => {
        // 받은 json으로 기능 구현
        newData.push(json);
      })
      .catch(function () {
        console.log("error");
      }); // end of then

    res.json({ msg: RCODE.OPERATION_SUCCEED, data: { item: newData } });
    // res.json({msg:RCODE.OPERATION_SUCCEED, data:{item:raw[100]}})
  } catch (err) {
    log("err=", err);
    res.status(500).json({ msg: RCODE.SERVER_ERROR, data: {} });
  }
}); //by fetch

//GET ADDRESS by Fetch TEST
admin.get("/getAddressByRequest", async (req, res) => {
  try {
    log("test req.body= :", req.body);

    const request = require("request");
    // var url = 'https://apis.openapi.sk.com/tmap/geo/convertAddress?version=1&format=json&callback=result'
    var API_KEY = process.env.SK_API_KEY;

    var newData = [];

    var params = "&appKey=" + API_KEY;
    params = params + "&searchTypCd=" + "NtoO";
    params =
      params +
      "&reqAdd=" +
      encodeURIComponent("강원도 평창군 미탄면 청옥산1길 1");

    // var result = await request(`https://api2.sktelecom.com/tmap/geo/convertAddress?version=1&format=json&callback=result`+params, {
    //   headers: {
    //     Authorization: `${API_KEY}`
    //   }
    // })
    // await fetch(`https://api2.sktelecom.com/tmap/geo/convertAddress?version=1&format=json&callback=result`+params, {
    //   headers: {
    //     Authorization: `${API_KEY}`
    //   }
    // })

    var req = {
      host:
        "https://api2.sktelecom.com/tmap/geo/convertAddress?version=1&format=json&callback=result" +
        params,
      path: "",
      method: "GET",
      headers: {
        Authorization: `${API_KEY}`,
      },
    };
    request(req, callback);
    function callback(error, response, body) {
      console.log("@@@ RESult : ", response);
    }

    // console.log('@@@ RESult : ', result)
    // .then(response => response.json())
    // .then(json => {
    //    // 받은 json으로 기능 구현
    //    newData.push(json)
    // })
    // .catch(function() {
    //     console.log("error");
    // })  // end of then

    res.json({ msg: RCODE.OPERATION_SUCCEED, data: { item: newData } });
    // res.json({msg:RCODE.OPERATION_SUCCEED, data:{item:raw[100]}})
  } catch (err) {
    log("err=", err);
    res.status(500).json({ msg: RCODE.SERVER_ERROR, data: {} });
  }
}); //by request

admin.get("/dic", async (req, res) => {
  try {
    // *******************************************************
    // #1 GET Word
    // *******************************************************
    log("test req.body= :", req.query);
    // client param
    let c_word = req.query.word;
    // dictionary object
    let dic_word = dictionary;

    // *******************************************************
    // #2 find keyword by Dictionary
    // *******************************************************
    // good person
    let isWord = dic_word.good.includes(c_word);

    // let a = "개발자 vue 그룹";
    // let b = "vue 개발자 모임 javascript";
    // let a = ['개발자', 'vue', '그룹', 'list'];
    // let b = ['vue', 'list', '개발자', '모임', 'javascript'];
    let aa = "개발자 vue js 그룹";
    let bb = "vue list 개발자 모임 ";
    let a = aa.split(" ");
    let b = bb.split(" ");

    // const pr = a.some(r=> b.includes(r))
    var pr = [];
    const found = a.some((r) => {
      if (b.indexOf(r) >= 0) pr += r;
      // if(b.includes(r)) pr += r
    });

    // console.log('@@ Pr: ', pr)

    // Extract english
    const regex = /[a-zA-Z0-9]{1,}/gm;
    const str = `vue js 그룹`;
    let m;

    while ((m = regex.exec(str)) !== null) {
      // This is necessary to avoid infinite loops with zero-width matches
      if (m.index === regex.lastIndex) {
        regex.lastIndex++;
      }

      // The result can be accessed through the `m`-variable.
      m.forEach((match, groupIndex) => {
        // console.log(`Found match, group ${groupIndex}: ${match}`);
        pr += match;
      });
    }

    console.log("@@ Pr: ", pr);

    // End of Logic *******************************************************
    // #3 rerurn Result
    // *******************************************************
    res.json({ msg: RCODE.OPERATION_SUCCEED, data: { item: pr } });
  } catch (err) {
    log("err=", err);
    res.status(500).json({ msg: RCODE.SERVER_ERROR, data: {} });
  }
}); // dic()

module.exports = admin;
