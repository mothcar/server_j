'use strict'

const faker   = require('faker')
const express = require('express')
const xlsx    = require('xlsx')
const test    = express.Router({})
const dateFormat = require('dateformat');

var dotenv = require('dotenv')
dotenv.config()


//--------------------------------------------------
// get Env
//--------------------------------------------------
test.get('/aa', async (req, res)=>{
  try{
    // declaration 2 line
    var dotenv = require('dotenv')
    dotenv.config()

    // then get data from .env
    log('@@ Env : ', process.env.API_KEY)
    res.json({msg:RCODE.OPERATION_SUCCEED, data:{item:'Good Server~~~'}})
  }
  catch(err){
    log('err=',err)
    res.status(500).json({msg: RCODE.SERVER_ERROR, data:{}})
  }
})

//--------------------------------------------------
// get 공공data
//--------------------------------------------------
test.get('/', async (req, res)=>{
  try{
    log('test req.body=', req.body)
    // var myKey = process.env.BUILDING_INFO_API
    var myKey = "S9EORKDWDn2xoJXvsM66ouTCMcgDfuGYqBdB6owI1J3LyuZ9F6c4IqVaFaX%2BHfO2xsBk%2FxgRdUqx3w9Oc9v1Gw%3D%3D";
    var url = 'http://apis.data.go.kr/B552015/NpsBplcInfoInqireService/getPdAcctoSttusInfoSearch'; /*URL*/
    var queryParams1 = '?' + encodeURIComponent('ServiceKey') + '='+myKey; /*Service Key*/
    queryParams1 += '&' + encodeURIComponent('seq') + '=' + encodeURIComponent('17735069'); /*식별번호*/
    queryParams1 += '&' + encodeURIComponent('data_crt_ym') + '=' + encodeURIComponent('201806'); /*년월(yyyymm)*/


    var request = require('request');
    // var url = 'http://apis.data.go.kr/B552015/NpsBplcInfoInqireService/getBassInfoSearch';
    var url = 'http://apis.data.go.kr/1611000/BldRgstService/getBrHsprcInfo';

    var queryParams1 =  {
      ServiceKey: decodeURIComponent(myKey),
      // typename: 'F166',
      // seq: encodeURIComponent('17735069'),
      // data_crt_ym: encodeURIComponent('201806'),
      wkpl_nm: encodeURIComponent('삼구골프클럽')

    };

    var queryParams = '?' + encodeURIComponent('ServiceKey') + '=' + myKey; /* Service Key*/
    // queryParams += '&' + encodeURIComponent('ldong_addr_mgpl_dg_cd') + '=' + encodeURIComponent('41'); /* 시도(행정자치부 법정동 주소코드 참조) */
    // queryParams += '&' + encodeURIComponent('ldong_addr_mgpl_sggu_cd') + '=' + encodeURIComponent('117'); /* 시군구(행정자치부 법정동 주소코드 참조) */
    // queryParams += '&' + encodeURIComponent('ldong_addr_mgpl_sggu_emd_cd') + '=' + encodeURIComponent('101'); /* 읍면동(행정자치부 법정동 주소코드 참조) */
    queryParams += '&' + encodeURIComponent('wkpl_nm') + '=' + encodeURIComponent('삼성전자'); /* 사업장명 */
    queryParams += '&' + encodeURIComponent('bzowr_rgst_no') + '=' + encodeURIComponent('124815'); /* 사업자등록번호(앞에서 6자리) */
    queryParams += '&' + encodeURIComponent('pageNo') + '=' + encodeURIComponent('10'); /* 페이지번호 */
    queryParams += '&' + encodeURIComponent('numOfRows') + '=' + encodeURIComponent('1'); /* 행갯수 */

    request({url:url + queryParams, method: 'GET'}, function(err, response, body) {
      if(err) { console.log(err); return; }

      // sails.log.info('20181002 -  Status: '+response.statusCode+' Body: '+JSON.stringify(response))
      console.log('20181002 -  Status: '+response.statusCode+' Body: '+response)
      console.log("Get response: " + response);
      // res.ok(JSON.stringify(response.pnu))
      // res.ok(body)
      res.json({msg:RCODE.OPERATION_SUCCEED, data:{item:body}})
    });

  }
  catch(err){
    log('err=',err)
    res.status(500).json({msg: RCODE.SERVER_ERROR, data:{}})
  }
})


