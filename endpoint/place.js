"use strict";

const faker = require("faker");
const express = require("express");
const xlsx = require("xlsx");
const place = express.Router({});
const dateFormat = require("dateformat");
const { ObjectId } = require("mongodb");
const tms = require("../helper/tms");
const common = require("../helper/common");

//--------------------------------------------------
// New functions
//--------------------------------------------------
// buyPlace
place.post("/buyPlace", async (req, res) => {
  try {
    const qry = req.body;
    // console.log('Get body : ', qry)

    // 산 사람의 BALANCE 가 차감
    const accessKey = req.body.accessKey;
    const user_info = tms.jwt.verify(accessKey, TOKEN.SECRET);

    const user_id = user_info._id;
    const user = await Users.findOne({ _id: user_id });

    /*
    owner:          {type:mongoose.Schema.Types.ObjectId, ref:'users'}, // 소유자 
    */
    let img_cnt = user.user_img.length - 1;
    const updatedPlace = await Place.findOneAndUpdate(
      { _id: qry.place_id },
      {
        $set: {
          owner: user._id,
          owner_name: user.name,
          owner_email: user.email,
          owner_image: user.user_img[img_cnt],
        },
      }
    );
    // user 에 자산을 포함
    const updateUser = await Users.findOneAndUpdate(
      { _id: user_id },
      { $push: { poss_bldg: updatedPlace._id } }
    );
    // 돈 은행에서 차감
    const newPlace = await Place.findOne({ _id: qry.place_id });
    res
      .status(200)
      .json({ msg: RCODE.OPERATION_SUCCEED, data: { item: newPlace } });
  } catch (err) {
    log("err=", err);
    res.status(500).json({ msg: RCODE.SERVER_ERROR, data: {} });
  }
});

