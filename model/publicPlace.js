'use strict'

let initSchema = async ()=>{
  const publicPlace = new mongoose.Schema({
    place_type:     {type:String, default:'PUBLIC'},              // MULTI, PLACE, PUBLIC,
    is_public:      {type:Boolean, default:true},                 // type : public 
    center_code:    {type:String, default:''},                    // 기관코드 
    place_name:     {type:String, default:''},                    // 장소명 
    gov_type:       {type:String, default:''},                    // JUDICIAL, ADMINI, POLICESTATION,FIRESTATION,, 
    public_type:    {type:String, default:''},                    // 1시도_시, ...
    admin_address:  {type:String, default:''},                    // address
    road_address:   {type:String, default:''},                    // 도로명주소 서울시 동작구 여의대방로22나길 74
    web_address:    {type:String, default:''},                    // 홈페이지주소
    tel:            {type:String, default:''},                    //
    zip:            {type:String, default:''},                    //
    bj_code:        {type:String, default:''},                    // 법정동코드
    r_depth_1:      {type:String, default:''},                    // depth of address
    r_depth_2:      {type:String, default:''},                    // depth of address
    r_depth_3:      {type:String, default:''},                    // depth of address
    eup_myun:       {type:String, default:''},                    // 읍면
    ri:             {type:String, default:''},                    // 리
    jibun:          {type:String, default:''},                    // depth of address
    location:       {type:Object, default:{}},                    // coords
    description:    {type:String, default:''},                    // description
    image:          {type:Array, default:[]},                     // content image
    possess:        [{type:mongoose.Schema.Types.ObjectId, ref:'facility'}],                     // 내부 시설 - {floor: 1, name : 'CU', type: '편의점'}
    admin_id:       [{type:mongoose.Schema.Types.ObjectId, ref:'users'}], // 관리자 _id 
    admin_name:     {type:String, default:''},                    // 이름
    admin_email:    {type:String, default:''},                    // 이메일
    obsolete_id:    [{type:mongoose.Schema.Types.ObjectId, ref:'users'}], // 적폐 _id role을 다르게 
    member:         [{type:mongoose.Schema.Types.ObjectId, ref:'users'}],  // community member

    level:          {type:Number, default:9},                    // depth1, depth2, depth3

    s_code:          {type:String},                               //
    s_gubun:         {type:String},                               //
    value:           {type:String},                               //

    upper_center:    {type:Object, default:{}},                   // 상위기관 admin, center_id, center_name 
    lower_center:    {type:Array, default:[]},                    // 하위기관 {}
    interest:        {type:Number, default: 0},                   // 관심도
    price:           {type:Array, default:[]},                    // 건물가격
    post:           [{type:mongoose.Schema.Types.ObjectId, ref:'post'}], //post
    history:        [{type:mongoose.Schema.Types.ObjectId, ref:'history'}], // history

    bld_plot_area :   {type:String},  // 연면적
    bld_area :        {type:String},  // 건축면적
    bld_total_area :  {type:String},  // 총면적
    bld_yong :        {type:String},  // 용적율
    bld_gunpe :       {type:String},  // 건폐율
    bld_floor :       {type:String},  // 층수
    bld_under :       {type:String},  // 지하층수
    bld_park :        {type:String},  // 주차대수
    bld_park_area :   {type:String},  // 주차면적
  }, {timestamps: true, minimize: false})

  try{
    const list = await mongoose.connection.db.listCollections().toArray()
    let index = _.findIndex(list, {name:'publicPlace'})
    if(index < 0)
    publicPlace.index({admin_id:1,image:1, location : "2dsphere" })
    else
      log('init schema (public): collection found. creation skipped')

    global.PublicPlace = mongoose.model('publicPlace', publicPlace)
    return new Promise((resolve, reject)=>{resolve('done')})
  }
  catch(err){
    log('err:', err)
  }
}

module.exports = initSchema()