// *****************************************************
// Admin insert DB
// *****************************************************
// import DB INIT
test.get('/insertDb', async (req, res)=>{
  try{
    log('test req.body= :', req.body)

    const fetch = require("node-fetch");
    // var url = 'https://apis.openapi.sk.com/tmap/geo/convertAddress?version=1&format=json&callback=result'
    var API_KEY = process.env.SK_API_KEY

    var newData = []

    const csvFilePath='./admini.csv';
    const csv=require('csvtojson')
    const converter=csv({
        noheader:true,
        // delimiter: '\n',
        delimiter: ','
    })

    let raw = await csv().fromFile(csvFilePath)

    // raw.forEach(row=>{
    //   // console.log('raw : ', );
    // })

    // for(var i=0; data.length>i;i++){
    //
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

    console.log('@@ length ; ', raw.length)

    // 12,649여개를 불러오면 limit 에 걸릴까봐 일부러 적은 수를 Loop test하기위해 조정 : 3610까지 0개이고 이후로 10씩 증가했는데 3개 나옴
    // for(var i=0; raw.length>i;i++) {
    for(var i=0; 3615>i;i++) {
    // for(var i=0; 3>i;i++) {
      var list = ['1시도_시','2시도_도','3시군구_시','4시군구_군','5시군구_구','6읍면동_읍','7읍면동_면','8읍면동_동','9읍면동_센터']
      var check = raw[i].유형_2

      if(list.includes(check)) {
        // newData.push(Object.values(raw[i])[8])
        // newData.push(raw[i])
        // console.log('@@@ start')
        // console.log('@@@ adress : ', Object.values(raw[i])[8])

        var params = "&appKey=" + API_KEY;
        params = params + '&searchTypCd=' + 'NtoO';
        params = params + '&reqAdd=' + encodeURIComponent(Object.values(raw[i])[8]);

        await fetch(`https://api2.sktelecom.com/tmap/geo/convertAddress?version=1&format=json&callback=result`+params, {
          headers: {
            Authorization: `${API_KEY}`
          }
        })
        .then(response => response.json())
        .then(json => {
           // 받은 json으로 기능 구현
           newData.push(json)

           var inputParam = {}
           var intCode = parseInt(raw[i].기관코드)
           var intZip = parseInt(Object.values(raw[i])[7])
           inputParam.center_code = intCode.toString()
           inputParam.type        = raw[i].유형_2
           inputParam.name        = raw[i].최하위기관명
           inputParam.full_address = json.ConvertAdd.primary
           inputParam.road_address = Object.values(raw[i])[8]
           inputParam.tel         = raw[i].대표전화번호
           inputParam.zip         = intZip.toString()
           inputParam.bjcode = ''
           inputParam.floor = ''
           inputParam.place_type = ''
           inputParam.r_depth_1 = ''
           inputParam.r_depth_2 = ''
           inputParam.r_depth_3 = ''
           // inputParam.admin_id =  ''
           inputParam.admin_name = ''
           inputParam.infocenter_level =  '' // tab-1 or tab-2
           inputParam.description = ''
           inputParam.image = ''

           var pre_lat = json.ConvertAdd.newAddressList.newAddress[0].newLat
           var lat = Number(pre_lat)
           var pre_lng = json.ConvertAdd.newAddressList.newAddress[0].newLon
           var lng = Number(pre_lng)

           inputParam.location = {
             type: 'Point',
             coordinates: [lng,lat]
           }

           // find if no
           Infocenter.create(inputParam)
           .then(result=>{
             log('new infocenter reuslt : ', result)
           })

             // return res.status(200).json({msg:RCODE.OPERATION_SUCCEED, data:{item:result}})
           // this.setState({
           //   place_name: json.documents.place_name,
           //   ...
           // });
        })  // end of then


      }


      // var quiz = {}
      // var start = raw[i].field4.lastIndexOf("(A)")
      // var end = raw[i].field4.length
      // var m_choice = raw[i].field4.slice(start, end)
      // var fullString = m_choice

      // var fullLength = fullString.length
      // var bStart = fullString.indexOf('(B)')
      // var cStart = fullString.indexOf('(C)')
      // var dStart = fullString.indexOf('(D)')
      //
      // let originText = raw[i].field4.slice(0, start-1)
      // let removeLine = originText.replace(/^.*====.*$/mg, '<br />');
      // let minusText = removeLine.replace(/^.*-----.*$/mg, '<br />');
      // let finalText = minusText.replace(/(?:\r\n|\r|\n)/g, '<br />')


      // let rawNewLineText = raw[i].field4.slice(0, start-1)
      // let newLineText = rawNewLineText.replace(/(?:\r\n|\r|\n)/g, '<br />')
      // var lines = newLineText.split('\n');
      // var lines = newLineText.split('\n');
      //
      // for(var i = 0;i < lines.length;i++){
      //     console.log(lines[i].indexOf('===='))
      //     if(lines[i].indexOf('====')==0 ||lines[i].indexOf('----')==0) {
      //       lines[i] = '<br />'
      //     }
      // }
      // var newtext = lines.join('\n');

      // newData.push(quiz)

      // Question.create(quiz)
    }


    // request(url, function(err, respon, data) {
    //   // if(err || res.statusCode !== 200) return;
    //   if(err || respon.statusCode !== 200) {
    //     console.log('@@@ Error : ', respon)
    //   };
    //   newData.push(data)
    // });

    // console.log('## newData : ', newData)
    // Question.insertMany(newData)

    // let name = []
    // name.push(row.field2)
    // let row2 = name[99]
    // console.log('Result : ', row2)

    res.json({msg:RCODE.OPERATION_SUCCEED, data:{item:newData}})
    // res.json({msg:RCODE.OPERATION_SUCCEED, data:{item:raw[100]}})
  }
  catch(err){
    log('err=',err)
    res.status(500).json({msg: RCODE.SERVER_ERROR, data:{}})
  }
}) //inserDB












