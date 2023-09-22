'use strict'

let initSchema = async ()=>{
  const facility = new mongoose.Schema({
    place_type:     {type:String, default:'FACIL'},              // MULTI, PLACE, PUBLIC,
    parent_id:      {type:mongoose.Schema.Types.ObjectId, ref:'place'}, // 부모id
    category:       {type:String, default:'facility'},            // 유형 type 아파트, 빌라, 
    facility_name:  {type:String, default:''},                    // 최하위기관명
    admin_address:  {type:String, default:''},                    // address
    road_address:   {type:String, default:''},                    // 도로명주소 서울시 동작구 여의대방로22나길 74
    email:          {type:String, default:''},                    // 대표이메일
    tel:            {type:String, default:''},                    //
    zip:            {type:String, default:''},                    //
    r_depth_1:      {type:String, default:''},                    // depth of address
    r_depth_2:      {type:String, default:''},                    // depth of address
    r_depth_3:      {type:String, default:''},                    // depth of address
    location:       {type:Object, default:{}},                    // coords
    description:    {type:String, default:''},                    // description
    image:          {type:Array, default:[]},                     // content image
    bldg_no:        {type:String, default:''},                    // 동명
    floor:          {type:Number, default: 1},                    // 층수
    no:             {type:String, default: ''},                   // 호수
    interest:       {type:Number, default: 0},                    // 관심도
    area :          {type:Number, default:0},                     // 면적
    price:          {type:Array, default:[]},                     // 가격 
    current_price:  {type:Number, default:0},                     // 최근 거래가
    possess:        [{type:mongoose.Schema.Types.ObjectId, ref:'facility'}], // 전체 층수
    menu:           {type:Array, default:[]},                    // content image
    post:           [{type:mongoose.Schema.Types.ObjectId, ref:'post'}], //post
    history:        [{type:mongoose.Schema.Types.ObjectId, ref:'history'}], // history
    owner:          [{type:mongoose.Schema.Types.ObjectId, ref:'users'}],  // 소유자 
    owner_image:    {type:String, default:''},                    // 소유자 이미지 
    owner_name:     {type:String, default:''},                    // 이름
    owner_email:    {type:String, default:''},                    // 이메일
    admin_id:       [{type:mongoose.Schema.Types.ObjectId, ref:'users'}], // 관리자 _id
    admin_name:     {type:String, default:''},                    // 생성자 _id 
    admin_email:    {type:String, default:''},                    // 관리자 이메일
    admin_photo:    {type:String, default:''},                    // 관리자 사진
    member:         [{type:mongoose.Schema.Types.ObjectId, ref:'users'}],  // community member
  }, {timestamps: true, minimize: false})

  /*
        address                 : { type: 'string', defaultsTo: [] },
        creator_photo           : { type: 'string', defaultsTo: '' },
        view_level              : { type: 'string', defaultsTo: '' },
        views                   : { type: 'integer', defaultsTo: 0 },
        replys                  : { type: 'integer', defaultsTo: 0 },
  */

  try{
    const list = await mongoose.connection.db.listCollections().toArray()
    let index = _.findIndex(list, {name:'facility'})
    if(index < 0)
    facility.index({admin_id:1,image:1, location : "2dsphere" })
    else
      log('init schema (voices.products): collection found. creation skipped')

    global.Facility = mongoose.model('facility', facility)
    return new Promise((resolve, reject)=>{resolve('done')})
  }
  catch(err){
    log('err:', err)
  }
}

module.exports = initSchema()
