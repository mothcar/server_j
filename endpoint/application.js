"use strict";

const faker = require("faker");
const express = require("express");
const xlsx = require("xlsx");
const application = express.Router({});
const dateFormat = require("dateformat");
const policy = require("../helper/sharing_policy.js");
const tms = require("../helper/tms");
const { ObjectId } = require('mongodb');

//--------------------------------------------------
// Default Boiler Function 2022
//--------------------------------------------------

/*
직업의 종류 

최상위    God       하인 hain 
국가상위  president  중인 servant 
판사     Judge     양심관 conscience
*/

application.post("/saveApply", async (req, res) => {
  log('saveApply : req.query :', req.body)
  try {
    let qry = req.body;

    const accessKey = req.body.accessKey;
    var user_info = tms.jwt.verify(accessKey, TOKEN.SECRET);
    var user_id = user_info._id;
    // console.log('User Info by Token : ', user_info)
    if (user_info.email == qry.email) {
      await Users.findOneAndUpdate(
        { _id: user_id },
        { $set: { name: qry.user_name } }
      );
      qry.user_id = user_id;
      qry.job_code = JOB_LEVEL[qry.job_code];
      qry.job_name = JOB_NAME[qry.job_code];
      qry.title = JOB_NAME[qry.job_code];
      qry.center_id = new ObjectId(qry.center_id);
      // console.log('User Info by Token : ', user_info)
      let apply = await Application.create(qry);
      await Users.findOneAndUpdate({_id:user_id}, {$push:{user_img: qry.user_img}})
      log("apply : ", apply);
      res.json({ msg: RCODE.OPERATION_SUCCEED, data: { item: apply } });
    } else {
      res.json({ msg: RCODE.EMAIL_NOT_FOUND, data: { item: 422 } });
    }
  } catch (err) {
    log("err=", err);
    res.json({
      msg: RCODE.SERVER_ERROR,
      data: { item: { msg: "이미 존재하는 이메일입니다." } },
    });
  }
});

// isUpdateMine
application.get("/isUpdateMine", async (req, res) => {
  // log('getOneMulti : req.query :', req.query)
  try {
    let qry = req.query;

    const accessKey = qry.accessKey;
    var user_info = tms.jwt.verify(accessKey, TOKEN.SECRET);
    var user_id = user_info._id;
    console.log("User Info by Token : ", user_id);
    let apply = await Application.findOne({
      user_id: user_id,
      user_confirm: false,
      apply_confirm: true,
      denied: false,
    }); //
    console.log("isApply : ", apply);
    if (apply) {
      await Users.findOneAndUpdate(
        { _id: user_id },
        { $push: { job: new ObjectId(apply._id) } }
      );
      await Application.findOneAndUpdate(
        { _id: apply._id },
        { $set: { user_confirm: true } }
      );
    }
    let userJob = await Users.findOne({ _id: user_id }).populate("job");
    // log("user : ", user);
    res.json({ msg: RCODE.OPERATION_SUCCEED, data: { item: userJob.job } });
  } catch (err) {
    log("err=", err);
    res.json({
      msg: RCODE.SERVER_ERROR,
      data: { item: { msg: "이미 존재하는 이메일입니다." } },
    });
  }
});

