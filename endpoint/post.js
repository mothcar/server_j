"use strict";

const faker = require("faker");
const express = require("express");
const xlsx = require("xlsx");
const post = express.Router({});
const dateFormat = require("dateformat");
const policy = require("../helper/sharing_policy.js");
const _ = require("lodash");
const tms = require("../helper/tms");
const { ObjectId } = require("mongodb");
const getBankUrl = BANK_URL + "/ledger/findUserRecord";
const postBankurl = BANK_URL + "/ledger/insertRecord";
const common = require("../helper/common");

//--------------------------------------------------
// Default Boiler Function 2022
//--------------------------------------------------

post.get("/name", async (req, res) => {
  log("name req.query :", req.query);

  try {
    let qry = req.query;
    res.json({ msg: RCODE.OPERATION_SUCCEED, data: { item: post } });
  } catch (err) {
    log("err=", err);
    res.status(500).json({ msg: RCODE.SERVER_ERROR, data: {} });
  }
});

post.post("/name", async (req, res) => {
  log("req.body :", req.body);

  try {
    let qry = req.body;
    res.json({ msg: RCODE.OPERATION_SUCCEED, data: { item: post } });
  } catch (err) {
    log("err=", err);
    res.status(500).json({ msg: RCODE.SERVER_ERROR, data: {} });
  }
});

post.post("/createContent", async (req, res) => {
  log("req.body :", req.body);

  try {
    let qry = req.body;

    const accessKey = qry.accessKey;
    var user_info = tms.jwt.verify(accessKey, TOKEN.SECRET);
    var user_id = user_info._id;

    let imageParce = JSON.parse(qry.images);
    let youtubePhoto = qry.youtubePhoto;

    if (imageParce.length > 0) {
      youtubePhoto = imageParce[0];
    }

    const saveParams = {
      user_id: user_id,
      post_type: qry.type,
      area: qry.area,
      og_title: qry.title,
      comment: qry.comment,
      images: imageParce,
      photo: youtubePhoto,
      youtube_url: qry.youtubeURL,
      parent_id: qry.parent_id,
      admin_address: qry.address,
      r_depth_1: qry.region1depth,
      r_depth_2: qry.region2depth,
      r_depth_3: qry.region3depth,
      location: {
        type: "Point",
        coordinates: [Number(req.body.lng), Number(req.body.lat)],
      },
    };
    const savePost = await Post.create(saveParams);

    let time_obj = common.getToday();

    if (savePost) {
      let bal = 0;
      let lastRecord = await Ledger.find({ user: user_id })
        .sort({ createdAt: -1 })
        .limit(1);
      console.log("User Record : ", lastRecord);
      if (lastRecord.length > 0) bal = lastRecord[0].balance;
      console.log("Error Check : ", bal);
      let rewardParams = {
        user: user_id,
        trans_date: time_obj.date,
        trans_time: time_obj.time,
        description: "글쓰기 보상",
        type: "GET",
        amount: common.reward,
        balance: bal + common.reward,
      };
      let records = await Ledger.create(rewardParams);
      let updatedUser = await Users.findOneAndUpdate(
        { _id: user_id },
        { $set: { balance: records.balance } }
      );
      let updatedPlace = await Place.findOneAndUpdate(
        { _id: qry.parent_id },
        { $push: { post: savePost._id } }
      );
      let rawVal = updatedUser.my_values;
      let validVal = rawVal.filter((item) => item != null);

      let userInfo = {
        _id: updatedUser._id,
        nickname: updatedUser.nickname,
        year: updatedUser.year,
        user_img: updatedUser.user_img,
        simple_msg: updatedUser.simple_msg,
        job: updatedUser.job,
        post: updatedUser.post,
        balance: updatedUser.balance,
        agit: updatedUser.agit,
        basic_info: updatedUser.basic_info,
        my_values: validVal,
        answer_set: updatedUser.answer_set,
      };
      res.json({ msg: RCODE.OPERATION_SUCCEED, data: { item: userInfo } });
    }
  } catch (err) {
    log("err=", err);
    res.status(500).json({ msg: RCODE.SERVER_ERROR, data: {} });
  }
});

