"use strict";

const faker = require("faker");
const express = require("express");
const xlsx = require("xlsx");
const publicPlace = express.Router({});
const dateFormat = require("dateformat");
const axios = require("axios");

//--------------------------------------------------
//   functions
//--------------------------------------------------

publicPlace.get("/getPublicByAddress", async (req, res) => {
  try {
    const qry = req.query;
    // console.log("getPublicByAddress Qry : ", qry);
    //         $or:[{public_type:'3시군구_시'},{public_type:'4시군구_군'},{public_type:'5시군구_구'}]

    let publicCenter = await PublicPlace.findOne({
      r_depth_1: qry.r_depth_1,
      r_depth_2: qry.r_depth_2,
      r_depth_3: qry.r_depth_3,
      $or: [
        { public_type: "6읍면동_읍" },
        { public_type: "7읍면동_면" },
        { public_type: "8읍면동_동" },
      ],
    });
    if (!publicCenter) {
      publicCenter = await PublicPlace.findOne({
        r_depth_1: qry.r_depth_1,
        r_depth_2: qry.r_depth_2,
        $or: [
          { public_type: "3시군구_시" },
          { public_type: "4시군구_군" },
          { public_type: "5시군구_구" },
        ],
      });
    }
    res.json({ msg: RCODE.OPERATION_SUCCEED, data: { item: publicCenter } });
  } catch (err) {
    log("err=", err);
    res.status(500).json({ msg: RCODE.SERVER_ERROR, data: {} });
  }
}); // getPublicByAddress

publicPlace.get("/getOnePublic", async (req, res) => {
  try {
    const qry = req.query;
    console.log("getOnePublic Qry : ", qry);

    const publicCenter = await PublicPlace.findOne({
      _id: qry._id,
    });
    res.json({ msg: RCODE.OPERATION_SUCCEED, data: { item: publicCenter } });
  } catch (err) {
    log("err=", err);
    res.status(500).json({ msg: RCODE.SERVER_ERROR, data: {} });
  }
}); // getPublic

publicPlace.get("/getCenterByDepth", async (req, res) => {
  try {
    const qry = req.query;
    console.log("getCenterByDepth Qry : ", qry);

    const publicCenter = await PublicPlace.findOne({
      r_depth_1: qry.r_depth_1,
      r_depth_2: qry.r_depth_2,
      r_depth_3: qry.r_depth_3,
    });
    res.json({ msg: RCODE.OPERATION_SUCCEED, data: { item: publicCenter } });
  } catch (err) {
    log("err=", err);
    res.status(500).json({ msg: RCODE.SERVER_ERROR, data: {} });
  }
}); // getPublic

publicPlace.get("/getSido", async (req, res) => {
  try {
    const qry = req.query;
    console.log("getSido Qry : ", qry);

    const publicCenters = await PublicPlace.find({
      $or: [{ public_type: "1시도_시" }, { public_type: "2시도_도" }],
    });
    res.json({ msg: RCODE.OPERATION_SUCCEED, data: { item: publicCenters } });
  } catch (err) {
    log("err=", err);
    res.status(500).json({ msg: RCODE.SERVER_ERROR, data: {} });
  }
}); // getSido

publicPlace.get("/getGugun", async (req, res) => {
  try {
    const qry = req.query;
    console.log("getGugun Qry : ", qry);

    const publicCenters = await PublicPlace.find({
      r_depth_1: qry.r_depth_1,
      $or: [
        { public_type: "3시군구_시" },
        { public_type: "4시군구_군" },
        { public_type: "5시군구_구" },
      ],
    });
    res.json({ msg: RCODE.OPERATION_SUCCEED, data: { item: publicCenters } });
  } catch (err) {
    log("err=", err);
    res.status(500).json({ msg: RCODE.SERVER_ERROR, data: {} });
  }
}); // getGugun

// getChiefById
publicPlace.get("/getChiefById", async (req, res) => {
  try {
    const qry = req.query;
    console.log("getChiefById Qry : ", qry);

    const user = await Users.findOne(qry).populate('job');
    res.json({ msg: RCODE.OPERATION_SUCCEED, data: { item: user } });
  } catch (err) {
    log("err=", err);
    res.status(500).json({ msg: RCODE.SERVER_ERROR, data: {} });
  }
}); // getGugun