application.get("/getMyJob", async (req, res) => {
  log("getMyJob : req.query :", req.query);
  try {
    let qry = req.query;
    const accessKey = qry.accessKey;
    var user_info = tms.jwt.verify(accessKey, TOKEN.SECRET);
    var user_id = user_info._id;
    console.log("User Info by Token : ", user_id);
    const myJob = qry.job_code; //"DEPTH_1_CHIEF"
    const findParams = {
      // r_depth_1: qry.r_depth_1,
      apply_confirm: false,
      denied: false,
    };
    let user = await Users.findOne({ _id: user_id }).populate("job");
    let job = user.job[0];
    console.log("Job : ", job);
    let jobCode = job.job_code;
    if(jobCode =='DEPTH_3_CHIEF') return res.json({ msg: RCODE.OPERATION_SUCCEED, data: { item: [] } });
    if (jobCode == "SERVANT" ||jobCode == "SUPER") {
      findParams.job_code = {
        $in: [
          "VICE_SERVANT",
          "DEPTH_1_CHIEF",
          "DEPTH_2_CHIEF",
          "DEPTH_3_CHIEF",
        ],
      };
    } else if (jobCode == "VICE_SERVANT") {
      findParams.job_code = {
        $in: ["DEPTH_1_CHIEF", "DEPTH_2_CHIEF", "DEPTH_3_CHIEF"],
      };
    } else if (jobCode == "DEPTH_1_CHIEF") {
      findParams.r_depth_1 = qry.r_depth_1
      findParams.job_code = { $in: ["DEPTH_2_CHIEF", "DEPTH_3_CHIEF"] };
    } else if (jobCode == "DEPTH_2_CHIEF") {
      findParams.r_depth_1 = qry.r_depth_1
      findParams.job_code = "DEPTH_3_CHIEF";
    }
    console.log("findParams : ", findParams);

    let apply = await Application.find(findParams); //
    // console.log("apply : ", apply);
    // log("user : ", user);
    res.json({ msg: RCODE.OPERATION_SUCCEED, data: { item: apply } });
  } catch (err) {
    log("err=", err);
    res.json({
      msg: RCODE.SERVER_ERROR,
      data: { item: { msg: "리스트가 없음" } },
    });
  }
});

application.post("/accept", async (req, res) => {
  // log('getOneMulti : req.query :', req.query)
  try {
    let qry = req.body;
    const accessKey = req.body.accessKey;
    var user_info = tms.jwt.verify(accessKey, TOKEN.SECRET);
    var user_id = user_info._id;
    console.log('User Info by Token : ', user_info)
    if(user_info.role=='USER') return res.json({ msg: RCODE.EMAIL_NOT_FOUND, data: { item: 422 } });
    if (user_info) { 
      let accept = await Application.findOneAndUpdate( { _id: qry._id }, { $set: { apply_confirm: true } } );
      log("accept : ", accept);
      await Users.findOneAndUpdate( { _id: qry.user_id }, { $push: { job: new ObjectId(accept._id) }, role: "ADMINIST" } );
      await PublicPlace.findOneAndUpdate({_id:accept.center_id}, {$push:{admin_id: qry.user_id}})
      const findParams = {
        apply_confirm: false,
        denied: false,
      };
      let user = await Users.findOne({ _id: user_id }).populate("job");
      // let len = user.job.length-1
      let job = user.job[0];
      // console.log('JOB : ', job)
      let jobCode = job.job_code;
      if (jobCode == "SERVANT" ||jobCode == "SUPER") {
        findParams.job_code = {
          $in: [
            "VICE_SERVANT",
            "DEPTH_1_CHIEF",
            "DEPTH_2_CHIEF",
            "DEPTH_3_CHIEF",
          ],
        };
      } else if (jobCode == "VICE_SERVANT") {
        findParams.job_code = {
          $in: ["DEPTH_1_CHIEF", "DEPTH_2_CHIEF", "DEPTH_3_CHIEF"],
        };
      } else if (jobCode == "DEPTH_1_CHIEF") {
        findParams.r_depth_1 = qry.r_depth_1
        findParams.job_code = { $in: ["DEPTH_2_CHIEF", "DEPTH_3_CHIEF"] };
      } else if (jobCode == "DEPTH_2_CHIEF") {
        findParams.r_depth_1 = qry.r_depth_1
        findParams.job_code = "DEPTH_3_CHIEF";
      }

      let applies = await Application.find(findParams); //
      res.json({ msg: RCODE.OPERATION_SUCCEED, data: { item: applies } });
    } else {
      res.json({ msg: RCODE.EMAIL_NOT_FOUND, data: { item: 422 } });
    }
  } catch (err) {
    log("err=", err);
    res.json({
      msg: RCODE.SERVER_ERROR,
      data: { item: { msg: "이상이 있습니다." } },
    });
  }
});