// removeStory
/*

*/
post.post("/removeStory", async (req, res) => {
  log("removeStory req.body :", req.body);
  try {
    let qry = req.body;

    // place id : 651ab8ea26808370f63596e3
    const post = await Post.deleteOne({ _id: qry.id });
    const place = await Place.findOne({ _id: qry.parentId });
    let list = place.post;
    list = list.filter(function (item) {
      return item.valueOf() !== qry.id;
    });
    const updatePlace = await Place.findOneAndUpdate({ _id: qry.parentId }, {post: list})
    res.json({ msg: RCODE.OPERATION_SUCCEED, data: { item: updatePlace } });
  } catch (err) {
    log("err=", err);
    res.status(500).json({ msg: RCODE.SERVER_ERROR, data: {} });
  }
});

post.get("/getOnePost", async (req, res) => {
  log("name req.query :", req.query);
  try {
    let qry = req.query;
    const post = await Post.findOne({ _id: qry.id });
    res.json({ msg: RCODE.OPERATION_SUCCEED, data: { item: post } });
  } catch (err) {
    log("err=", err);
    res.status(500).json({ msg: RCODE.SERVER_ERROR, data: {} });
  }
});

post.get("/getPosts", async (req, res) => {
  // log("getPosts req.query :", req.query);
  try {
    let qry = req.query;

    let b_lat = Number(qry.b_lat);
    let b_lng = Number(qry.b_lng);
    let t_lat = Number(qry.t_lat);
    let t_lng = Number(qry.t_lng);

    let level = req.query.levelType;
    // log('lat Type : ', typeof b_lat)

    var posts = await Post.find({
      // level: { $lte: level },
      location: {
        $geoWithin: {
          $box: [
            [b_lng, b_lat],
            [t_lng, t_lat],
          ],
        },
      },
      on_map: true,
    })
      .sort({ $natural: -1 })
      // .populate("user_id")
      // .sort({ hits: -1 })
      .limit(20); // 15
    // posts = _.uniqBy(posts, "admin_address");

    posts = posts.reduce(function (acc, current) {
      // console.log('Acc :', acc)
      if (
        current.place_type == "Land" ||
        acc.findIndex(
          ({ admin_address }) => admin_address === current.admin_address
        ) === -1
      ) {
        acc.push(current);
      }
      return acc;
    }, []);
    // console.log('getPosts return : ', posts)

    res.json({ msg: RCODE.OPERATION_SUCCEED, data: { item: posts } });
  } catch (err) {
    log("err=", err);
    res.status(500).json({ msg: RCODE.SERVER_ERROR, data: {} });
  }
}); // getPosts

//--------------------------------------------------
// New functions 2022
//--------------------------------------------------
// getLocalPosts
post.get("/getLocalPosts", async (req, res) => {
  // log("getLocalPosts req.query :", req.query);

  try {
    let qry = req.query;
    let emptyParams = {
      r_depth_1: qry.r_depth_1,
      r_depth_2: qry.r_depth_2,
    };
    let posts = await Post.find(qry);
    if (posts.length < 1) {
      console.log("1st post#57 : ", posts.length);
      posts = await Post.find(emptyParams);
      if (posts.length < 1) {
        console.log("2st : ", posts.length);
        emptyParams = {
          r_depth_1: qry.r_depth_1,
        };
        posts = await Post.find(emptyParams);
      }
    }
    res.json({ msg: RCODE.OPERATION_SUCCEED, data: { item: posts } });
  } catch (err) {
    log("err=", err);
    res.status(500).json({ msg: RCODE.SERVER_ERROR, data: {} });
  }
});

// post type : PHOTO
// post.post("/createPhoto", async (req, res) => {
//   log("req.body :", req.body);

//   try {
//     let qry = req.body;

