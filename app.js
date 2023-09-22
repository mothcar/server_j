'use strict'

// init modules
const path        = require('path')
const https       = require('https')
const http        = require('http')
const fs          = require('fs')
global._          = require('lodash')
global.bluebird   = require('bluebird')
const helmet      = require('helmet')
const express     = require('express')
const bodyParser  = require('body-parser')
const cors        = require('cors')
const app         = express()

// init bootup
console.log('========================================')
console.log('node version: ' + process.version)
require('./bootup/initLocal')
require('./bootup/initGlobal')
require('./bootup/initMongo')
require('./bootup/initAxios')

// init express
app.use(helmet())
app.use(bodyParser.json({limit: '50mb'}))
app.use(bodyParser.urlencoded({extended:true}))
app.use(cors())

var router = express.Router();

router.use('/admin',         require('./endpoint/admin'))
router.use('/auth',          require('./endpoint/auth'))
router.use('/users',         require('./endpoint/users'))
router.use('/place',         require('./endpoint/place'))
router.use('/multiPlace',    require('./endpoint/multiPlace'))
router.use('/facility',      require('./endpoint/facility'))
router.use('/giftycon',      require('./endpoint/giftycon'))
router.use('/publicPlace',   require('./endpoint/publicPlace'))
router.use('/test',          require('./endpoint/test'))
router.use('/helper',        require('./endpoint/helper'))
router.use('/linkpreview',   require('./endpoint/linkPreview'))
router.use('/managedb',      require('./endpoint/managedb'))
router.use('/post',          require('./endpoint/post'))
router.use('/ledger',        require('./endpoint/ledger'))
router.use('/reply',         require('./endpoint/reply'))
router.use('/notice',        require('./endpoint/notice'))
router.use('/application',   require('./endpoint/application'))
router.use('/ads',           require('./endpoint/ads'))

app.use('/v1', router);

// start app
log('APP.USE_SSL', APP.USE_SSL)

if(APP.USE_SSL){
  // init SSL
  let ssl = {
    key:  fs.readFileSync(path.join(__dirname, 'cert', SSL.KEY)),
    cert: fs.readFileSync(path.join(__dirname, 'cert', SSL.CERT))
  }

  https.createServer(ssl, app).listen(APP.PORT, ()=>{
    log(`init REST: https://${APP.HOST}:${APP.PORT}`)
  })
}
else{
  http.createServer(app).listen(APP.PORT, ()=>{
    log(`init REST: http://${APP.HOST}:${APP.PORT}`)
  })
}