// create place by click new version
place.post("/inquirePlaceByClick", async (req, res) => {
  try {
    var qry = req.body;
    // console.log('Get body : ', qry)
    // address  . road_address
    const address_set = qry.address.address;
    const road_set = qry.address.road_address;
    // console.log('Get body : ', address_set)
    const pre_address = address_set.address_name;
    let standard_address = require("../helper/standardNM");
    const address = standard_address(pre_address);
    const r_address = road_set.address_name;
    // console.log('address : ', address[1])
    // console.log('short name : ', address[0])
    // console.log("r_address : ", r_address);
    // console.log("location : ", qry.location);
    const reqPlaceName = road_set.building_name.trim();
    // const tempPlaceName = road_set.building_name.trim()

    let isPublic = await PublicPlace.findOne({ road_address: r_address });
    // test(qry.location)
    if (isPublic) {
      await PublicPlace.findOneAndUpdate(
        { road_address: r_address },
        { $inc: { interest: 1 } }
      );
      return res
        .status(200)
        .json({ msg: RCODE.OPERATION_SUCCEED, data: { item: isPublic } });
    }

    let isMulti = await MultiPlace.findOne({
      admin_address: address[1],
    }).populate("possess");
    if (isMulti) {
      await MultiPlace.findOneAndUpdate(
        { admin_address: address[1] },
        { $inc: { interest: 1 } }
      );
      return res
        .status(200)
        .json({ msg: RCODE.OPERATION_SUCCEED, data: { item: isMulti } });
    }

    // console.log('Address &&&&&&&&&&&&&&&&&&: ', address[1])
    // {admin_address:'서울 동작구 신대방동 366-163'}
    let isAddress = await Place.findOne({ admin_address: address[1] });
    if (isAddress) {
      await Place.findOneAndUpdate(
        { admin_address: address[1] },
        { $inc: { interest: 1 } }
      );
      return res
        .status(200)
        .json({ msg: RCODE.OPERATION_SUCCEED, data: { item: isAddress } });
    }
    let isRoad = await Place.findOne({ road_address: r_address });
    if (isRoad) {
      await Place.findOneAndUpdate(
        { road_address: r_address },
        { $inc: { interest: 1 } }
      );
      return res
        .status(200)
        .json({ msg: RCODE.OPERATION_SUCCEED, data: { item: isRoad } });
    }

    if (isAddress) {
      let isRoad = await Place.findOne({ road_address: r_address });
      // if (isRoad) {
      if (reqPlaceName == "") {
        showPlace(isAddress);
      } else {
        let isName = await Place.findOne({ place_name: reqPlaceName });
        // console.log("Is name : ", isName);
        if (isName) {
          showPlace(isName);
        } else {
          // console.log("Deep..............");
          let newParam = { road_address: isRoad.road_address };
          createPlaceAndMulti(isRoad._id, newParam);
          // showPlace(isName);
        }
      }
      // } else {
      //   console.log("Outter..............");
      //   let addressParam = { admin_address: isAddress.admin_address };
      //   createPlaceAndMulti(isAddress._id, addressParam);
      // }
    } else {
      let isRoad = await Place.findOne({ road_address: r_address });
      if (isRoad) {
        // console.log("First time ..............");
        let newParam = { road_address: isRoad.road_address };
        createPlaceAndMulti(isRoad._id, newParam);
      } else {
        createPlace();
      }
    }

    async function showPlace(isRoad) {
      // console.log("원래 있던 place show!!");
      await Place.findOneAndUpdate(
        { _id: isRoad._id },
        { $inc: { interest: 1 } }
      );
      const result = await Place.findOne({ _id: isRoad._id }).populate(
        "parent_id"
      );
      // console.log('Update result what ? : ', result)
      // interest
      res
        .status(200)
        .json({ msg: RCODE.OPERATION_SUCCEED, data: { item: result } });
    }

    async function createPlace() {
      let createParams = {
        place_name: road_set.building_name.trim(),
        place_type: "PLACE",
        admin_address: address[1].trim(),
        road_address: r_address.trim(),
        // bj_code: qry.bj_code,
        r_depth_1: address_set.region_1depth_name.trim(),
        r_depth_2: address_set.region_2depth_name.trim(),
        r_depth_3: address_set.region_3depth_name.trim(),
        // jibun:qry.jibun,
        // eup_myun:qry.eup_myun,
        // ri:qry.ri,
        zip: road_set.zone_no.trim(),
        location: {
          type: "Point",
          coordinates: [Number(qry.location[1]), Number(qry.location[0])],
        },
        description: "",
        owner_name: "황상익",
        owner_email: "mothcar@naver.com",
        interest: 1,
      };
      const fianl = await Place.create(createParams);
      // console.log("Create Place .....");
      res
        .status(200)
        .json({ msg: RCODE.OPERATION_SUCCEED, data: { item: fianl } });
    }

    async function createPlaceAndMulti(id, param) {
      let createParams = {
        place_name: road_set.building_name.trim(),
        sub_name: road_set.building_name.trim(),
        place_type: "PLACE",
        admin_address: address[1].trim(),
        road_address: r_address.trim(),
        sub_address: road_set.building_name.trim(),
        // bj_code: qry.bj_code,
        r_depth_1: address_set.region_1depth_name.trim(),
        r_depth_2: address_set.region_2depth_name.trim(),
        r_depth_3: address_set.region_3depth_name.trim(),
        // jibun:qry.jibun,
        // eup_myun:qry.eup_myun,
        // ri:qry.ri,
        zip: road_set.zone_no.trim(),
        location: {
          type: "Point",
          coordinates: [Number(qry.location[1]), Number(qry.location[0])],
        },
        description: "",
        owner_name: "황상익",
        owner_email: "mothcar@naver.com",
        interest: 1,
      };
      const createdPlace = await Place.create(createParams);
      // const updateplace = await Place.findOneAndUpdate({_id:placeId})

      let placeName = road_set.building_name.trim();
      let MultiType = "";
      if (placeName.indexOf("아파트") > 0) {
        MultiType = "APART";
        let arrName = placeName.split(" ");
        placeName = arrName[0];
      }
      // else 면 nothing
      const isMulti = await MultiPlace.findOne(param);
      if (!isMulti) {
        let createMultiParams = {
          place_name: placeName,
          place_type: "MULTI",
          multi_type: MultiType,
          admin_address: address[1].trim(),
          road_address: r_address.trim(),
          // bj_code: qry.bj_code,
          r_depth_1: address_set.region_1depth_name.trim(),
          r_depth_2: address_set.region_2depth_name.trim(),
          r_depth_3: address_set.region_3depth_name.trim(),
          // jibun:qry.jibun,
          // eup_myun:qry.eup_myun,
          // ri:qry.ri,
          zip: road_set.zone_no.trim(),
          possess: [new ObjectId(id), new ObjectId(createdPlace._id)],
          location: {
            type: "Point",
            coordinates: [Number(qry.location[1]), Number(qry.location[0])],
          },
          description: "",
          owner_name: "황상익",
          owner_email: "mothcar@naver.com",
          interest: 1,
        };
        await MultiPlace.create(createMultiParams);
        // console.log("created Multi !!");
      } else {
        await MultiPlace.findOneAndUpdate(param, {
          $push: { possess: new ObjectId(createdPlace._id) },
        });
      }
      res
        .status(200)
        .json({ msg: RCODE.OPERATION_SUCCEED, data: { item: createdPlace } });
    }

    // // // TODO: color position validation or test

    // // // let infocenter = await Infocenter.find().sort({$natural:-1}).limit(1)
    // // let isMulti = await Place.findOne({admin_address:qry.admin_address, place_type:"MULTI"}).populate('bldg')
    // // console.log('isMulti : ', isMulti)
    // // if(isMulti) res.status(200).json({ msg: RCODE.OPERATION_SUCCEED, data: { item: isMulti } });
    // // else {
    // //   let isPlace = await Place.findOne({admin_address:qry.admin_address})
    // //   let place
    // //   if(!isPlace) place = await Place.create(createParams)
    // //   else {
    // //     await Place.updateOne({_id:isPlace._id}, { $inc: {interest:1}})
    // //     place = await Place.findOne({_id:isPlace._id}).populate('possess post')
    // //   }

    // //   res.status(200).json({ msg: RCODE.OPERATION_SUCCEED, data: { item: place } });
    // // }
  } catch (err) {
    log("err=", err);
    res.status(500).json({ msg: RCODE.SERVER_ERROR, data: {} });
  }
}); //inquire place if not create place