//     let params = {
//       user_id: '',
//       is_public: qry.is_public,
//       place_type: qry.place_type,
//       og_url: qry.og_url,
//       og_image: qry.og_image,
//       og_title: qry.og_title,
//       comment: qry.comment,
//       r_depth_1: qry.r_depth_1,
//       r_depth_2: qry.r_depth_2,
//       r_depth_3: qry.r_depth_3,

//     };

//     let post = await Post.create(params);
//     // console.log('post Result : ', post)
//     // let parentId = post.parent_id;
//     let postResult
//     // console.log('qry.place_type : ', qry.place_type)
//     // console.log('qry.parentId : ', qry.parent_id)
//     // console.log('post._id : ', post._id)

//     // Add post to User

//     switch(qry.place_type){
//         case 'PUBLIC':
//             await PublicPlace.updateOne( { _id: qry.parent_id }, { $push: { post:postId} } );
//             postResult = await PublicPlace.findOne({ _id: qry.parent_id }).populate('possess post');
//             console.log('postResult: ', postResult)
//             res.json({ msg: RCODE.OPERATION_SUCCEED, data: { item: postResult } });
//             break;
//         case 'PLACE':
//             await Place.updateOne( { _id: qry.parent_id }, { $push: { post: postId} } );
//             postResult = await Place.findOne({ _id: qry.parent_id }).populate('possess post');
//             res.json({ msg: RCODE.OPERATION_SUCCEED, data: { item: postResult } });
//             break;
//         case 'FACILITY':
//             await Facility.updateOne( { _id: qry.parent_id }, { $push: { post: postId} } );
//             postResult = await Facility.findOne({ _id: qry.parent_id }).populate('possess post');
//             res.json({ msg: RCODE.OPERATION_SUCCEED, data: { item: postResult } });
//             break;
//     }

//   } catch (err) {
//     log("err=", err);
//     res.status(500).json({ msg: RCODE.SERVER_ERROR, data: {} });
//   }
// });

// simple msg
post.post("/createSimpleMsg", async (req, res) => {
  log("req.body :", req.body);

  try {
    let qry = req.body;

    const accessKey = req.body.accessKey;
    var user_info = tms.jwt.verify(accessKey, TOKEN.SECRET);
    var user_id = user_info._id;

    const params = {
      user_id: user_id,
      target_id: qry.target_user_id,
      comment: qry.comment,
    };

    // console.log("Params : ", params);

    await SimpleMsg.create(params);
    // await Users.updateOne(
    //   { _id: qry.target_user_id },
    //   { $push: { simple_msg: new ObjectId(msg._id) } }
    // );
    let msgs = await SimpleMsg.find({ target_id: qry.target_user_id })
      .populate("user_id")
      .sort({ $natural: -1 });
    // console.log("msgs...", msgs);
    res.json({ msg: RCODE.OPERATION_SUCCEED, data: { item: msgs } });
    // console.log('post Result : ', post)
  } catch (err) {
    log("err=", err);
    res.status(500).json({ msg: RCODE.SERVER_ERROR, data: {} });
  }
}); //testCreatepost

// getMsgs
post.get("/getMsgs", async (req, res) => {
  // log("getLocalPosts req.query :", req.query);
  try {
    let qry = req.query;
    let msgs = await SimpleMsg.find(qry)
      .populate("user_id")
      .sort({ $natural: -1 });
    res.json({ msg: RCODE.OPERATION_SUCCEED, data: { item: msgs } });
  } catch (err) {
    log("err=", err);
    res.status(500).json({ msg: RCODE.SERVER_ERROR, data: {} });
  }
});