application.post("/deny", async (req, res) => {
  // log('getOneMulti : req.query :', req.query)
  try {
    let qry = req.body;
    /*
          _id: this.work._id,
          deny_reason: this.denyReason,
    */

    const accessKey = req.body.accessKey;
    var user_info = tms.jwt.verify(accessKey, TOKEN.SECRET);
    var user_id = user_info._id;
    // console.log('User Info by Token : ', user_info)
    if (user_info) {
      let denied = await Application.findOneAndUpdate(
        { _id: qry._id },
        {
          $set: {
            deny_reason: qry.deny_reason,
            apply_confirm: true,
            denied: true,
          },
        }
      );
      log("denied : ", denied);

      const findParams = {
        r_depth_1: qry.r_depth_1,
        apply_confirm: false,
        denied: false,
      };
      let user = await User.findOne({ _id: user_id }).populate("job");
      let job = user.job[0];
      let jobCode = job.job_code;
      if (jobCode == "SERVANT") {
        findParams.job_code = {
          $in: [
            "VICE_SERVANT",
            "DEPTH_1_CHIEF",
            "DEPTH_2_CHIEF",
            "DEPTH_3_CHIEF",
          ],
        };
      } else if (jobCode == "VICE_SERVANT") {
        findParams.job_code = {
          $in: ["DEPTH_1_CHIEF", "DEPTH_2_CHIEF", "DEPTH_3_CHIEF"],
        };
      } else if (jobCode == "DEPTH_1_CHIEF") {
        findParams.job_code = { $in: ["DEPTH_2_CHIEF", "DEPTH_3_CHIEF"] };
      } else if (jobCode == "DEPTH_2_CHIEF") {
        findParams.job_code = "DEPTH_3_CHIEF";
      }

      let applies = await Application.find(findParams); //
      res.json({ msg: RCODE.OPERATION_SUCCEED, data: { item: applies } });
    } else {
      res.json({ msg: RCODE.EMAIL_NOT_FOUND, data: { item: 422 } });
    }
  } catch (err) {
    log("err=", err);
    res.json({
      msg: RCODE.SERVER_ERROR,
      data: { item: { msg: "이상이 있습니다." } },
    });
  }
});

application.get("/getChiefByCenterId", async (req, res) => {
  //
  try {
    let qry = req.query;
    // log('getChiefByCenterId :', qry)
    
    if(qry.accessKey) {
      const accessKey = qry.accessKey;
      var user_info = tms.jwt.verify(accessKey, TOKEN.SECRET);
      var user_id = user_info._id;
      console.log("User Info by Token : ", user_id);
    }
    
    let result = await Application.find({
      center_id: qry._id,
      apply_confirm: true,
      denied: false,
    }).populate("center_id");
    // console.log("getChiefByCenterId : ", result);
    res.json({ msg: RCODE.OPERATION_SUCCEED, data: { item: result } });
  } catch (err) {
    log("err=", err);
    res.json({
      msg: RCODE.SERVER_ERROR,
      data: { item: { msg: "이미 존재하는 이메일입니다." } },
    });
  }
});

application.post("/dismiss", async (req, res) => {
  // log('getOneMulti : req.query :', req.query)
  try {
    let qry = req.body;
    const accessKey = qry.accessKey;
    var user_info = tms.jwt.verify(accessKey, TOKEN.SECRET);
    var user_id = user_info._id;
    var user_email = user_info.email;
    console.log('User Info by Token : ', user_info)
    if (user_email=='mothcar@naver.com' || user_email=='davidh05@gmail.com') {
      await Users.findOneAndUpdate(
        { _id: qry.chiefId },
        { $set: { role: "USER", job: [] } }
      );
      await Application.findOneAndUpdate(
        { user_id: qry.chiefId },
        { $set: { denied: true } }
      );

      let user = await Users.findOne({ _id: qry.chiefId }).populate("job");

      res.json({ msg: RCODE.OPERATION_SUCCEED, data: { item: user } });
    } else {
      res.json({ msg: RCODE.OPERATION_SUCCEED, data: { item: 404 } });
    }
  } catch (err) {
    log("err=", err);
    res.json({
      msg: RCODE.SERVER_ERROR,
      data: { item: { msg: "이상이 있습니다." } },
    });
  }
});