// create place old version
place.post("/createPlace", async (req, res) => {
  try {
    var qry = req.body;
    // console.log('Get body : ', qry)
    let isPublic = await PublicPlace.findOne({
      place_name: qry.placeName,
    }).populate("possess post");
    if (isPublic) {
      res
        .status(200)
        .json({ msg: RCODE.OPERATION_SUCCEED, data: { item: isPublic } });
      // console.log('Server stop.............................')
      return;
    }
    // console.log('Server poceed.............................')
    let createParams = {
      place_name: qry.placeName,
      place_type: "PLACE",
      admin_address: qry.admin_address,
      road_address: qry.road_address,
      bj_code: qry.bj_code,
      r_depth_1: qry.r_depth_1,
      r_depth_2: qry.r_depth_2,
      r_depth_3: qry.r_depth_3,
      jibun: qry.jibun,
      eup_myun: qry.eup_myun,
      ri: qry.ri,
      location: {
        type: "Point",
        coordinates: [Number(qry.location[1]), Number(qry.location[0])],
      },
      description: "",
      owner_name: "황상익",
      owner_email: "mothcar@naver.com",
      interest: 1,
    };
    // TODO: color position validation or test

    // let infocenter = await Infocenter.find().sort({$natural:-1}).limit(1)
    let isMulti = await Place.findOne({
      admin_address: qry.admin_address,
      place_type: "MULTI",
    }).populate("bldg");
    // console.log("isMulti : ", isMulti);
    if (isMulti)
      res
        .status(200)
        .json({ msg: RCODE.OPERATION_SUCCEED, data: { item: isMulti } });
    else {
      let isPlace = await Place.findOne({ admin_address: qry.admin_address });
      let place;
      if (!isPlace) place = await Place.create(createParams);
      else {
        await Place.updateOne({ _id: isPlace._id }, { $inc: { interest: 1 } });
        place = await Place.findOne({ _id: isPlace._id }).populate(
          "possess post"
        );
      }

      res
        .status(200)
        .json({ msg: RCODE.OPERATION_SUCCEED, data: { item: place } });
    }
  } catch (err) {
    log("err=", err);
    res.status(500).json({ msg: RCODE.SERVER_ERROR, data: {} });
  }
});

