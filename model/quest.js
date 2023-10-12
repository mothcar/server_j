'use strict'

let initSchema = async ()=>{
  const quest = new mongoose.Schema({
    post_type:     {type:String, default:'image'},                     // image / youtube
    area:          {type:String, default:'서울'},                       // 지역
    user_id:       {type:mongoose.Schema.Types.ObjectId, ref:'users'}, // 편집자
    parent_id:     {type:mongoose.Schema.Types.ObjectId, ref:'place'}, // Parent id 
    photo:         {type:String, default:''},                          // photo url
    images:        {type:Array, default:[]},                           // images
    youtube_url:   {type:String, default:''},                          // Youtube url
    og_url:        {type:String, default:''},                          // Link url
    og_image:      {type:String, default:''},                          // 대표 image
    og_title:      {type:String, default:''},                          // title
    comment:       {type:String, default:''},                          // post내용
    location:      {type:Object, default:{}},                          // coords
    photo_url:     {type:Array, default:[]},                           // photo url
    admin_address: {type:String, default:''},                          // address
    r_depth_1:     {type:String, default:''},                          // depth of address
    r_depth_2:     {type:String, default:''},                          // depth of address
    r_depth_3:     {type:String, default:''},                          // depth of address
    location:      {type:Object, default:{}},                          // coords
    recommend:     {type:Number, default: 0},                          // 추천
    on_map:        {type:Boolean,default:true},                        // 지도에 보이기
    confirm:       {type:Boolean,default:false},                       // 관리자 확인
    tags:          {type:Array, default: []},                          // 관련 키워드
    hits:          {type:Number, default: 0},                          // 조회
    reward:        {type:Number, default:0},                           // 보상금액
    reply:         [{type:mongoose.Schema.Types.ObjectId, ref:'reply'}],// 댓글
    like:          {type:Number, default:0},                           // 인기 
    valid:         {type:Boolean, default:true},                       // 유효

    
  }, {timestamps: true, minimize: false})

  try{
    const list = await mongoose.connection.db.listCollections().toArray()
    let index = _.findIndex(list, {name:'quest'})
    if(index < 0)
    quest.index({place_type:1,user_id:1})
    else
      log('init schema (voices.products): collection found. creation skipped')

    global.Quest = mongoose.model('quest', quest)
    return new Promise((resolve, reject)=>{resolve('done')})
  }
  catch(err){
    log('err:', err)
  }
}

module.exports = initSchema()
