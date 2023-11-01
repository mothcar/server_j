'use strict'

let initSchema = async ()=>{
  const place = new mongoose.Schema({
    category:       {type:String, default:'GENERAL'},             // 유형 type 아파트, 빌라, 
    place_name:     {type:String, default:''},                    // 장소명 
    admin_address:  {type:String, default:''},                    // address
    road_address:   {type:String, default:''},                    // 도로명주소 서울시 동작구 여의대방로22나길 74
    web_address:    {type:String, default:''},                    // 홈페이지주소
    tel:            {type:String, default:''},                    //
    zip:            {type:String, default:''},                    //
    r_depth_1:      {type:String, default:''},                    // depth of address 1
    r_depth_2:      {type:String, default:''},                    // depth of address2
    r_depth_3:      {type:String, default:''},                    // depth of address3
    eup_myun:       {type:String, default:''},                    // 읍면
    ri:             {type:String, default:''},                    // 리
    jibun:          {type:String, default:''},                    // depth of address
    location:       {type:Object, default:{}},                    // coords
    description:    {type:String, default:''},                    // description
    image:          {type:Array, default:[]},                     // content image
    reply:          [{type:mongoose.Schema.Types.ObjectId, ref:'reply', autopopulate: true}],// 댓글
    owner:          {type:mongoose.Schema.Types.ObjectId, ref:'users'},    // 소유자 
    owner_img:      {type:Array, default:[]},                     // 오너 image
    member:         [{type:mongoose.Schema.Types.ObjectId, ref:'users'}],    // community member 
    post:           [{type:mongoose.Schema.Types.ObjectId, ref:'post'}],     // post
    visitors:       {type:Array, default:[]},                     // 방문자
    history:        [{type:mongoose.Schema.Types.ObjectId, ref:'history'}],  // history

    interest:        {type:Number, default: 0},                   // 관심도

  }, {timestamps: true, minimize: false})

  /*
    view_level              : { type: 'string', defaultsTo: '' },
  */ 


  try{
    const list = await mongoose.connection.db.listCollections().toArray()
    let index = _.findIndex(list, {name:'place'})
    if(index < 0) {
      place.index({place_name:1,description:1, location : "2dsphere" })
      place.plugin(require('mongoose-autopopulate'))
    } else log('init schema (place): collection found. creation skipped')

    global.Place = mongoose.model('place', place)
    return new Promise((resolve, reject)=>{resolve('done')})
  }
  catch(err){
    log('err:', err)
  }
}

module.exports = initSchema()
