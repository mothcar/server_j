"use strict";

const faker = require("faker");
const express = require("express");
const xlsx = require("xlsx");
const test = express.Router({});
const dateFormat = require("dateformat");
const dictionary = require("../helper/dictionary");
const { ObjectId } = require('mongodb');

var dotenv = require("dotenv");
dotenv.config();

/*
db.createUser(
  {
    user: "admin",
    pwd: "admin",
    roles: [ { role: "readWrite", db: "test" }]
  }
)


*/

//--------------------------------------------------
// Test   functions
//--------------------------------------------------

const new_name = require("../helper/shortAdminNM.js");

test.get("/newname", async (req, res) => {
  try {
    res.json({ msg: RCODE.OPERATION_SUCCEED, data: { item: new_name } });
    console.log("Get Place : ", new_name);
  } catch (err) {
    log("err=", err);
    res.status(500).json({ msg: RCODE.SERVER_ERROR, data: {} });
  }
});

//--------------------------------------------------
// Multi insert DB  functions
//--------------------------------------------------

// Wrong Multi Place to Place 
test.get("/changePublicTypeToLevel", async (req, res) => {
  try {
    let publics = await PublicPlace.updateMany({}, {$set:{place_type: "PUBLIC", gov_type: "ADMINI"}})
    console.log("Get publics : ", publics);
    res.json({ msg: RCODE.OPERATION_SUCCEED, data: { item: publics} });
  } catch (err) {
    log("err=", err);
    res.status(500).json({ msg: RCODE.SERVER_ERROR, data: {} });
  }
});

// Wrong Multi Place to Place 
test.get("/changeFakeMulti", async (req, res) => {
  try {
    let multies = await MultiPlace.find({ place_name : '', possess: [] })
    console.log("Get multies : ", multies);
    // multies.forEach(async item=>{
    //   item.place_type = 'PLACE'
    //   await Place.create(item) 
    //   await MultiPlace.deleteOne({_id:item._id})
    // })
    res.json({ msg: RCODE.OPERATION_SUCCEED, data: { item: multies} });
  } catch (err) {
    log("err=", err);
    res.status(500).json({ msg: RCODE.SERVER_ERROR, data: {} });
  }
});