place.post("/createInner", async (req, res) => {
  try {
    var qry = req.body;
    // console.log('Get body : ', qry)
    // console.log('Server poceed.............................')
    let createParams = qry.createParams
    await Facility.create(createParams)
    await Place.updateOne({_id:qry._id}, {$inc: { child: 1 }})

    let updatedPlace = await Place.findOne({_id:qry._id})
    res.status(200).json({ msg: RCODE.OPERATION_SUCCEED, data: { item: updatedPlace } });
  } catch (err) {
    log("err=", err);
    res.status(500).json({ msg: RCODE.SERVER_ERROR, data: {} });
  }
});

place.get("/getOnePleces", async (req, res) => {
  try {
    // console.log("get One Place cafe24 server !!!!");
    var qry = req.query;

    // let infocenter = await Infocenter.find().sort({$natural:-1}).limit(1)
    // const searchWord ="서울특별시 서초구 방배동 1-106"
    const searchWord = qry.address;
    // const searchWord ="서초구"
    // let places = await Place.find({r_depth_2: searchWord});
    let places = await Place.find({ admin_address: searchWord });
    // console.log("Places : ", places[0]);
    // res.json({ msg: RCODE.OPERATION_SUCCEED, data: { item: place } });
    res
      .status(200)
      .json({ msg: RCODE.OPERATION_SUCCEED, data: { item: places[0] } });
  } catch (err) {
    log("err=", err);
    res.status(500).json({ msg: RCODE.SERVER_ERROR, data: {} });
  }
});

// copy from post getPosts with Reduce 
place.get("/getPlaces", async (req, res) => {
  // console.log('Get Agits..................')
  try {
    let qry = req.query;
    // console.log('qry.b_lat : ', qry.b_lat)

    let b_lat = Number(qry.b_lat);
    let b_lng = Number(qry.b_lng);
    let t_lat = Number(qry.t_lat);
    let t_lng = Number(qry.t_lng);

    let level = req.query.levelType;
    // log('lat Type : ', typeof b_lat)

    var agits = await Place.find({
      // level: { $lte: level },
      location: {
        $geoWithin: {
          $box: [
            [b_lng, b_lat],
            [t_lng, t_lat],
          ],
        },
      },
      // on_map: true,
    })
    .sort({$natural:-1})
      // .populate("user_id")
      // .sort({ hits: -1 })
      .limit(20); // 15
    // posts = _.uniqBy(posts, "admin_address");

    res.json({ msg: RCODE.OPERATION_SUCCEED, data: { item: agits } });
  } catch (err) {
    log("err=", err);
    res.status(500).json({ msg: RCODE.SERVER_ERROR, data: {} });
  }
});

