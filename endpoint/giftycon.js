'use strict'

const faker   = require('faker')
const express = require('express')
const xlsx    = require('xlsx')
const giftycon = express.Router({})
const dateFormat = require('dateformat');

//--------------------------------------------------
// Gifgycon  functions
//--------------------------------------------------
giftycon.post('/createGiftycon', async (req, res)=> {
  log('test : req.body :', req.body)
  // log('test : req.query :', req.query)
  let qry = req.body

  let params = {
    type: qry.type,
    giftycon_name: qry.giftycon_name,
    expiry_date: qry.expiry_date,
    pin_no: qry.pin_no,
    image_url: qry.image_url,
  }

  try{
    // let infocenter = await Infocenter.find().sort({$natural:-1}).limit(1)
    let giftycon = await Giftycon.create(params)
    let giftList = await Giftycon.find({isUsed:false}).sort({$natural:-1})
    res.json({msg:RCODE.OPERATION_SUCCEED, data:{item:giftList}})

  }
  catch(err){
    log('err=',err)
    res.status(500).json({msg: RCODE.SERVER_ERROR, data:{}})
  }
})


giftycon.get('/getAllGiftycon', async (req, res)=> {
  log('Server getAllGiftycon :', req.query)
  // log('test : req.query :', req.query)
  // let qry = req.body/

  try{
    let giftycon = await Giftycon.find({isUsed:false}).sort({$natural:-1})
    res.json({msg:RCODE.OPERATION_SUCCEED, data:{item:giftycon}})

  }
  catch(err){
    log('err=',err)
    res.status(500).json({msg: RCODE.SERVER_ERROR, data:{}})
  }
})

//Update Gifticon
giftycon.post('/useGifticon', async (req, res)=> {
  log('test : req.body :', req.body)
  // log('test : req.query :', req.query)
  let qry = req.body

  let id = qry.id

  // let params = {
  //   type: qry.type,
  //   giftycon_name: qry.giftycon_name,
  //   expiry_date: qry.expiry_date,
  //   pin_no: qry.pin_no,
  //   image_url: qry.image_url,
  // }

  try{
    // let infocenter = await Infocenter.find().sort({$natural:-1}).limit(1)
    let giftcon = await Giftycon.findOne({_id: id})
    let updateGiftycon = await Giftycon.updateOne({_id: giftcon._id}, {isUsed: true})
    let giftList = await Giftycon.find({isUsed:false}).sort({$natural:-1})
    res.json({msg:RCODE.OPERATION_SUCCEED, data:{item:giftList}})
    
  }
  catch(err){
    log('err=',err)
    res.status(500).json({msg: RCODE.SERVER_ERROR, data:{}})
  }
})


giftycon.get('/getBrandGifticon', async (req, res)=> {
  log('Server getBrandGifticon :', req.query)
  // log('test : req.query :', req.query)
  let qry = req.query

  try{
    // let giftycon = await Giftycon.find({isUsed:false}).sort({$natural:-1})
    let giftycon = await Store.find({ $and: [{brand:qry.brand},{isUsed:false}]}).sort({$natural:-1})
    res.json({msg:RCODE.OPERATION_SUCCEED, data:{item:giftycon}})

  }
  catch(err){
    log('err=',err)
    res.status(500).json({msg: RCODE.SERVER_ERROR, data:{}})
  }
})




















//--------------------------------------------------
// Temp Store  functions
//--------------------------------------------------

giftycon.post('/storeGifticon', async (req, res)=> {
  log('test : req.body :', req.body)
  // log('test : req.query :', req.query)
  let qry = req.body

  let params = {
    brand:          qry.brand,
    giftycon_name:  qry.giftycon_name,        
    expiry_date:    qry.expiry_date,             
    image_url:      qry.image_url,                       
    origin_price:   qry.origin_price,                       
    sale_price:     qry.sale_price,                       
  }

  /*
  let brandImage = {
    STARBUCKS:'https://res.cloudinary.com/mothcar/image/upload/w_50,h_50,c_scale/v1619281249/Starbucks_fiwd8y.png',
    IDIYA:'https://res.cloudinary.com/mothcar/image/upload/w_50,h_50,c_scale/v1619330974/%EC%9D%B4%EB%94%94%EC%95%BC_rboxbx.png',
  }
  
  */ 

  try{
    // let infocenter = await Infocenter.find().sort({$natural:-1}).limit(1)
    let giftycon = await Store.create(params)
    let giftList = await Store.find({isUsed:false}).sort({$natural:-1})
    res.json({msg:RCODE.OPERATION_SUCCEED, data:{item:giftList}})
  }
  catch(err){
    log('err=',err)
    res.status(500).json({msg: RCODE.SERVER_ERROR, data:{}})
  }
})











//--------------------------------------------------
// old shop date  functions
//--------------------------------------------------
giftycon.post('/createShop', async (req, res)=> {
  log('test : req.body :', req.body)
  // log('test : req.query :', req.query)
  let qry = req.body

  let params = {
    zip: qry.zip_code,
    tel: qry.telephone,
    shop_name: qry.shopName,
    address_admin: qry.address_admin,
    address_road: qry.address_road,
    location: {
      type: 'Point',
      coordinates: [Number(qry.lng),Number(qry.lat)]
    }
  }

  try{
    let giftycon = await Giftycon.create(params)
    res.json({msg:RCODE.OPERATION_SUCCEED, data:{item:giftycon}})

  }
  catch(err){
    log('err=',err)
    res.status(500).json({msg: RCODE.SERVER_ERROR, data:{}})
  }
})


giftycon.get('/getMarker', async (req, res)=> {
  log('test : req.query :', req.query)

  let b_lat = Number(req.query.b_lat)
  let b_lng = Number(req.query.b_lng)
  let t_lat = Number(req.query.t_lat)
  let t_lng = Number(req.query.t_lng)
  // res.ok(params)
  log('lat Type : ', typeof b_lat)

  var giftycon = await Giftycon.find({
     location: { $geoWithin: { $box:  [ [ b_lng,b_lat ], [ t_lng,t_lat ] ] } }
  })
  // var places = await Place.find({
  //    location: { $geoWithin: { $box:  [ [ b_lng,b_lat ], [ t_lng,t_lat ] ] } }
  // })

  // var lotMarker = shop.concat(places)
  log('position return : ', giftycon)
  res.status(200).json({msg:RCODE.OPERATION_SUCCEED, data:{item:giftycon}})

})

giftycon.get('/getShop', async(req, res)=>{
  // log('test : req.body :', req.body)
  log('test : req.query :', req.query)
  let qry = req.query

  try{
    let giftycon = await Giftycon.findOne(qry)
    res.json({msg:RCODE.OPERATION_SUCCEED, data:{item:giftycon}})

  }
  catch(err){
    log('err=',err)
    res.status(500).json({msg: RCODE.SERVER_ERROR, data:{}})
  }
})


module.exports = giftycon