publicPlace.get("/getDong", async (req, res) => {
  try {
    const qry = req.query;
    console.log("getDong Qry : ", qry);

    const publicCenters = await PublicPlace.find({
      r_depth_1: qry.r_depth_1,
      r_depth_2: qry.r_depth_2,
      $or: [
        { public_type: "6읍면동_읍" },
        { public_type: "7읍면동_면" },
        { public_type: "8읍면동_동" },
        { public_type: "9읍면동_센터" },
      ],
    });
    res.json({ msg: RCODE.OPERATION_SUCCEED, data: { item: publicCenters } });
  } catch (err) {
    log("err=", err);
    res.status(500).json({ msg: RCODE.SERVER_ERROR, data: {} });
  }
}); // getDong

// publicPlace.get("/getCenter", async (req, res) => {
//   try {
//     const qry = req.query;
//     console.log("getCenter Qry : ", qry);
//     let useless_params = {
//       r_depth_1: qry.r_depth_1,
//       r_depth_2: qry.r_depth_2,
//       r_depth_3: qry.r_depth_3,
//       $or: [
//         { public_type: "6읍면동_읍" },
//         { public_type: "7읍면동_면" },
//         { public_type: "8읍면동_동" },
//         { public_type: "9읍면동_센터" },
//       ],
//     }

//     const publicCenters = await PublicPlace.find(qry);
//     res.json({ msg: RCODE.OPERATION_SUCCEED, data: { item: publicCenters } });
//   } catch (err) {
//     log("err=", err);
//     res.status(500).json({ msg: RCODE.SERVER_ERROR, data: {} });
//   }
// }); // getCenter

// publics to Marker by level Once Done Ready .................
publicPlace.get("/getPublics", async (req, res) => {
  // log('test : req.query :', req.query)
  let b_lat = Number(req.query.b_lat);
  let b_lng = Number(req.query.b_lng);
  let t_lat = Number(req.query.t_lat);
  let t_lng = Number(req.query.t_lng);

  let level = req.query.levelType;
  // log('lat Type : ', typeof b_lat)

  var markers = await PublicPlace.find({
    level: { $lte: level },
    location: {
      $geoWithin: {
        $box: [
          [b_lng, b_lat],
          [t_lng, t_lat],
        ],
      },
    },
  }).populate("possess post");
  // console.log("Markers : ", markers.length);
  // var places = await Place.find({
  //    location: { $geoWithin: { $box:  [ [ b_lng,b_lat ], [ t_lng,t_lat ] ] } }
  // })

  const newArr = [];
  // item["spaces"] = [];
  // console.log("item : ", item);
  // if (typeArr.length > 0) {
  //   typeArr.forEach((ele) => {
  //     markers.map((item) => {
  //       if (item.public_type === ele) {
  //         // obj.spaces.push({ name: object.name });
  //         // let obj = item.spaces
  //         newArr.push(item);
  //       }
  //     });
  //   });
  // }

  // log("newArr return : ", markers.length);
  res
    .status(200)
    .json({ msg: RCODE.OPERATION_SUCCEED, data: { item: markers } });
}); // getPublics