//
place.get("/getPlace", async (req, res) => {
  try {
    var qry = req.query;
    console.log('Qry : ', qry)

    // let infocenter = await Infocenter.find().sort({$natural:-1}).limit(1)
    let place = await Place.findOne({_id: qry._id});
    // let user = await Users.findOne({_id: place.owner._id.toString()})
    // console.log("place.owner : ", place.owner)
    // console.log("qry.visitor : ", qry.visitor)

    if(place.owner.valueOf() == qry.visitor)  return res.json({ msg: RCODE.OPERATION_SUCCEED, data: { item: place } });
    else {
      let visitorInfo = { _id: ''}
      if(qry.visitor) {
        let time_obj = common.getToday();
        const visitor = await Users.findOne({_id: qry.visitor})
        console.log('Visitor : ', visitor)
        visitorInfo = common.setMyParams(visitor)
        // visitorInfo.date = time_obj.date
        // visitorInfo.time = time_obj.time
        let date = new Date();
        visitorInfo.date = date
      } else {
        let date = new Date();
        visitorInfo.nickname = '비회원'
        visitorInfo.date = date
      }

      await Place.findOneAndUpdate({_id: qry._id},{$push: {visitors: visitorInfo}})
      res.json({ msg: RCODE.OPERATION_SUCCEED, data: { item: place } });
    }
    
    
    // Object.assign(place, {"userInfo": userInfo});
    // console.log('User Data : ', user)

    // place.userInfo= {
    //   _id: user._id,
    //   user_name: user.name,
    //   nickname: user.nickname,
    //   email: user.email,
    //   user_img: user.user_img,
    //   simple_msg: user.simple_msg,
    //   job: user.job,
    //   post: user.post,
    //   balance: user.balance,
    //   agit: user.agit,
    // };
    // console.log('Place info : ', place)
    
    // res.status(200).json({ msg: RCODE.OPERATION_SUCCEED, data: { item: place } });
  } catch (err) {
    log("err=", err);
    res.status(500).json({ msg: RCODE.SERVER_ERROR, data: {} });
  }
});

place.post("/editImage", async (req, res) => {
  try {
    var qry = req.body;
    // console.log('Qry editImage : ', qry)
    let place 
    await Place.findOneAndUpdate({_id:qry._id},{$push:{image:qry.image}})
    // console.log('Place changed : ', changed)
    place = await Place.findOne({_id:qry._id})
    // console.log('Place : ', place)
    res.json({ msg: RCODE.OPERATION_SUCCEED, data: { item: place } });
  } catch (err) {
    log("err=", err);
    res.status(500).json({ msg: RCODE.SERVER_ERROR, data: {} });
  }
});

// editPlaceName
place.post("/editPlaceName", async (req, res) => {
  try {
    var qry = req.query;
    // console.log('Qry : ', qry)

    // let infocenter = await Infocenter.find().sort({$natural:-1}).limit(1)
    let place = await Place.findOneAndUpdate(
      { _id: qry._id },
      { place_name: qry.place_name }
    );
    res.json({ msg: RCODE.OPERATION_SUCCEED, data: { item: place } });
    // res.status(200).json({ msg: RCODE.OPERATION_SUCCEED, data: { item: place } });
  } catch (err) {
    log("err=", err);
    res.status(500).json({ msg: RCODE.SERVER_ERROR, data: {} });
  }
});

place.post("/editPosition", async (req, res) => {
  try {
    var qry = req.body;
    // console.log('Qry : ', qry)
    let location = {
      type: "Point",
      coordinates: [Number(qry.lng), Number(qry.lat)],
    };

    // console.log('location : ', location)

    let place = await Place.findOneAndUpdate(
      { _id: qry._id },
      { location: location }
    );
    res.json({ msg: RCODE.OPERATION_SUCCEED, data: { item: place } });
    // res.status(200).json({ msg: RCODE.OPERATION_SUCCEED, data: { item: place } });
  } catch (err) {
    log("err=", err);
    res.status(500).json({ msg: RCODE.SERVER_ERROR, data: {} });
  }
});

// editPlaceInfo  owner_img
place.post("/editPlaceInfo", async (req, res) => {
  try {
    var qry = req.body;
    // console.log('Qry : ', qry)
    let place = await Place.findOneAndUpdate({ _id: qry._id }, qry.content);
    res.json({ msg: RCODE.OPERATION_SUCCEED, data: { item: place } });
    // res.status(200).json({ msg: RCODE.OPERATION_SUCCEED, data: { item: place } });
  } catch (err) {
    log("err=", err);
    res.status(500).json({ msg: RCODE.SERVER_ERROR, data: {} });
  }
});

