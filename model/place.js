'use strict'

let initSchema = async ()=>{
  const place = new mongoose.Schema({
    place_type:     {type:String, default:'PLACE'},               // MULTI, PLACE, PUBLIC,
    is_public:      {type:Boolean, default:false},                // type : nolmal place 
    parent_id:      {type:mongoose.Schema.Types.ObjectId, ref:'multiPlace'}, // parent Id 
    category:       {type:String, default:'GENERAL'},             // 유형 type 아파트, 빌라, 
    mgm_id:         {type:String, default:''},                    // 건축물대장 id  
    place_name:     {type:String, default:''},                    // 장소명 
    sub_name:       {type:String, default:''},                    // 멀티를 위한 sub name 
    place_code:     {type:String, default:''},                    // 01000(다가구주택), 02000(주거시설), 03000(주민센터),
    admin_address:  {type:String, default:''},                    // address
    road_address:   {type:String, default:''},                    // 도로명주소 서울시 동작구 여의대방로22나길 74
    sub_address:    {type:String, default:''},                    // multi를 위한 sub address
    web_address:    {type:String, default:''},                    // 홈페이지주소
    tel:            {type:String, default:''},                    //
    zip:            {type:String, default:''},                    //
    bj_code:        {type:String, default:''},                    // 법정동코드
    r_depth_1:      {type:String, default:''},                    // depth of address 1
    r_depth_2:      {type:String, default:''},                    // depth of address2
    r_depth_3:      {type:String, default:''},                    // depth of address3
    eup_myun:       {type:String, default:''},                    // 읍면
    ri:             {type:String, default:''},                    // 리
    jibun:          {type:String, default:''},                    // depth of address
    a_type:         {type:String, default:''},                    // 분양형태 분양 / 임대 
    location:       {type:Object, default:{}},                    // coords
    description:    {type:String, default:''},                    // description
    image:          {type:Array, default:[]},                     // content image
    possess:        [{type:mongoose.Schema.Types.ObjectId, ref:'facility'}], // 내부 시설 - {floor: 1, name : 'CU', type: '편의점'}
    owner:          [{type:mongoose.Schema.Types.ObjectId, ref:'users'}],    // 소유자 
    member:         [{type:mongoose.Schema.Types.ObjectId, ref:'users'}],    // community member 
    admin_id:       [{type:mongoose.Schema.Types.ObjectId, ref:'users'}],    // 관리자 _id
    post:           [{type:mongoose.Schema.Types.ObjectId, ref:'post'}],     // post
    history:        [{type:mongoose.Schema.Types.ObjectId, ref:'history'}],  // history

    s_code:          {type:String},                               // ?
    s_gubun:         {type:String},                               // ?
    value:           {type:String},                               // ?

    interest:        {type:Number, default: 0},                   // 관심도
    price:           {type:Array, default:[]},                    // 건물가격
    current_price:   {type:Array, default:[]},                    // 최근 거래가

    child:           {type:Number, default:0},                   // 부속 시설수
    houses:          {type:Number, default:0},                   // 세대수
    bldg:            [{type:mongoose.Schema.Types.ObjectId, ref:'place'}],  // self possess  
    bldg_no:         {type:String, default:''},                  // 동명
    bld_plot_area :  {type:Number, default:0},                   // 연면적
    bld_area :       {type:Number, default:0},                   // 건축면적
    bld_total_area : {type:Number, default:0},                   // 총면적
    bld_yong :       {type:Number, default:0},                   // 용적율
    bld_gunpe :      {type:Number, default:0},                   // 건폐율
    bld_floor :      {type:Number, default:0},                   // 층수
    bld_under :      {type:Number, default:0},                   // 지하층수
    bld_park :       {type:Number, default:0},                   // 주차대수
    bld_park_area :  {type:Number, default:0},                   // 주차면적
  }, {timestamps: true, minimize: false})

  /*
    view_level              : { type: 'string', defaultsTo: '' },
  */ 


  try{
    const list = await mongoose.connection.db.listCollections().toArray()
    let index = _.findIndex(list, {name:'place'})
    if(index < 0)
    place.index({admin_id:1,image:1, location : "2dsphere" })
    else
      log('init schema (place): collection found. creation skipped')

    global.Place = mongoose.model('place', place)
    return new Promise((resolve, reject)=>{resolve('done')})
  }
  catch(err){
    log('err:', err)
  }
}

module.exports = initSchema()
