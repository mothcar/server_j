'use strict'

global.mongoose = require('mongoose')
const bluebird = require('bluebird')

// promisify for async await
mongoose.Promise = bluebird.Promise

const initMongo = async ()=>{
  try{
    // Cloudtype M16 
    await mongoose.connect('mongodb+srv://dragonleeuman:1748asdf@cluster0.2iz7jx7.mongodb.net/dolsing?retryWrites=true&w=majority', {useNewUrlParser: true, useUnifiedTopology: true})
    // cafe24 정식서버 **************************
    // await mongoose.connect('mongodb://mothcar:1748@127.0.0.1:27017/s686?authSource=admin', {useNewUrlParser: true, useUnifiedTopology: true})
    // mongoose.set('useCreateIndex', true)
    // mongoose.set('useFindAndModify', false);
    log('init mongodb: ' + MONGODB.HOST + ':' + MONGODB.PORT) 
    
    // init schema
    await require('../model/users')
    await require('../model/place')
    await require('../model/publicPlace')
    await require('../model/facility')
    await require('../model/history')
    await require('../model/application')
    await require('../model/place')
    await require('../model/multiPlace')
    await require('../model/outdoor')
    await require('../model/post')
    await require('../model/ledger')
    await require('../model/simpleMsg')
    await require('../model/reply')
    await require('../model/notice')
    await require('../model/ads')
    await require('./initTestDate')

    log('init schema DONE.')
  }
  catch(err){
    throw err
  }
}

module.exports = initMongo()