place.post("/addPlace", async (req, res) => {
  try {
    var qry = req.body;
    // console.log('Qry : ', qry)
    let oldPlace = await Place.findOne({ _id: qry._id });
    let isPlace = await Place.findOne({
      admin_address: oldPlace.admin_address,
      sub_address: qry.place_name,
    });
    let createMultiParams = {
      place_name: oldPlace.place_name,
      admin_address: oldPlace.admin_address,
      multi_type: oldPlace.place_code,
      place_code: oldPlace.place_code, // 장소 type code
      road_address: oldPlace.road_address, // 도로명주소
      r_depth_1: oldPlace.r_depth_1,
      r_depth_2: oldPlace.r_depth_2,
      r_depth_3: oldPlace.r_depth_3,
      location: oldPlace.location,
      interest: oldPlace.interest,
    };
    if (!isPlace) {
      let createPlaceParams = {
        place_name: oldPlace.place_name.trim(),
        admin_address: oldPlace.admin_address.trim(),
        road_address: oldPlace.road_address.trim(),
        sub_address: qry.place_name.trim(),
        r_depth_1: oldPlace.r_depth_1,
        r_depth_2: oldPlace.r_depth_2,
        r_depth_3: oldPlace.r_depth_3,
        // jibun:qry.jibun,
        // eup_myun:qry.eup_myun,
        // ri:qry.ri,
        zip: oldPlace.zip.trim(),
        location: {
          type: "Point",
          coordinates: [Number(qry.lng), Number(qry.lat)],
        },
        owner_name: "황상익",
        owner_email: "mothcar@naver.com",
        interest: 1,
      };
      let newPlace = await Place.create(createPlaceParams);
      createMultiParams.possess = [
        new ObjectId(oldPlace._id),
        new ObjectId(newPlace._id),
      ];
    } else {
      createMultiParams.possess = [
        new ObjectId(oldPlace._id),
        new ObjectId(isPlace._id),
      ];
    }

    let multi = await MultiPlace.create(createMultiParams);
    res.json({ msg: RCODE.OPERATION_SUCCEED, data: { item: multi } });
    // res.status(200).json({ msg: RCODE.OPERATION_SUCCEED, data: { item: place } });
  } catch (err) {
    log("err=", err);
    res.status(500).json({ msg: RCODE.SERVER_ERROR, data: {} });
  }
});