//--------------------------------------------------
// Admin Force
//--------------------------------------------------
application.post("/forceInsertJob", async (req, res) => {
  // log('getOneMulti : req.query :', req.query)
  try {
    let qry = req.body;

    const accessKey = req.body.accessKey;
    var user_info = tms.jwt.verify(accessKey, TOKEN.SECRET);
    var user_id = user_info._id;
    console.log("User Info by Token : ", user_info);
    if (user_info.email == "mothcar@naver.com") {
      const user = await Users.findOne({ email: qry.email });
      await Users.findOneAndUpdate(
        { _id: user._id },
        { $set: { name: qry.user_name } }
      );
      const center = await PublicPlace.findOne({public_type: "0국가_국"})
      qry.idx = "0";
      qry.job_code = JOB_LEVEL[qry.job_code];
      qry.job_name = JOB_NAME[qry.job_code];
      qry.user_id = user._id;
      qry.apply_confirm = true;
      qry.center_id = new ObjectId(center._id);
      let apply = await Application.create(qry);
      await PublicPlace.findOneAndUpdate({_id: center._id}, {$push:{admin_id: user_id}})
      log("apply : ", apply);
      res.json({ msg: RCODE.OPERATION_SUCCEED, data: { item: apply } });
    } else {
      res.json({ msg: RCODE.EMAIL_NOT_FOUND, data: { item: 422 } });
    }
  } catch (err) {
    log("err=", err);
    res.json({
      msg: RCODE.SERVER_ERROR,
      data: { item: { msg: "이미 존재하는 이메일입니다." } },
    });
  }
});

application.post("/createObsolete", async (req, res) => {
  // log('getOneMulti : req.query :', req.query)
  try {
    let qry = req.body;
    console.log("Create Qry : ", qry)

    // const accessKey = req.body.accessKey;
    // var user_info = tms.jwt.verify(accessKey, TOKEN.SECRET);
    // var user_id = user_info._id;
    // console.log("User Info by Token : ", user_info);

    if (true) {
      let user 
      let str = qry.user_img;

      if (qry.idx == '1' || qry.idx == '3') {
        const hash = new Date().getTime() + Math.random();

        const createUserParams = {
          name: qry.user_name,
          email: hash,
          user_img: qry.user_img,
          obsolete_wiki: qry.obsoleteWiki,
          isVerifiedEmail: false,
          waiting: true,
        };
        console.log("createObsolete Qry : ", qry);

        user = await Users.create(createUserParams);
      } 

      let userId 
      if(qry.user_id) userId = qry.user_id
      else userId = user._id

      let params = {
        idx: qry.idx,
        user_id: userId,
        center_id: qry.center_id,
        user_name: qry.user_name,
        title: qry.title,
        user_img: qry.user_img,
        r_depth_1: qry.r_depth_1,
        r_depth_2: qry.r_depth_2,
        r_depth_3: qry.r_depth_3,
      };
      params.obsolete = true;
      params.apply_confirm = true;

      const obsolete = await Application.create(params);
      log("obsolete : ", obsolete);
      res.json({ msg: RCODE.OPERATION_SUCCEED, data: { item: obsolete } });
    } else {
      console.log('신청할 권한이 없음 ')
    }
  } catch (err) {
    log("err=", err);
    res.json({
      msg: RCODE.SERVER_ERROR,
      data: { item: { msg: "Obsolete Error......." } },
    });
  }
});

module.exports = application;