post.post("/createOnePost", async (req, res) => {
  log("req.body :", req.body);

  try {
    let qry = req.body;

    let params = {
      post_type: qry.post_type,
      user_id: qry.user_id,
      is_public: qry.is_public,
      place_type: qry.place_type,
      parent_id: "",
      og_url: qry.og_url,
      og_image: qry.og_image,
      og_title: qry.og_title,
      photo_url: qry.photo_url,
      comment: qry.comment,
      admin_address: qry.address,
      r_depth_1: qry.r_depth_1,
      r_depth_2: qry.r_depth_2,
      r_depth_3: qry.r_depth_3,
      interest: 1,
      location: qry.location,
    };

    console.log("Params : ", params);

    let post = await Post.create(params);
    console.log("Created...", post);
    res.json({ msg: RCODE.OPERATION_SUCCEED, data: { item: post } });
    // console.log('post Result : ', post)
  } catch (err) {
    log("err=", err);
    res.status(500).json({ msg: RCODE.SERVER_ERROR, data: {} });
  }
}); //testCreatepost

post.post("/createPost", async (req, res) => {
  log("req.body :", req.body);

  try {
    const accessKey = req.body.accessKey;
    var user_info = tms.jwt.verify(accessKey, TOKEN.SECRET);
    var user_id = user_info._id;

    let qry = req.body;
    let str = qry.photo_url;
    let dataObj = JSON.parse(str);

    let params = {
      user_id: new ObjectId(user_id),
      place_type: qry.place_type,
      post_type: qry.post_type,
      parent_id: qry.parent_id,
      og_url: qry.og_url,
      og_image: qry.og_image,
      og_title: qry.og_title,
      photo_url: dataObj,
      comment: qry.comment,
      admin_address: qry.admin_address,
      r_depth_1: qry.r_depth_1,
      r_depth_2: qry.r_depth_2,
      r_depth_3: qry.r_depth_3,
      interest: 1,
      location: qry.location,
    };

    let post = await Post.create(params);
    let posts;
    if (qry.place_type == "PUBLIC") {
      await PublicPlace.findOneAndUpdate(
        { _id: qry.parent_id },
        { $push: { post: post._id } }
      );
      posts = await Post.find({ parent_id: qry.parent_id }).sort({
        createdAt: -1,
      });
    } else if (qry.place_type == "MULTI") {
      await MultiPlace.findOneAndUpdate(
        { _id: qry.parent_id },
        { $push: { post: post._id } }
      );
      posts = await Post.find({ parent_id: qry.parent_id }).sort({
        createdAt: -1,
      });
    } else if (qry.place_type == "PLACE" || qry.place_type == "BUILDING") {
      await Place.findOneAndUpdate(
        { _id: qry.parent_id },
        { $push: { post: post._id } }
      );
      posts = await Post.find({ parent_id: qry.parent_id }).sort({
        createdAt: -1,
      });
    } else {
      let onePost = await Post.findOne({ _id: post._id });
      return res.json({
        msg: RCODE.OPERATION_SUCCEED,
        data: { item: onePost },
      });
    }

    // --- 은행 업무 처리 ---
    if (posts || onePost) {
      // if (false) {
      const qs = {
        service_name: "pinpoint",
        user_id: user_id,
      };

      // 은행정보 가져오기 **************************************************
      let getLatest = await axios.get(getBankUrl, { params: qs });
      let userLastBalance = 0;
      console.log("Get Latest : ", getLatest.data.data.item);
      userLastBalance = getLatest.data.data.item.balance;

      console.log("User Balance : ", userLastBalance);

      userLastBalance += REWARD.createPost;
      // 유저에게 가입시 2천원 지급  param
      let createParams = {
        service_id: "pinpo20231111",
        service_name: "pinpoint",
        user_id: user_id,
        content: "보상",
        description: "글쓰기 보상",
        type: "GET",
        amount: REWARD.createPost,
        balance: userLastBalance, // Reward / createPost signUp
      };

      let insertRecord = await axios.post(postBankurl, createParams);
      console.log("Bank Result : ", insertRecord.data.data.item);
    }
    res.json({ msg: RCODE.OPERATION_SUCCEED, data: { item: posts } });

    // // let parentId = post.parent_id;
    // let postResult;
    // console.log('qry.place_type : ', qry.place_type)
    // console.log('qry.parentId : ', qry.parent_id)
    // console.log('post._id : ', post._id)

    // switch (qry.post_type) {
    //   case "PUBLIC":
    //     await PublicPlace.updateOne(
    //       { _id: qry.parent_id },
    //       { $push: { post: postId } }
    //     );
    //     postResult = await PublicPlace.findOne({ _id: qry.parent_id }).populate(
    //       "possess post"
    //     );
    //     // console.log("postResult: ", postResult);
    //     res.json({ msg: RCODE.OPERATION_SUCCEED, data: { item: postResult } });
    //     break;
    //   case "PLACE":
    //   case "MULTI": // include MULTI
    //       console.log('Switch place....')
    //     await Place.updateOne(
    //       { _id: qry.parent_id },
    //       { $push: { post: postId } }
    //     );
    //     postResult = await Place.findOne({ _id: qry.parent_id }).populate(
    //       "possess post"
    //     );
    //     console.log('Final : ', postResult)
    //     res.json({ msg: RCODE.OPERATION_SUCCEED, data: { item: postResult } });
    //     break;
    //   case "FACILITY":
    //     await Facility.updateOne(
    //       { _id: qry.parent_id },
    //       { $push: { post: postId } }
    //     );
    //     postResult = await Facility.findOne({ _id: qry.parent_id }).populate(
    //       "possess post"
    //     );
    //     res.json({ msg: RCODE.OPERATION_SUCCEED, data: { item: postResult } });
    //     break;
    // }

    // Add post to User
  } catch (err) {
    log("err=", err);
    res.status(500).json({ msg: RCODE.SERVER_ERROR, data: {} });
  }
});