// Create Building Info from Local Admin
place.post("/createBldfromLocal", async (req, res) => {
  try {
    var qry = req.body;
    // console.log('Qry : ', qry)

    // let infocenter = await Infocenter.find().sort({$natural:-1}).limit(1)
    // let place = await Place.findOne(qry).populate('possess')

    let row = qry;

    let editedAddress = row.PLAT_PLC.replace("번지", "");
    // 서울특별시 동작구 노량진동 323  우성아파트
    //

    // MGM_BLDRGST_PK
    let isMgmParams = {
      mgm_id: row.MGM_BLDRGST_PK,
    };
    let isMgm = await Place.find(isMgmParams);
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
      const API_KEY = "d190b96b-b402-4632-8453-e7fca774f9d2";
      let getPoiApi = `https://apis.openapi.sk.com/tmap/geo/geocoding?version=1&city_do=${cityDo}&gu_gun=${guGun}&dong=${dong}&bunji=${bunji}&addressFlag=F01&coordType=WGS84GEO&appKey=${API_KEY}`;

      let result = await axios.get(getPoiApi);
      //   console.log("result 0 : ", result);

      let onePoi = result.data.coordinateInfo;

      // let placeName = "일반건물";
      // if (typeof row.BLD_NM !== "undefined") placeName = row.BLD_NM;
      // if (placeName === ".") placeName = "일반건물";
      // console.log("Place Name : ", placeName);
      // console.log('row : ', row)

      let dongName = "";
      if (typeof row.DONG_NM !== "undefined") {
        dongName = row.DONG_NM;
      } else if (typeof row.BLD_NM !== "undefined") {
        dongName = row.BLD_NM;
        if (dongName === ".") dongName = "일반건물";
      } else {
        dongName = "일반건물";
      }
      // console.log(`${i} : ${dongName}`)

      let lat = Number(onePoi.lat);
      let lng = Number(onePoi.lon);
      let createParams = {
        mgm_id: row.MGM_BLDRGST_PK,
        admin_address: editedAddress, // 주소
        place_name: dongName, // 건물명
        place_type: "BUILDING", // 건물 type
        place_code: row.MAIN_PURPS_CD, // 장소 type code
        // road_address: onePoi.newAddressList.newAddress.fullAddressRoad, // 도로명주소
        road_address: row.NEW_PLAT_PLC, // 도로명주소
        r_depth_1: onePoi.city_do,
        r_depth_2: onePoi.gu_gun,
        r_depth_3: onePoi.adminDong,
        location: {
          type: "Point",
          coordinates: [lng, lat],
        },
        bld_plot_area: row.TOTAREA, // 연면적 ㎡
        bld_place_area: row.PLAT_AREA, // 대지면적
        bld_area: row.ARCH_AREA, // 건축면적
        bld_yong: row.VL_RAT, // 용적율 %
        bld_gunpe: row.BC_RAT, // 건폐율 %
        bld_floor: row.GRND_FLR_CNT, // 지상층수
        bld_under: row.UGRND_FLR_CNT, // 지하층수
        bld_park: row.INDR_AUTO_UTCNT, // 주차대수
        bld_park_area: row.INDR_AUTO_AREA, // 주차면적
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
          return res.json({
            msg: RCODE.OPERATION_SUCCEED,
            data: { item: "Update Done..." },
          });
        } else {
          // MAIN_ATCH_GB_CD_NM: '주건축물',
          let arr = [];
          isPlaces.forEach((item) => {
            arr.push(new ObjectId(item._id));
          });
          // console.log('Check arr : ', arr)

          let createMultiParams = {
            place_name: dongName,
            admin_address: editedAddress,
            place_type: "MULTI",
            place_code: row.MAIN_PURPS_CD, // 장소 type code
            // road_address: onePoi.newAddressList.newAddress.fullAddressRoad, // 도로명주소
            road_address: row.NEW_PLAT_PLC, // 도로명주소
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
          // console.log("Created MUlti : ", createMulti);

          isPlaces.forEach(async (place) => {
            await Place.findOneAndUpdate(
              { _id: place._id },
              { parent_id: new ObjectId(createMulti._id) }
            );
          });
          return res.json({
            msg: RCODE.OPERATION_SUCCEED,
            data: { item: "Update......" },
          });
        }
      } // if multiple building And Continue...
      return res.status(200).json({
        msg: RCODE.OPERATION_SUCCEED,
        data: { item: createdBuilding },
      });
    } // if not MGM
    else {
      return;
    }
  } catch (err) {
    log("err=", err);
    res.status(500).json({ msg: RCODE.SERVER_ERROR, data: {} });
  }
}); // createBldfromLocal

//--------------------------------------------------
// Old functions
//--------------------------------------------------
place.get("/getCountry", async (req, res) => {
  // log('test : req.body :', req.body)
  // log('test : req.query :', req.query)
  var infoFilter = req.query.infocenter_level;
  var newInfocenter = req.query;

  try {
    // let infocenter = await Infocenter.find().sort({$natural:-1}).limit(1)
    let place = await Place.findOne(newInfocenter);
    res.json({ msg: RCODE.OPERATION_SUCCEED, data: { item: place } });
  } catch (err) {
    log("err=", err);
    res.status(500).json({ msg: RCODE.SERVER_ERROR, data: {} });
  }
});

place.get("/getInfocenterById", async (req, res) => {
  log("getInfocenterById: req.query :", req.query);
  var inputParam = req.query;
  let infocenter = await Place.findOne(inputParam);
  res
    .status(200)
    .json({ msg: RCODE.OPERATION_SUCCEED, data: { item: infocenter } });
});