// test confirm inserted
test.get("/getPlace", async (req, res) => {
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

// Create A House with area and price
test.get("/createHouse", async (req, res) => {
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
        let curPrice = Number(raw[i].데이터기준일자.replace(/-/gi, ""));
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
          description: raw[i].데이터기준일자,
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
}); // Prepare to read

test.get("/insertMulti", async (req, res) => {
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

      if (typeof result.data.searchPoiInfo?.pois.poi[0] === "undefined") {
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
      } else if (
        typeof result.data.searchPoiInfo?.pois.poi[0] === "undefined"
      ) {
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

      var inputParam = {};
      inputParam.multi_code = raw[i].단지코드;
      inputParam.place_name = raw[i].단지명;
      inputParam.place_type = "MULTI";
      inputParam.admin_address = raw[i].법정동주소;
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
}); //inserDB

//--------------------------------------------------
// test functions
//--------------------------------------------------
test.post("/", async (req, res) => {
  try {
    log("test req.body= :", req.body);
    log("test req.query= :", req.query);
    res.json({
      msg: RCODE.OPERATION_SUCCEED,
      data: { item: "Good Server1234~~~" },
    });
  } catch (err) {
    log("err=", err);
    res.status(500).json({ msg: RCODE.SERVER_ERROR, data: {} });
  }
});

test.get("/aa", async (req, res) => {
  try {
    // log('@@ Env : ', process.env.API_KEY)
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

test.get("/getUsers", async (req, res) => {
  try {
    // log('@@ Env : ', process.env.API_KEY)
    const users = await Users.find();
    log("@@ Env : ", process.env);
    res.json({
      msg: RCODE.OPERATION_SUCCEED,
      data: { item: users },
    });
  } catch (err) {
    log("err=", err);
    res.status(500).json({ msg: RCODE.SERVER_ERROR, data: {} });
  }
});

test.get("/getCSV", async (req, res) => {
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

    // /* Store the converted result into an array */
    // const csvToJsonResult = [];

    // /* Store the CSV column headers into seprate variable */
    // const headers = array[0].split(", ");

    // /* Iterate over the remaning data rows */
    // for (let i = 1; i < array.length - 1; i++) {
    //   /* Empty object to store result in key value pair */
    //   const jsonObject = {};
    //   /* Store the current array element */
    //   const currentArrayString = array[i];
    //   let string = "";

    //   let quoteFlag = 0;
    //   for (let character of currentArrayString) {
    //     if (character === '"' && quoteFlag === 0) {
    //       quoteFlag = 1;
    //     } else if (character === '"' && quoteFlag == 1) quoteFlag = 0;
    //     if (character === ", " && quoteFlag === 0) character = "|";
    //     if (character !== '"') string += character;
    //   }

    //   let jsonProperties = string.split("|");

    //   for (let j in headers) {
    //     if (jsonProperties[j].includes(", ")) {
    //       jsonObject[headers[j]] = jsonProperties[j]
    //         .split(", ")
    //         .map((item) => item.trim());
    //     } else jsonObject[headers[j]] = jsonProperties[j];
    //   }
    //   /* Push the genearted JSON object to resultant array */
    //   csvToJsonResult.push(jsonObject);
    // }
    // /* Convert the final array to JSON */
    // const json = JSON.stringify(csvToJsonResult);
    // console.log(json);
    res.json({ msg: RCODE.OPERATION_SUCCEED, data: { item: "Good~~~" } });
  } catch (err) {
    log("err=", err);
    res.status(500).json({ msg: RCODE.SERVER_ERROR, data: {} });
  }
});

test.get("/", async (req, res) => {
  try {
    log("test req.body=", req.body);
    var myKey = process.env.BUILDING_INFO_API;
    var url =
      "http://apis.data.go.kr/B552015/NpsBplcInfoInqireService/getPdAcctoSttusInfoSearch"; /*URL*/
    var queryParams1 =
      "?" + encodeURIComponent("ServiceKey") + "=" + myKey; /*Service Key*/
    queryParams1 +=
      "&" +
      encodeURIComponent("seq") +
      "=" +
      encodeURIComponent("17735069"); /*식별번호*/
    queryParams1 +=
      "&" +
      encodeURIComponent("data_crt_ym") +
      "=" +
      encodeURIComponent("201806"); /*년월(yyyymm)*/

    var request = require("request");
    // var url = 'http://apis.data.go.kr/B552015/NpsBplcInfoInqireService/getBassInfoSearch';
    var url = "http://apis.data.go.kr/1611000/BldRgstService/getBrHsprcInfo";

    var queryParams1 = {
      ServiceKey: decodeURIComponent(myKey),
      // typename: 'F166',
      // seq: encodeURIComponent('17735069'),
      // data_crt_ym: encodeURIComponent('201806'),
      wkpl_nm: encodeURIComponent("삼구골프클럽"),
    };

    var queryParams =
      "?" + encodeURIComponent("ServiceKey") + "=" + myKey; /* Service Key*/
    // queryParams += '&' + encodeURIComponent('ldong_addr_mgpl_dg_cd') + '=' + encodeURIComponent('41'); /* 시도(행정자치부 법정동 주소코드 참조) */
    // queryParams += '&' + encodeURIComponent('ldong_addr_mgpl_sggu_cd') + '=' + encodeURIComponent('117'); /* 시군구(행정자치부 법정동 주소코드 참조) */
    // queryParams += '&' + encodeURIComponent('ldong_addr_mgpl_sggu_emd_cd') + '=' + encodeURIComponent('101'); /* 읍면동(행정자치부 법정동 주소코드 참조) */
    queryParams +=
      "&" +
      encodeURIComponent("wkpl_nm") +
      "=" +
      encodeURIComponent("삼성전자"); /* 사업장명 */
    queryParams +=
      "&" +
      encodeURIComponent("bzowr_rgst_no") +
      "=" +
      encodeURIComponent("124815"); /* 사업자등록번호(앞에서 6자리) */
    queryParams +=
      "&" +
      encodeURIComponent("pageNo") +
      "=" +
      encodeURIComponent("10"); /* 페이지번호 */
    queryParams +=
      "&" +
      encodeURIComponent("numOfRows") +
      "=" +
      encodeURIComponent("1"); /* 행갯수 */

    request(
      { url: url + queryParams, method: "GET" },
      function (err, response, body) {
        if (err) {
          console.log(err);
          return;
        }

        // sails.log.info('20181002 -  Status: '+response.statusCode+' Body: '+JSON.stringify(response))
        console.log(
          "20181002 -  Status: " + response.statusCode + " Body: " + response
        );
        console.log("Get response: " + response);
        // res.ok(JSON.stringify(response.pnu))
        // res.ok(body)
        res.json({ msg: RCODE.OPERATION_SUCCEED, data: { item: body } });
      }
    );
  } catch (err) {
    log("err=", err);
    res.status(500).json({ msg: RCODE.SERVER_ERROR, data: {} });
  }
});

// *****************************************************
// update json
// *****************************************************

test.get("/updateJson", async (req, res) => {
  try {
    // log('test req.body= :', req.query)

    var newData = [];
    var fs = require("fs");
    const cafeList = JSON.parse(fs.readFileSync("./cafe_idiya.json", "utf8"));
    console.log("Read Json : ", cafeList.length);
    const count = cafeList.length;

    for (var i = 0; count > i; i++) {
      const cafe = cafeList[i];
      cafe.image =
        "https://res.cloudinary.com/mothcar/image/upload/v1627121341/cafe_brand_logo/ediya_marker.png";
      console.log("Cafe : ", cafe);
    }

    res.json({ msg: RCODE.OPERATION_SUCCEED, data: cafeList });
    // res.json({msg:RCODE.OPERATION_SUCCEED, data:{item:raw[100]}})
  } catch (err) {
    log("err=", err);
    res.status(500).json({ msg: RCODE.SERVER_ERROR, data: {} });
  }
}); //inserDB

// *****************************************************
// Admin insert DB By Crawling
// *****************************************************

// inset center ***********************************************************************************
test.get("/insertCenterToDb", async (req, res) => {
  try {
    // log('test req.body= :', req.query)

    var newData = [];
    var fs = require("fs");
    const centerList = JSON.parse(fs.readFileSync("./buch.json", "utf8"));
    console.log("Read Json : ", centerList.length);
    const count = centerList.length;

    for (var i = 0; count > i; i++) {
      const center = centerList[i];
      console.log("center : ", center);
      let stAddress = center.address.replace(/  +/g, " ");
      let stRoadAddress = center.roadAddress.replace(/  +/g, " ");
      let addressArr = stAddress.split(" ");

      let inputParam = {};
      inputParam.is_public = true;
      inputParam.center_code = center.id;
      inputParam.place_name = center.name;
      inputParam.public_type = "8읍면동_동";
      inputParam.admin_address = stAddress;
      inputParam.road_address = stRoadAddress;
      inputParam.web_address = "";
      inputParam.tel = "";
      inputParam.zip = "";
      inputParam.r_depth_1 = addressArr[0];
      inputParam.r_depth_2 = addressArr[1];
      inputParam.r_depth_3 = addressArr[2];
      inputParam.eup_myun = "";
      inputParam.admin_name = "황상익";
      inputParam.admin_email = "mothcar@naver.com";
      inputParam.description = "";
      inputParam.location = {
        type: "Point",
        coordinates: [Number(center.coordLng), Number(center.coordLat)],
      };

      PublicPlace.create(inputParam).then((result) => {
        log("new infocenter reuslt : ", result);
      });
    }

    res.json({ msg: RCODE.OPERATION_SUCCEED, data: { item: "Done" } });
    // res.json({msg:RCODE.OPERATION_SUCCEED, data:{item:raw[100]}})
  } catch (err) {
    log("err=", err);
    res.status(500).json({ msg: RCODE.SERVER_ERROR, data: {} });
  }
}); //insertCenterToDb

// insert 세종 center 세종특별자치시만 구군단위가 없음  ***************************************************************
test.get("/insertSejongToDb", async (req, res) => {
  try {
    // log('test req.body= :', req.query)

    var newData = [];
    var fs = require("fs");
    const centerList = JSON.parse(fs.readFileSync("./judge.json", "utf8"));
    console.log("Read Json : ", centerList.length);
    const count = centerList.length;

    for (var i = 0; count > i; i++) {
      const center = centerList[i];
      console.log("center : ", center);
      let stAddress = center.address.replace(/  +/g, " ");
      let stRoadAddress = center.roadAddress.replace(/  +/g, " ");
      let addressArr = stAddress.split(" ");

      let inputParam = {};
      inputParam.is_public = true;
      inputParam.center_code = center.id;
      inputParam.place_name = center.name;
      inputParam.public_type = "8읍면동_동";
      inputParam.admin_address = stAddress;
      inputParam.road_address = stRoadAddress;
      inputParam.web_address = "";
      inputParam.tel = "";
      inputParam.zip = "";
      inputParam.r_depth_1 = "세종";
      inputParam.r_depth_2 = "";
      inputParam.r_depth_3 = addressArr[1];
      inputParam.eup_myun = "";
      inputParam.admin_name = "황상익";
      inputParam.admin_email = "mothcar@naver.com";
      inputParam.description = "";
      inputParam.location = {
        type: "Point",
        coordinates: [Number(center.coordLng), Number(center.coordLat)],
      };

      PublicPlace.create(inputParam).then((result) => {
        log("new infocenter reuslt : ", result);
      });
    }

    res.json({ msg: RCODE.OPERATION_SUCCEED, data: { item: "Done" } });
    // res.json({msg:RCODE.OPERATION_SUCCEED, data:{item:raw[100]}})
  } catch (err) {
    log("err=", err);
    res.status(500).json({ msg: RCODE.SERVER_ERROR, data: {} });
  }
}); //insertJudicialToDb

// insert 지방법원  ***************************************************************
test.get("/insertJudicialToDb", async (req, res) => {
  let standard_short = require("../helper/standardNM");
  try {
    // log('test req.body= :', req.query)

    var newData = [];
    var fs = require("fs");
    const centerList = JSON.parse(fs.readFileSync("./judge.json", "utf8"));
    console.log("Read Json : ", centerList.length);
    const count = centerList.length;

    for (var i = 0; count > i; i++) {
      const center = centerList[i];
      console.log("center : ", center);
      let stAddress = center.address.replace(/  +/g, " ");
      let stRoadAddress = center.roadAddress.replace(/  +/g, " ");
      let addressArr = stAddress.split(" ");
      let shortCityName = standard_short(addressArr[0])[0]

      let inputParam = {};
      inputParam.place_type = "PUBLIC";
      inputParam.gov_type = "JUDICIAL";
      inputParam.is_public = true;
      inputParam.center_code = center.id;
      inputParam.place_name = center.name;
      inputParam.public_type = "";
      inputParam.admin_address = stAddress.trim();
      inputParam.road_address = stRoadAddress.trim();
      inputParam.web_address = "";
      inputParam.tel = "";
      inputParam.zip = "";
      inputParam.r_depth_1 = shortCityName;
      inputParam.r_depth_2 = addressArr[1];
      inputParam.r_depth_3 = addressArr[2];
      inputParam.eup_myun = "";
      inputParam.admin_name = "황상익";
      inputParam.admin_email = "mothcar@naver.com";
      inputParam.description = "";
      inputParam.location = {
        type: "Point",
        coordinates: [Number(center.coordLng), Number(center.coordLat)],
      };

      PublicPlace.create(inputParam).then((result) => {
        log("new infocenter reuslt : ", result);
      });
    }

    res.json({ msg: RCODE.OPERATION_SUCCEED, data: { item: "Done" } });
    // res.json({msg:RCODE.OPERATION_SUCCEED, data:{item:raw[100]}})
  } catch (err) {
    log("err=", err);
    res.status(500).json({ msg: RCODE.SERVER_ERROR, data: {} });
  }
}); //insertSejongToDb

test.get("/insertCafeToDb", async (req, res) => {
  try {
    // log('test req.body= :', req.query)

    var newData = [];
    var fs = require("fs");
    const cafeList = JSON.parse(fs.readFileSync("./cafe_star.json", "utf8"));
    console.log("Read Json : ", cafeList.length);
    const count = cafeList.length;

    for (var i = 0; count > i; i++) {
      const cafe = cafeList[i];
      console.log("Cafe : ", cafe);
      let location = {
        type: "Point",
        coordinates: [Number(cafe.coordLng), Number(cafe.coordLat)],
      };
      let inputParam = {
        brand: cafe.brand,
        cafe_id: cafe.id,
        shop_name: cafe.name,
        tel: cafe.tel,
        //image : 'https://res.cloudinary.com/mothcar/image/upload/v1627121341/cafe_brand_logo/ediya_marker.png',
        image:
          "https://t1.daumcdn.net/localimg/localimages/07/mapapidoc/markerStar.png",
        address_admin: cafe.address,
        address_road: cafe.roadAddress,
        location: location,
        menu: cafe.menu,
      };

      Shop.create(inputParam).then((result) => {
        log("new infocenter reuslt : ", result);
      });
    }

    res.json({ msg: RCODE.OPERATION_SUCCEED, data: { item: newData } });
    // res.json({msg:RCODE.OPERATION_SUCCEED, data:{item:raw[100]}})
  } catch (err) {
    log("err=", err);
    res.status(500).json({ msg: RCODE.SERVER_ERROR, data: {} });
  }
}); //inserDB

// *****************************************************
// Admin insert DB
// *****************************************************

// import DB INIT

test.get("/insertDb", async (req, res) => {
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
test.get("/getAddre", async (req, res) => {
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
test.get("/getAddressByRequest", async (req, res) => {
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

test.get("/dic", async (req, res) => {
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

test.get("/newestUser", async (req, res) => {
  try {
    let user = await Users.find().sort({ $natural: -1 }).limit(1);

    res.json({ msg: RCODE.OPERATION_SUCCEED, data: { item: user[0] } });
  } catch (err) {
    log("err=", err);
    res.status(500).json({ msg: RCODE.SERVER_ERROR, data: {} });
  }
});

test.get("/oldestUser", async (req, res) => {
  try {
    let user = await Users.find().limit(1);

    res.json({ msg: RCODE.OPERATION_SUCCEED, data: { item: user[0] } });
  } catch (err) {
    log("err=", err);
    res.status(500).json({ msg: RCODE.SERVER_ERROR, data: {} });
  }
});

test.get("/randomUser", async (req, res) => {
  try {
    let count = await Users.countDocuments();
    let random = faker.random.number({ min: 0, max: count });
    let user = await Users.findOne().skip(random).limit(1);

    res.json({ msg: RCODE.OPERATION_SUCCEED, data: { item: user } });
  } catch (err) {
    log("err=", err);
    res.status(500).json({ msg: RCODE.SERVER_ERROR, data: {} });
  }
});

test.get("/newestPurchase", async (req, res) => {
  try {
    let purchase = await Purchases.find().sort({ $natural: -1 }).limit(1);

    res.json({ msg: RCODE.OPERATION_SUCCEED, data: { item: purchase[0] } });
  } catch (err) {
    log("err=", err);
    res.status(500).json({ msg: RCODE.SERVER_ERROR, data: {} });
  }
});

test.get("/oldestPurchase", async (req, res) => {
  try {
    let purchase = await Purchases.find().limit(1);

    res.json({ msg: RCODE.OPERATION_SUCCEED, data: { item: purchase[0] } });
  } catch (err) {
    log("err=", err);
    res.status(500).json({ msg: RCODE.SERVER_ERROR, data: {} });
  }
});

test.get("/excelTest", async (req, res) => {
  try {
    var request = require("request");
    var url = "http://221.140.81.171/tmp/exceltest.xlsx";
    request(url, { encoding: null }, function (err, res, data) {
      if (err || res.statusCode !== 200) return;

      /* data is a node Buffer that can be passed to XLSX.read */
      var workbook = xlsx.read(data, { type: "buffer" });

      //var workbook = XLSX.readFile('Master.xlsx');
      var sheet_name_list = workbook.SheetNames;
      var tmp = xlsx.utils.sheet_to_json(workbook.Sheets[sheet_name_list[0]]);

      log("tmp = ", tmp);
      //log('excelSheet =', workbook.Sheets["Sheet1"]['A1'].v)
      /* DO SOMETHING WITH workbook HERE */
    });
  } catch (err) {
    log("err=", err);
    res.status(500).json({ msg: RCODE.SERVER_ERROR, data: {} });
  }
});

// timestamp.get('/helper/confirmedVoices', tms.verifyToken)
test.get("/timestamp", async (req, res) => {
  try {
    let qry = {};
    let voices = [];
    let total = 0;
    qry = {};

    total = await Voices.countDocuments(qry);

    if (total < 1) return res.json({ msg: RCODE.NO_RESULT, data: {} });

    let limit = parseInt(req.query.limit);
    let page = parseInt(req.query.page);
    if (limit > total) limit = total;

    let pages = Math.ceil(total / limit);
    if (page > pages) page = pages;
    let skip = (page - 1) * limit;

    // init page info
    let pageInfo = {
      total: total,
      pages: pages,
      limit: limit,
      page: page,
    };

    voices = await Voices.find(qry, { __v: 0 }).limit(limit).skip(skip);

    if (voices.length < 1) return res.json({ msg: RCODE.NO_RESULT, data: {} });

    let newDateTime = new Date(voices[0].updatedAt);
    log(
      'dateFormat(newDateTime, "dddd, mmmm dS, yyyy, h:MM:ss TT")=',
      dateFormat(newDateTime, "dddd, mmmm dS, yyyy, h:MM:ss TT")
    );
    voices[0].updatedAt = dateFormat(
      newDateTime,
      "dddd, mmmm dS, yyyy, h:MM:ss TT"
    );

    //voices[0].updatedAt = new Date(voices[0].updatedAt) - new Date(voices[0].updatedAt)
    return res.json({
      msg: RCODE.OPERATION_SUCCEED,
      data: { pageInfo: pageInfo, items: voices },
    });
  } catch (err) {
    log("err=", err);
    res.status(500).json({ msg: RCODE.SERVER_ERROR, data: {} });
  }
});

// modify road_address ***********************************************
test.get("/modifyRoadAddress", async (req, res) => {
  try {
    console.log("modify RoadAddress..................");
    // let total = await Place.updateMany({}, [{$set: { road_address: { $trim: { input:'$road_address'}}}}], {upsert: false})
    // console.log('Result : ', total)
    const total = await Place.find({ r_depth_2: "동작구" });
    // const total = await PublicPlace.find()
    // console.log('Total : ', total)
    total.forEach(async (item, idx) => {
      // console.log('Road idx : ', idx)
      // console.log('Road Address : ', item.road_address)
      let trimAddress = item.road_address.trim();
      let splitAddress = trimAddress.split(" ");

      let cityName = splitAddress[0];
      let newCityName = cityName;
      switch (cityName) {
        case "서울":
          newCityName = "서울특별시"; // 서울특별시
          break;
        case "강원":
          newCityName = "강원도";
          break;
        case "경남":
          newCityName = "경상남도";
          break;
        case "전남":
          newCityName = "전라남도";
          break;
        case "전북":
          newCityName = "전라북도";
          break;
        case "경북":
          newCityName = "경상북도";
          break;
        case "충북":
          newCityName = "충청북도";
          break;
        case "충남":
          newCityName = "충청남도";
          break;
        // case '제주':
        //   newCityName = '제주도';
        //   break;
      }

      let allAddress = "";
      if (splitAddress.length == 4) {
        allAddress =
          newCityName +
          " " +
          splitAddress[1] +
          " " +
          splitAddress[2] +
          " " +
          splitAddress[3];
      } else if (splitAddress.length == 5) {
        allAddress =
          newCityName +
          " " +
          splitAddress[1] +
          " " +
          splitAddress[2] +
          " " +
          splitAddress[3] +
          " " +
          splitAddress[4];
      } else if (splitAddress.length == 3) {
        allAddress =
          newCityName + " " + splitAddress[1] + " " + splitAddress[2];
      }
      console.log("allAddress : ", allAddress);

      await PublicPlace.findOneAndUpdate({ road_address: item.road_address }, [
        { $set: { road_address: { $trim: { input: allAddress } } } },
      ]);
      return true;
    });

    // let Break = new Error('Break');

    // try {
    //   total.forEach(function(item,v) {
    //     if (v==2) {
    //       console.log('v: ', v)
    //       console.log('Road Address : ', item.road_address)
    //       throw Break;
    //     }
    //   });
    // } catch (e) {
    //   if (e!= Break) throw Break;
    // }

    return res.json({ msg: RCODE.OPERATION_SUCCEED, data: { items: "ggo" } });
  } catch (err) {
    log("err=", err);
    res.status(500).json({ msg: RCODE.SERVER_ERROR, data: {} });
  }
});

// modify Address ***********************************************
test.get("/modifyAddress", async (req, res) => {
  try {
    console.log("modifyAddress..................");
    // let total = await Place.updateMany({}, [{$set: { road_address: { $trim: { input:'$road_address'}}}}], {upsert: false})
    // console.log('Result : ', total)

    // Done : 동작구,구로구
    // 한구를 여러차례 나눠서 작업해야 함
    const total = await Place.find({
      r_depth_1: "서울",
      r_depth_2: "동작구",
      r_depth_3: "신대방2동",
    });

    total.forEach(async (item, idx) => {
      // console.log('Road idx : ', idx)
      // console.log('Road Address : ', item.road_address)
      let standard_address = require("../helper/standardNM");
      let allAddress = standard_address(item);
      console.log("This is : ", allAddress);

      let newCityName = "서울특별시";
      // await Place.findOneAndUpdate({admin_address: item.admin_address}, [{$set: {admin_address:{ $trim: { input:allAddress}}, r_depth_1: newCityName}}])
      await Place.findOneAndUpdate(
        { admin_address: item.admin_address },
        { $set: { admin_address: allAddress, r_depth_1: newCityName } }
      );
      // return false
    });
    console.log("Total length : ", total.length);
    return res.json({ msg: RCODE.OPERATION_SUCCEED, data: { items: "ggo" } });
  } catch (err) {
    log("err=", err);
    res.status(500).json({ msg: RCODE.SERVER_ERROR, data: {} });
  }
});

// Move MultiPlace from Place to Multiplace ***********************************************
test.get("/moveMulti", async (req, res) => {
  try {
    console.log("moveMulti ..................");
    const total = await Place.find({ place_type: "MULTI" });

    // Create to Multi Collection
    total.forEach(async (item, idx) => {
      
      // console.log('Road Address : ', item.road_address)
      let isAddress = await MultiPlace.findOne({admin_address:item.admin_address})
      if(isAddress) return
      console.log('Road idx : ', idx)

      let placeType = item.place_name.trim();
      let MultiType = "";
      if (placeType.indexOf("아파트") > 0) {
        MultiType = "아파트";
      }
      // else 면 nothing

      let createMultiParams = {
        place_name: item.place_name,
        place_type: MultiType, // 대학교, 아파트, 공원, 골프장
        admin_address: item.admin_address.trim(),
        road_address: item.road_address.trim(),
        // bj_code: qry.bj_code,
        r_depth_1: item.r_depth_1.trim(),
        r_depth_2: item.r_depth_2.trim(),
        r_depth_3: item.r_depth_3.trim(),
        // jibun:qry.jibun,
        // eup_myun:qry.eup_myun,
        // ri:qry.ri,
        location: item.location,
        owner_name: "황상익",
        owner_email: "mothcar@naver.com",
        interest: 1,
      };
      await MultiPlace.create(createMultiParams);
      console.log("created Multi !!");
      // remove id


    });
    console.log("Total length : ", total.length);
    return res.json({ msg: RCODE.OPERATION_SUCCEED, data: { items: "ggo" } });
  } catch (err) {
    log("err=", err);
    res.status(500).json({ msg: RCODE.SERVER_ERROR, data: {} });
  }
});

// Add Place Id to Multi Possess and Add parent id to Place ***********************************************
test.get("/addToPossess", async (req, res) => {
  try {
    console.log("addToPossess ..................");
    // Done : 동작구,구로구
    // 한구를 여러차례 나눠서 작업해야 함
    const total = await MultiPlace.find({
      r_depth_1: "서울",
      r_depth_2: "동작구",
    });
    // const total = await MultiPlace.find({
    //   admin_address:'서울특별시 관악구 봉천동 1698-1'
    // });

    total.forEach(async (item, idx) => {
      let places = await Place.find({admin_address:item.admin_address})
      if(places.length >0) {
        let arr = []
        places.forEach(async (place, idx2) => {
          await Place.findOneAndUpdate( {_id:place._id},{ parent_id: new ObjectId(item._id) } ) 
          arr.push(new ObjectId(place._id) )
        })
        // await MultiPlace.findOneAndUpdate( {_id:item._id},{ $push: { possess: arr }} ) 
        await MultiPlace.findOneAndUpdate( {_id:item._id},{ possess: arr } ) 
      }else return 
      console.log('Road idx : ', idx)
    }); // End forEach *********************************************************
    console.log("Total length : ", total.length);
    return res.json({ msg: RCODE.OPERATION_SUCCEED, data: { items: "ggo" } });
  } catch (err) {
    log("err=", err);
    res.status(500).json({ msg: RCODE.SERVER_ERROR, data: {} });
  }
});



// user_img array   / https://res.cloudinary.com/mothcar/image/upload/v1686077342/moham/users/wonbin.jpg

test.get("/insertUserImg", async (req, res) => {
  try {
    console.log("modifyAddress..................");
    let qry = req.query 

    const user = await Users.updateOne({_id: qry.id}, {$push: { user_img: qry.img }});

    return res.json({ msg: RCODE.OPERATION_SUCCEED, data: { items: user } });
  } catch (err) {
    log("err=", err);
    res.status(500).json({ msg: RCODE.SERVER_ERROR, data: {} });
  }
});

// Add parent id to Place ***********************************************


module.exports = test;