// editPlaceName
publicPlace.post("/editPlaceName", async (req, res) => {
  try {
    var qry = req.body;
    // console.log('Qry : ', qry)

    // let infocenter = await Infocenter.find().sort({$natural:-1}).limit(1)
    let place = await PublicPlace.findOneAndUpdate(
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

// editPosition
publicPlace.post("/editPosition", async (req, res) => {
  try {
    var qry = req.body;
    // console.log('Qry : ', qry)
    let location = {
      type: "Point",
      coordinates: [Number(qry.lng), Number(qry.lat)],
    };
    // console.log('location : ', location)
    let updateParams = {
      admin_address: qry.admin_address,
      r_depth_1: qry.r_depth_1,
      r_depth_2: qry.r_depth_2,
      r_depth_3: qry.r_depth_3,
      location: location,
    };

    let place = await PublicPlace.findOneAndUpdate(
      { _id: qry._id },
      updateParams
    );
    res.json({ msg: RCODE.OPERATION_SUCCEED, data: { item: place } });
    // res.status(200).json({ msg: RCODE.OPERATION_SUCCEED, data: { item: place } });
  } catch (err) {
    log("err=", err);
    res.status(500).json({ msg: RCODE.SERVER_ERROR, data: {} });
  }
});

publicPlace.post("/editPlaceInfo", async (req, res) => {
  try {
    var qry = req.body;
    // console.log('Qry : ', qry)
    let place = await PublicPlace.findOneAndUpdate({_id:qry._id}, qry.content)
    res.json({ msg: RCODE.OPERATION_SUCCEED, data: { item: place } });
    // res.status(200).json({ msg: RCODE.OPERATION_SUCCEED, data: { item: place } });
  } catch (err) {
    log("err=", err);
    res.status(500).json({ msg: RCODE.SERVER_ERROR, data: {} });
  }
});

//--------------------------------------------------
//   Insert DB by Manual
//--------------------------------------------------

// Source from test : This version is edited / Origin is in test
publicPlace.get("/insertDb", async (req, res) => {
  try {
    // log("test req.body= :", req.query);

    const fetch = require("node-fetch");
    // var url = 'https://apis.openapi.sk.com/tmap/geo/convertAddress?version=1&format=json&callback=result'
    var API_KEY = process.env.SK_API_KEY;
    // console.log("Get env : ", API_KEY);

    const csvFilePath = "./admini.csv";
    const csv = require("csvtojson");
    const converter = csv({
      noheader: true,
      // delimiter: '\n',
      delimiter: ",",
    });

    let raw = await csv().fromFile(csvFilePath);

    console.log("@@ length ; ", raw.length);

    // 12,649여개를 불러오면 limit 에 걸릴까봐 일부러 적은 수를 Loop test하기위해 조정 : 3610까지 0개이고 이후로 10씩 증가했는데 3개 나옴
    // 3615 , 3900  End 9964 포항시까지
    // 전체 작업 50분 소요
    // for (let i = 4419; raw.length > i; i++) {
    // for(let i=0; raw.length>i;i++) {
    for (var i = 4386; 4387 > i; i++) {
      let list = [
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
      let check = raw[i].기관유형별분류;
      // console.log('raw[i] ', raw[i])

      if (list.includes(check)) {
        console.log("i : ", i);
        // console.log(
        //   "Object.values(raw[i])[0]",
        //   parseInt(Object.values(raw[i])[0]).toString()
        // );
        // let isRecord = await PublicPlace.findOne({center_code:Object.values(raw[i])[0]})
        // console.log('isRecord : ',i+'  '+ isRecord)

        let poiKeyword = encodeURIComponent(Object.values(raw[i])[3]); // 경남 함양 행복복지센터

        console.log("raw[i] : ", raw[i]);

        let getPoiApi = `https://apis.openapi.sk.com/tmap/pois?version=1&appKey=${API_KEY}&searchKeyword=${poiKeyword}&searchType=all&searchtypCd=A&page=1&count=5&reqCoordType=WGS84GEO&resCoordType=WGS84GEO&multiPoint=N&poiGroupYn=N`;

        let result = await axios.get(getPoiApi);
        // console.log("result : ", result.data.searchPoiInfo)
        // if(typeof result.data.searchPoiInfo?.pois === "undefined") continue

        let onePoi;

        if (typeof result.data.searchPoiInfo?.pois.poi[0] === "undefined") {
          poiKeyword = encodeURIComponent(Object.values(raw[i])[7]); // 주소
          getPoiApi = `https://apis.openapi.sk.com/tmap/pois?version=1&appKey=${API_KEY}&searchKeyword=${poiKeyword}&searchType=all&searchtypCd=A&page=1&count=5&reqCoordType=WGS84GEO&resCoordType=WGS84GEO&multiPoint=N&poiGroupYn=N`;

          result = await axios.get(getPoiApi);
          // console.log("result : ", result.data.searchPoiInfo);
          onePoi = result.data.searchPoiInfo.pois.poi[0];
        } else {
          onePoi = result.data.searchPoiInfo.pois.poi[0];
        }
        console.log("onePoi : ", onePoi);

        let level;
        switch (raw[i].기관유형별분류) {
          case list[0]:
            level = 1;
            break;
          case list[1]:
            level = 2;
            break;
          case list[2]:
            level = 3;
            break;
          case list[3]:
            level = 4;
            break;
          case list[4]:
            level = 5;
            break;
          case list[5]:
            level = 6;
            break;
          case list[6]:
            level = 7;
            break;
          case list[7]:
            level = 8;
            break;
          case list[8]:
            level = 9;
            break;
        }

        var inputParam = {};
        // var intCode = parseInt(raw[i].기관코드);
        // var intZip = parseInt(Object.values(raw[i])[7]);
        // inputParam.center_code = intCode.toString();
        inputParam.public_type = raw[i].기관유형별분류; // ['1시도_시','2시도_도','3시군구_시','4시군구_군','5시군구_구','6읍면동_읍','7읍면동_면','8읍면동_동','9읍면동_센터']
        inputParam.place_name = raw[i].최하위기관명;
        // inputParam.admin_address = onePoi.newAddressList.newAddress[0].fullAddressRoad;
        inputParam.road_address =
          onePoi.newAddressList.newAddress[0].fullAddressRoad; // raw[i].도로명주소
        inputParam.tel = raw[i].대표전화번호;
        inputParam.zip = onePoi.zipCode;
        inputParam.level = level;
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

        const inputData = await PublicPlace.create(inputParam);
        log("new infocenter reuslt : ", inputData);
      } // end of if
    }

    res.json({ msg: RCODE.OPERATION_SUCCEED, data: { item: "Done!!" } });
    // res.json({msg:RCODE.OPERATION_SUCCEED, data:{item:raw[100]}})
  } catch (err) {
    log("err=", err);
    res.status(500).json({ msg: RCODE.SERVER_ERROR, data: {} });
  }
}); //inserDB

//--------------------------------------------------
// 공공테이터 functions
//--------------------------------------------------
publicPlace.get("/getTest", async (req, res) => {
  try {
    // log('BubJungDong code:', req.query)
    // let qry = req.query
    // let devide = qry.queryType

    let payload = [];

    var XMLHttpRequest = require("xmlhttprequest").XMLHttpRequest;
    let servicekey =
      "S9EORKDWDn2xoJXvsM66ouTCMcgDfuGYqBdB6owI1J3LyuZ9F6c4IqVaFaX%2BHfO2xsBk%2FxgRdUqx3w9Oc9v1Gw%3D%3D";

    // var xhr = new XMLHttpRequest();
    // var url = 'http://apis.data.go.kr/1611000/BldRgstService/getBrRecapTitleInfo'; /*URL*/
    // var url = 'http://apis.data.go.kr/1611000/BldRgstService/'+devide; /*URL*/

    // var url = 'http://apis.data.go.kr/1611000/BldRgstService/getBrRecapTitleInfo'; /*URL*/

    // var url = 'http://apis.data.go.kr/1611000/nsdi/ReferLandPriceService/wms/getReferLandPriceWMS'; /*URL*/

    // var url = 'http://apis.data.go.kr/1611000/BldRgstService/getBrBasisOulnInfo'; /*building info */
    var url =
      "http://apis.data.go.kr/1611000/nsdi/ReferLandPriceService/attr/getReferLandPriceAttr";

    function makeRequest(method, url, done) {
      var xhr = new XMLHttpRequest();
      // var queryParams = '?' + encodeURIComponent('ServiceKey') + '='+servicekey; /*Service Key*/
      // queryParams += '&' + encodeURIComponent('sigunguCd') + '=' + encodeURIComponent('11590'); /*행정표준코드*/
      // queryParams += '&' + encodeURIComponent('bjdongCd') + '=' + encodeURIComponent('10900'); /*행정표준코드*/
      // queryParams += '&' + encodeURIComponent('platGbCd') + '=' + encodeURIComponent('0'); /*0:대지 1:산 2:블록*/
      // queryParams += '&' + encodeURIComponent('bun') + '=' + encodeURIComponent('0395'); /*번*/
      // queryParams += '&' + encodeURIComponent('ji') + '=' + encodeURIComponent('0069'); /*지*/
      // queryParams += '&' + encodeURIComponent('startDate') + '=' + encodeURIComponent(''); /*YYYYMMDD*/
      // queryParams += '&' + encodeURIComponent('endDate') + '=' + encodeURIComponent(''); /*YYYYMMDD*/
      // queryParams += '&' + encodeURIComponent('numOfRows') + '=' + encodeURIComponent('30'); /*페이지당 목록 수*/
      // queryParams += '&' + encodeURIComponent('pageNo') + '=' + encodeURIComponent('1'); /*페이지번호*/
      // queryParams += '&' + '_type=json'
      var queryParams =
        "?" +
        encodeURIComponent("ServiceKey") +
        "=" +
        servicekey; /*Service Key*/
      queryParams +=
        "&" +
        encodeURIComponent("ldCode") +
        "=" +
        encodeURIComponent("1159010900"); /* 법정동코드(2~10자리) */
      queryParams +=
        "&" +
        encodeURIComponent("stdrYear") +
        "=" +
        encodeURIComponent("2018"); /* 기준년도(YYYY: 4자리) */
      queryParams +=
        "&" +
        encodeURIComponent("format") +
        "=" +
        encodeURIComponent("json"); /* 응답결과 형식(xml 또는 json) */
      queryParams +=
        "&" +
        encodeURIComponent("numOfRows") +
        "=" +
        encodeURIComponent("100"); /* 검색건수 */
      queryParams +=
        "&" +
        encodeURIComponent("pageNo") +
        "=" +
        encodeURIComponent("1"); /* 페이지 번호 */
      // queryParams += '&' + encodeURIComponent('jibun') + '=' + encodeURIComponent('395'); /*0:대지 1:산 2:블록*/
      // queryParams += '&' + encodeURIComponent('bubun') + '=' + encodeURIComponent('69'); /*번*/
      // queryParams += '&' + '_type=json'
      xhr.open("GET", url + queryParams);
      xhr.onreadystatechange = function () {
        if (this.readyState == 4) {
          // alert('Status: '+this.status+' Headers: '+JSON.stringify(this.getAllResponseHeaders())+' Body: '+this.responseText);
          let data = JSON.parse(this.responseText);
          // console.log("### Server Return : ", this.responseText);
          // console.log('### RESULT : ',data.response.body.items)
          // payload = data.response.body.items.item
          payload = data;
          done(null, payload);
          // res.json({msg:RCODE.OPERATION_SUCCEED, data:{item: data.response.body.items.item}})
        }
      };

      xhr.send();
    }

    makeRequest("GET", url, function (err, datums) {
      if (err) {
        throw err;
      }
      // console.log(datums);
      res.json({ msg: RCODE.OPERATION_SUCCEED, data: { item: datums } });
    });

    // Result Type Sample
    let temp = {
      response: {
        header: { resultCode: "00", resultMsg: "NORMAL SERVICE." },
        body: {
          items: {
            item: [
              {
                bjdongCd: 10300,
                bldNm: "대청아파트 제302동",
                block: " ",
                bun: "0012",
                bylotCnt: 0,
                crtnDay: 20171206,
                hsprc: 324000000,
                ji: "0000",
                lot: " ",
                mgmBldrgstPk: "11680-195341",
                naBjdongCd: 10301,
                naMainBun: 21,
                naRoadCd: 116804166040,
                naSubBun: 0,
                naUgrndCd: 0,
                newPlatPlc: " 서울특별시 강남구 개포로109길 21",
                platGbCd: 0,
                platPlc: "서울특별시 강남구 개포동 12번지",
                regstrGbCd: 2,
                regstrGbCdNm: "집합",
                regstrKindCd: 4,
                regstrKindCdNm: "전유부",
                rnum: 1,
                sigunguCd: 11680,
                splotNm: " ",
              },
              {
                bjdongCd: 10300,
                bldNm: "대청아파트 제301동",
                block: " ",
                bun: "0012",
                bylotCnt: 0,
                crtnDay: 20171206,
                hsprc: 352000000,
                ji: "0000",
                lot: " ",
                mgmBldrgstPk: "11680-184703",
                naBjdongCd: 10301,
                naMainBun: 21,
                naRoadCd: 116804166040,
                naSubBun: 0,
                naUgrndCd: 0,
                newPlatPlc: " 서울특별시 강남구 개포로109길 21",
                platGbCd: 0,
                platPlc: "서울특별시 강남구 개포동 12번지",
                regstrGbCd: 2,
                regstrGbCdNm: "집합",
                regstrKindCd: 4,
                regstrKindCdNm: "전유부",
                rnum: 2,
                sigunguCd: 11680,
                splotNm: " ",
              },
              {
                bjdongCd: 10300,
                bldNm: "대청아파트 제301동",
                block: " ",
                bun: "0012",
                bylotCnt: 0,
                crtnDay: 20171206,
                hsprc: 364000000,
                ji: "0000",
                lot: " ",
                mgmBldrgstPk: "11680-184714",
                naBjdongCd: 10301,
                naMainBun: 21,
                naRoadCd: 116804166040,
                naSubBun: 0,
                naUgrndCd: 0,
                newPlatPlc: " 서울특별시 강남구 개포로109길 21",
                platGbCd: 0,
                platPlc: "서울특별시 강남구 개포동 12번지",
                regstrGbCd: 2,
                regstrGbCdNm: "집합",
                regstrKindCd: 4,
                regstrKindCdNm: "전유부",
                rnum: 3,
                sigunguCd: 11680,
                splotNm: " ",
              },
              {
                bjdongCd: 10300,
                bldNm: "대청아파트 제301동",
                block: " ",
                bun: "0012",
                bylotCnt: 0,
                crtnDay: 20171206,
                hsprc: 348000000,
                ji: "0000",
                lot: " ",
                mgmBldrgstPk: "11680-184635",
                naBjdongCd: 10301,
                naMainBun: 21,
                naRoadCd: 116804166040,
                naSubBun: 0,
                naUgrndCd: 0,
                newPlatPlc: " 서울특별시 강남구 개포로109길 21",
                platGbCd: 0,
                platPlc: "서울특별시 강남구 개포동 12번지",
                regstrGbCd: 2,
                regstrGbCdNm: "집합",
                regstrKindCd: 4,
                regstrKindCdNm: "전유부",
                rnum: 4,
                sigunguCd: 11680,
                splotNm: " ",
              },
              {
                bjdongCd: 10300,
                bldNm: "대청아파트 제302동",
                block: " ",
                bun: "0012",
                bylotCnt: 0,
                crtnDay: 20171206,
                hsprc: 289000000,
                ji: "0000",
                lot: " ",
                mgmBldrgstPk: "11680-195451",
                naBjdongCd: 10301,
                naMainBun: 21,
                naRoadCd: 116804166040,
                naSubBun: 0,
                naUgrndCd: 0,
                newPlatPlc: " 서울특별시 강남구 개포로109길 21",
                platGbCd: 0,
                platPlc: "서울특별시 강남구 개포동 12번지",
                regstrGbCd: 2,
                regstrGbCdNm: "집합",
                regstrKindCd: 4,
                regstrKindCdNm: "전유부",
                rnum: 5,
                sigunguCd: 11680,
                splotNm: " ",
              },
              {
                bjdongCd: 10300,
                bldNm: "대청아파트 제302동",
                block: " ",
                bun: "0012",
                bylotCnt: 0,
                crtnDay: 20171206,
                hsprc: 380000000,
                ji: "0000",
                lot: " ",
                mgmBldrgstPk: "11680-195341",
                naBjdongCd: 10301,
                naMainBun: 21,
                naRoadCd: 116804166040,
                naSubBun: 0,
                naUgrndCd: 0,
                newPlatPlc: " 서울특별시 강남구 개포로109길 21",
                platGbCd: 0,
                platPlc: "서울특별시 강남구 개포동 12번지",
                regstrGbCd: 2,
                regstrGbCdNm: "집합",
                regstrKindCd: 4,
                regstrKindCdNm: "전유부",
                rnum: 6,
                sigunguCd: 11680,
                splotNm: " ",
              },
              {
                bjdongCd: 10300,
                bldNm: "대청아파트 제301동",
                block: " ",
                bun: "0012",
                bylotCnt: 0,
                crtnDay: 20171206,
                hsprc: 362000000,
                ji: "0000",
                lot: " ",
                mgmBldrgstPk: "11680-184645",
                naBjdongCd: 10301,
                naMainBun: 21,
                naRoadCd: 116804166040,
                naSubBun: 0,
                naUgrndCd: 0,
                newPlatPlc: " 서울특별시 강남구 개포로109길 21",
                platGbCd: 0,
                platPlc: "서울특별시 강남구 개포동 12번지",
                regstrGbCd: 2,
                regstrGbCdNm: "집합",
                regstrKindCd: 4,
                regstrKindCdNm: "전유부",
                rnum: 7,
                sigunguCd: 11680,
                splotNm: " ",
              },
              {
                bjdongCd: 10300,
                bldNm: "대청아파트 제301동",
                block: " ",
                bun: "0012",
                bylotCnt: 0,
                crtnDay: 20171206,
                hsprc: 380000000,
                ji: "0000",
                lot: " ",
                mgmBldrgstPk: "11680-184675",
                naBjdongCd: 10301,
                naMainBun: 21,
                naRoadCd: 116804166040,
                naSubBun: 0,
                naUgrndCd: 0,
                newPlatPlc: " 서울특별시 강남구 개포로109길 21",
                platGbCd: 0,
                platPlc: "서울특별시 강남구 개포동 12번지",
                regstrGbCd: 2,
                regstrGbCdNm: "집합",
                regstrKindCd: 4,
                regstrKindCdNm: "전유부",
                rnum: 8,
                sigunguCd: 11680,
                splotNm: " ",
              },
              {
                bjdongCd: 10300,
                bldNm: "대청아파트 제302동",
                block: " ",
                bun: "0012",
                bylotCnt: 0,
                crtnDay: 20171206,
                hsprc: 338000000,
                ji: "0000",
                lot: " ",
                mgmBldrgstPk: "11680-195451",
                naBjdongCd: 10301,
                naMainBun: 21,
                naRoadCd: 116804166040,
                naSubBun: 0,
                naUgrndCd: 0,
                newPlatPlc: " 서울특별시 강남구 개포로109길 21",
                platGbCd: 0,
                platPlc: "서울특별시 강남구 개포동 12번지",
                regstrGbCd: 2,
                regstrGbCdNm: "집합",
                regstrKindCd: 4,
                regstrKindCdNm: "전유부",
                rnum: 9,
                sigunguCd: 11680,
                splotNm: " ",
              },
              {
                bjdongCd: 10300,
                bldNm: "대청아파트 제306동",
                block: " ",
                bun: "0012",
                bylotCnt: 0,
                crtnDay: 20171206,
                hsprc: 549000000,
                ji: "0000",
                lot: " ",
                mgmBldrgstPk: "11680-184822",
                naBjdongCd: 10301,
                naMainBun: 21,
                naRoadCd: 116804166040,
                naSubBun: 0,
                naUgrndCd: 0,
                newPlatPlc: " 서울특별시 강남구 개포로109길 21",
                platGbCd: 0,
                platPlc: "서울특별시 강남구 개포동 12번지",
                regstrGbCd: 2,
                regstrGbCdNm: "집합",
                regstrKindCd: 4,
                regstrKindCdNm: "전유부",
                rnum: 10,
                sigunguCd: 11680,
                splotNm: " ",
              },
            ],
          },
          numOfRows: 10,
          pageNo: 1,
          totalCount: 46133,
        },
      },
    };
  } catch (err) {
    log("err=", err);
    res.status(500).json({ msg: RCODE.SERVER_ERROR, data: {} });
  }
});

module.exports = publicPlace;
