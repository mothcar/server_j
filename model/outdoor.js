'use strict'

let initSchema = async ()=>{
  const outdoor = new mongoose.Schema({
    place_type:     {type:String, default:'OUTDOOR'},             // MULTI, PLACE, PUBLIC,
    is_public:      {type:Boolean, default:false},                // type : nolmal place 
    place_name:     {type:String, default:''},                    // 장소명 
    sub_name:       {type:String, default:''},                    // 멀티를 위한 sub name 
    place_code:     {type:String, default:''},                    // 01000(다가구주택), 02000(주거시설), 03000(주민센터),
    admin_address:  {type:String, default:''},                    // address
    road_address:   {type:String, default:''},                    // 도로명주소 서울시 동작구 여의대방로22나길 74
    sub_address:    {type:String, default:''},                    // multi를 위한 sub address
    web_address:    {type:String, default:''},                    // 홈페이지주소
    tel:            {type:String, default:''},                    //
    r_depth_1:      {type:String, default:''},                    // depth of address 1
    r_depth_2:      {type:String, default:''},                    // depth of address2
    r_depth_3:      {type:String, default:''},                    // depth of address3
    eup_myun:       {type:String, default:''},                    // 읍면
    ri:             {type:String, default:''},                    // 리
    jibun:          {type:String, default:''},                    // depth of address
    location:       {type:Object, default:{}},                    // coords
    description:    {type:String, default:''},                    // description
    image:          {type:Array, default:[]},                     // content image
    possess:        [{type:mongoose.Schema.Types.ObjectId, ref:'facility'}],  // 내부 시설 - {floor: 1, name : 'CU', type: '편의점'}
    owner:          {type:mongoose.Schema.Types.ObjectId, ref:'users'}, // 소유자 
    owner_name:     {type:String, default:''},                    // 이름
    owner_email:    {type:String, default:''},                    // 이메일
    member:          [{type:mongoose.Schema.Types.ObjectId, ref:'users'}],  // community member 
    admin_id:       [{type:mongoose.Schema.Types.ObjectId, ref:'users'}], // 관리자 _id
    post:           [{type:mongoose.Schema.Types.ObjectId, ref:'post'}], //post
    history:        [{type:mongoose.Schema.Types.ObjectId, ref:'history'}], // history

    s_code:          {type:String},                               // ?
    s_gubun:         {type:String},                               // ?
    value:           {type:String},                               // ?

    interest:        {type:Number, default: 0},                   // 관심도
    price:           {type:Array, default:[]},                    // 건물가격
    current_price:   {type:Array, default:[]},                    // 최근 거래가

    bld_plot_area :  {type:Number, default:0},                   // 연면적
    bld_park :       {type:Number, default:0},                   // 주차대수
  }, {timestamps: true, minimize: false})

  /*
    view_level              : { type: 'string', defaultsTo: '' },
  */ 


  try{
    const list = await mongoose.connection.db.listCollections().toArray()
    let index = _.findIndex(list, {name:'outdoor'})
    if(index < 0)
    outdoor.index({admin_id:1,image:1, location : "2dsphere" })
    else
      log('init schema (outdoor): collection found. creation skipped')

    global.Outdoor = mongoose.model('outdoor', outdoor)
    return new Promise((resolve, reject)=>{resolve('done')})
  }
  catch(err){
    log('err:', err)
  }
}

module.exports = initSchema()