place.get("/", async (req, res) => {
  try {
    // log('@@ Env : ', process.env.API_KEY)
    log("@@ Env : server OK");
    res.json({
      msg: RCODE.OPERATION_SUCCEED,
      data: { item: "Good Server~~~" },
    });
  } catch (err) {
    log("err=", err);
    res.status(500).json({ msg: RCODE.SERVER_ERROR, data: {} });
  }
});

place.get("/getMarker", async (req, res) => {
  log("getMarker : req.query :", req.query);

  let b_lat = Number(req.query.b_lat);
  let b_lng = Number(req.query.b_lng);
  let t_lat = Number(req.query.t_lat);
  let t_lng = Number(req.query.t_lng);
  // res.ok(params)
  log("lat Type : ", typeof b_lat);

  var infocenters = await Place.find({
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

  // var lotMarker = infocenters.concat(places)
  // await Infocenter.find()
  log("position return : ", infocenters);
  res
    .status(200)
    .json({ msg: RCODE.OPERATION_SUCCEED, data: { item: infocenters } });
});

place.get("/getInfo", async (req, res) => {
  // log('test : req.body :', req.body)
  log("getInfo : req.query :", req.query);
  var infoFilter = req.query.infocenter_level;
  var newInfocenter = req.query;
  var inputParam = {};
  inputParam = req.query;
  // depth_0
  // if(infoFilter=='depth_0') {
  //   let infocenter1 = await Infocenter.findOne({name:'대한민국 정보센터'})
  //   res.json({msg:RCODE.OPERATION_SUCCEED, data:{item:infocenter1}})
  // }

  var pre_lat = req.query.lat;
  var lat = Number(pre_lat);
  var pre_lng = req.query.lng;
  var lng = Number(pre_lng);

  inputParam.location = {
    type: "Point",
    coordinates: [lng, lat],
  };

  try {
    if (infoFilter === "depth_0") {
      newInfocenter = {};
      newInfocenter.name = req.query.name;
    }

    if (infoFilter == "region_1depth_name") {
      newInfocenter = {};
      newInfocenter.name = req.query.name;
    }

    if (infoFilter == "region_2depth_name") {
      newInfocenter = {};
      newInfocenter.name = req.query.name;
      // delete inputParam.r_depth_3
    }
    if (infoFilter == "region_3depth_name") {
      newInfocenter = {};
      newInfocenter.name = req.query.name;
      newInfocenter.r_depth_2 = req.query.r_depth_2;
      // delete inputParam.r_depth_3
    }

    log("CHECK QUERY PARAM :", newInfocenter);
    log("CHECK input PARAM :", inputParam);
    // let infocenter = await Infocenter.find().sort({$natural:-1}).limit(1)
    let infocenter = await Place.findOne(newInfocenter);
    // log('server result : ', infocenter)
    if (infocenter == null) {
      // Infocenter.create(req.query)
      Infocenter.create(inputParam).then((result) => {
        log("new infocenter reuslt : ", result);

        // let payload = {
        //   _id:        result._id,
        //   email:      result.email
        // }

        // let token = tms.jwt.sign(payload, TOKEN.SECRET, {expiresIn: TOKEN.EXPIRE_SEC})
        // if(!token)
        //   return res.status(500).json({msg: RCODE.SERVER_ERROR, data:{}})

        // Users.updateOne({_id: result._id}, {loginType: LOGIN_CODE.EMAIL})

        return res
          .status(200)
          .json({ msg: RCODE.OPERATION_SUCCEED, data: { item: result } });
        // return res.status(200).json(result)
      });
      log("result is null");
    } else {
      // log('server result : ', infocenter)
      res.json({ msg: RCODE.OPERATION_SUCCEED, data: { item: infocenter } });
    }

    // res.json({msg:RCODE.OPERATION_SUCCEED, data:{item:infocenter[0]}})
  } catch (err) {
    log("err=", err);
    res.status(500).json({ msg: RCODE.SERVER_ERROR, data: {} });
  }
}); // 'getInfo'

module.exports = place;
