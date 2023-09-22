'use strict'

const faker = require('faker')
const express = require('express')
const xlsx = require('xlsx')
const ledger = express.Router({})
const dateFormat = require('dateformat');
const common = require('../helper/common')
const users = require('../model/users')


//--------------------------------------------------
// ledger functions
//--------------------------------------------------
// Get user's All Record getRecord 
ledger.get('/getRecord', async (req, res) => {
  try {
    let records = await Ledger.find().sort({_id:-1}).limit(10)
    res.json({ msg: RCODE.OPERATION_SUCCEED, data: { item: records } })
  }
  catch (err) {
    log('err=', err)
    res.status(500).json({ msg: RCODE.SERVER_ERROR, data: {} })
  }
})


// Find user Record 
ledger.get('/findUserRecord', async (req, res) => {
  let qry = req.query
  console.log('Bank find user...')
  console.log('Bank req.query', qry)
  
  let params = {
    service_name: qry.service_name,
    user_id : qry.user_id
  } 
  try {
    let records = await Ledger.find(params)
    console.log('Bank Record... :', records)
    res.json({ msg: RCODE.OPERATION_SUCCEED, data: { item: records } })
  }
  catch (err) {
    log('err=', err)
    res.status(500).json({ msg: RCODE.SERVER_ERROR, data: {} })
  }
})

// Create Account  
ledger.post('/createAccount', async (req, res) => {
  let time_obj = common.getToday();

  log('test : req.query :', req.body)
  let qry = req.body

  try {

    let params = {
      service_id:   qry.service_id,
      service_name: qry.service_name,
      user_id :     qry.user_id,
      content:      qry.content,
      description:  qry.description,
      type:         'GET',
      amount:       3000,
      balance:      3000, 
      trans_date:   time_obj.date,
      trans_time:   time_obj.time
    }
    // To calculate 
    // params.balance = 10000
    let record = await Ledger.create(params)
    res.json({ msg: RCODE.OPERATION_SUCCEED, data: { item: record } })

  }
  catch (err) {
    log('err=', err)
    res.status(500).json({ msg: RCODE.SERVER_ERROR, data: {} })
  }
})

// insert Record 
ledger.post('/insertRecord', async (req, res) => {
  log('test : req.query :', req.body)
  let time_obj = common.getToday();
  let qry = req.body

  try {

    let params = {
      service_id:   qry.service_id,
      service_name: qry.service_name,
      user_id :     qry.user_id,
      content:      qry.content,
      description:  qry.description,
      type:         qry.type,
      amount:       qry.amount,
      balance:      qry.balance, 
      trans_date:   time_obj.date,
      trans_time:   time_obj.time
    }

    console.log('Trans date : ', time_obj.date)

    let record = await Ledger.create(params)
    res.json({ msg: RCODE.OPERATION_SUCCEED, data: { item: record } })

  }
  catch (err) {
    log('err=', err)
    res.status(500).json({ msg: RCODE.SERVER_ERROR, data: {} })
  }
})








module.exports = ledger