test.get('/newestUser', async (req, res)=>{
  try{
    let user = await Users.find().sort({$natural:-1}).limit(1)

    res.json({msg:RCODE.OPERATION_SUCCEED, data:{item:user[0]}})
  }
  catch(err){
    log('err=',err)
    res.status(500).json({msg: RCODE.SERVER_ERROR, data:{}})
  }
})



test.get('/oldestUser', async (req, res)=>{
  try{
    let user = await Users.find().limit(1)

    res.json({msg:RCODE.OPERATION_SUCCEED, data:{item:user[0]}})
  }
  catch(err){
    log('err=',err)
    res.status(500).json({msg: RCODE.SERVER_ERROR, data:{}})
  }
})

test.get('/randomUser', async (req, res)=>{
  try{
    let count = await Users.countDocuments()
    let random = faker.random.number({min:0, max:count})
    let user = await Users.findOne().skip(random).limit(1)

    res.json({msg:RCODE.OPERATION_SUCCEED, data:{item:user}})
  }
  catch(err){
    log('err=',err)
    res.status(500).json({msg: RCODE.SERVER_ERROR, data:{}})
  }
})

test.get('/newestPurchase', async (req, res)=>{
  try{
    let purchase = await Purchases.find().sort({$natural:-1}).limit(1)

    res.json({msg:RCODE.OPERATION_SUCCEED, data:{item:purchase[0]}})
  }
  catch(err){
    log('err=',err)
    res.status(500).json({msg: RCODE.SERVER_ERROR, data:{}})
  }
})

test.get('/oldestPurchase', async (req, res)=>{
  try{
    let purchase = await Purchases.find().limit(1)

    res.json({msg:RCODE.OPERATION_SUCCEED, data:{item:purchase[0]}})
  }
  catch(err){
    log('err=',err)
    res.status(500).json({msg: RCODE.SERVER_ERROR, data:{}})
  }
})


test.get('/excelTest', async (req, res)=>{
  try{
      var request = require('request');
      var url = 'http://221.140.81.171/tmp/exceltest.xlsx'
      request(url, {encoding: null}, function(err, res, data) {
      	if(err || res.statusCode !== 200) return;

      	/* data is a node Buffer that can be passed to XLSX.read */
      	var workbook = xlsx.read(data, {type:'buffer' });

        //var workbook = XLSX.readFile('Master.xlsx');
        var sheet_name_list = workbook.SheetNames;
        var tmp = xlsx.utils.sheet_to_json(workbook.Sheets[sheet_name_list[0]])

        log('tmp = ', tmp)
        //log('excelSheet =', workbook.Sheets["Sheet1"]['A1'].v)
      	/* DO SOMETHING WITH workbook HERE */




      });
  }
  catch(err){
    log('err=',err)
    res.status(500).json({msg: RCODE.SERVER_ERROR, data:{}})
  }
})


// timestamp.get('/helper/confirmedVoices', tms.verifyToken)
test.get('/timestamp', async (req, res)=>{
  try{
    let qry = {}
    let voices = []
    let total = 0
    qry = {}


    total = await Voices.countDocuments(qry)

    if(total < 1)
      return res.json({msg:RCODE.NO_RESULT, data:{}})

    let limit = parseInt(req.query.limit)
    let page  = parseInt(req.query.page)
    if(limit > total) limit = total

    let pages = Math.ceil(total / limit)
    if(page > pages) page = pages
    let skip = (page - 1) * limit

    // init page info
    let pageInfo = {
      total: total,
      pages: pages,
      limit: limit,
      page:  page
    }

    voices = await Voices.find(qry, {__v:0}).limit(limit).skip(skip)

    if(voices.length < 1)
      return res.json({msg:RCODE.NO_RESULT, data:{}})

    let newDateTime=new Date(voices[0].updatedAt)
    log('dateFormat(newDateTime, "dddd, mmmm dS, yyyy, h:MM:ss TT")=', dateFormat(newDateTime, "dddd, mmmm dS, yyyy, h:MM:ss TT"))
    voices[0].updatedAt = dateFormat(newDateTime, "dddd, mmmm dS, yyyy, h:MM:ss TT")

    //voices[0].updatedAt = new Date(voices[0].updatedAt) - new Date(voices[0].updatedAt)
    return res.json({msg:RCODE.OPERATION_SUCCEED, data:{pageInfo:pageInfo, items:voices}})
  }
  catch(err){
    log('err=',err)
    res.status(500).json({msg: RCODE.SERVER_ERROR, data:{}})
  }
})


module.exports = test