post.get("/getRewardPointPolicy", async (req, res) => {
  log("getRewardPointPolicy req.query :", req.query);
  // log('test : req.query :', req.query)

  try {
    let qry = req.query;
    const pointPolicy = policy.reward_point;
    // let infocenter = await Infocenter.find().sort({$natural:-1}).limit(1)
    // let post = await post.create(params)
    res.json({ msg: RCODE.OPERATION_SUCCEED, data: { item: pointPolicy } });
  } catch (err) {
    log("err=", err);
    res.status(500).json({ msg: RCODE.SERVER_ERROR, data: {} });
  }
});

post.get("/getpost", async (req, res) => {
  log("getpost req.query :", req.query);
  // log('test : req.query :', req.query)

  try {
    let qry = req.query;
    let post = await Post.findOne(qry).populate("reply user_id");
    res.json({ msg: RCODE.OPERATION_SUCCEED, data: { item: post } });
  } catch (err) {
    log("err=", err);
    res.status(500).json({ msg: RCODE.SERVER_ERROR, data: {} });
  }
});

post.get("/getByqueryParams", async (req, res) => {
  log("getByqueryParams req.query :", req.query);
  // log('test : req.query :', req.query)

  try {
    let qry = req.query;
    // console.log('Parent id : ', qry)
    let posts = await Post.find(qry).sort({ createdAt: -1 });
    res.json({ msg: RCODE.OPERATION_SUCCEED, data: { item: posts } });
  } catch (err) {
    log("err=", err);
    res.status(500).json({ msg: RCODE.SERVER_ERROR, data: {} });
  }
});

// updatePost
post.post("/updatePost", async (req, res) => {
  try {
    const qry = req.body;
    /*
    _id: this.storyData._id,
    og_title: this.postTitle,
    comment: this.postContent
    */

    // _id post 에서
    // update
    let updatedPost = await Post.findOneAndUpdate(
      { _id: qry._id },
      { $set: { og_title: qry.og_title, comment: qry.comment } }
    );
    res.json({ msg: RCODE.OPERATION_SUCCEED, data: { item: updatedPost } });
  } catch (err) {
    log("err=", err);
    res.status(500).json({ msg: RCODE.SERVER_ERROR, data: {} });
  }
});

module.exports = post;
