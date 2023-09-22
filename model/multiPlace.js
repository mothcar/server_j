'use strict'

let initSchema = async ()=>{
  const multiPlace = new mongoose.Schema({
    place_type:     {type:String, default:'MULTI'},               // MULTI, PLACE, PUBLIC,
    is_public:      {type:Boolean, default:false},                // type : nolmal place 
    multi_type:     {type:String, default:''},                    // 대학교, 공원, 아파트, 
    place_name:     {type:String, default:''},                    // 장소명 
    place_code:     {type:String, default:''},                    // 01000(다가구주택), 02000(주거시설), 03000(주민센터),
    admin_address:  {type:String, default:''},                    // address
    road_address:   {type:String, default:''},                    // 도로명주소 서울시 동작구 여의대방로22나길 74
    web_address:    {type:String, default:''},                    // 홈페이지주소
    tel:            {type:String, default:''},                    //
    zip:            {type:String, default:''},                    //
    bj_code:        {type:String, default:''},                    // 법정동코드
    r_depth_1:      {type:String, default:''},                    // depth of address1
    r_depth_2:      {type:String, default:''},                    // depth of address2
    r_depth_3:      {type:String, default:''},                    // depth of address3
    eup_myun:       {type:String, default:''},                    // 읍면
    ri:             {type:String, default:''},                    // 리
    jibun:          {type:String, default:''},                    // depth of address4
    location:       {type:Object, default:{}},                    // coords
    polylines:      [{type:Object, default:{}}],                  // Polyline 경계
    description:    {type:String, default:''},                    // description
    image:          {type:Array, default:[]},                     // content image
    possess:        [{type:mongoose.Schema.Types.ObjectId, ref:'place'}],// 시설 - {floor: 1, name : 'CU', type: '편의점'}
    owner:          [{type:mongoose.Schema.Types.ObjectId, ref:'users'}],  // 소유자 
    member:         [{type:mongoose.Schema.Types.ObjectId, ref:'users'}], // community member 
    admin_id:       [{type:mongoose.Schema.Types.ObjectId, ref:'users'}], // 관리자 _id
    post:           [{type:mongoose.Schema.Types.ObjectId, ref:'post'}],  //post
    history:        [{type:mongoose.Schema.Types.ObjectId, ref:'history'}], // history

    s_code:          {type:String},                               // ?
    s_gubun:         {type:String},                               // ?
    value:           {type:String},                               // ?

    interest:        {type:Number, default: 0},                   // 관심도
    price:           {type:Array, default:[]},                    // 건물가격
    current_price:   {type:Array, default:[]},                    // 최근 거래가

    child:           {type:Number, default:0},                   // 부속 건물수
    houses:          {type:Number, default:0},                   // 세대수
    bld_plot_area :  {type:Number, default:0},                   // 연면적
    bld_area :       {type:Number, default:0},                   // 건축면적
    bld_total_area : {type:Number, default:0},                   // 총면적
    bld_yong :       {type:Number, default:0},                   // 용적율
    bld_gunpe :      {type:Number, default:0},                   // 건폐율
    bld_park :       {type:Number, default:0},                   // 주차대수
    bld_park_area :  {type:Number, default:0},                   // 주차면적
  }, {timestamps: true, minimize: false})

  try{
    const list = await mongoose.connection.db.listCollections().toArray()
    let index = _.findIndex(list, {name:'multiPlace'})
    if(index < 0)
        multiPlace.index({admin_id:1, admin_address:1, location : "2dsphere" })
    else
        log('init schema (multiPlace): collection found. creation skipped')

    global.MultiPlace = mongoose.model('multiPlace', multiPlace)
    return new Promise((resolve, reject)=>{resolve('done')})
  }
  catch(err){
    log('err:', err)
  }
}

module.exports = initSchema()
