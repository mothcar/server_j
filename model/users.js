// 'use strict'

const _ = require('lodash')

const initSchema = async ()=>{
  const users = new mongoose.Schema({
    email:            {type:String, unique:true},       // 이메일
    gender:           {type:String, default:''},        // M / W
    name:             {type:String, default:''},        // 사용자 이름
    nickname:         {type:String, default:''},        // 닉네임 
    password:         {type:String},                    // 로그인 암호
    role:             {type:String, default:'USER'},    // 'ADMIN, OPERATOR, USER', 'POLITICS ADMINIST 행정관리자 명칭들'
    address:          {type:String, default:'대한민국'},  // 행정주소
    phone:            {type:String, default:'010-0000-0000'},  // 휴대폰번호
    enabled:          {type:Boolean},                   // 사용여부
    isVerifiedEmail:  {type:Boolean, default:true},     // 이메일 확인 여부
    user_img:         {type:Array, default:[]},         // user image 
    simple_msg:       [{type:mongoose.Schema.Types.ObjectId, ref:'simpleMsg'}], // 방문자가 남긴 메세지 
    job:              {type:String, default:''},        // 직업
    favorite:         {type:Array, default:[]},         // 즐겨찾기 
    introduction:     {type:String, default:''},        // 소개
    height:           {type:String, default:''},        // 키
    weight:           {type:String, default:''},        // 몸무게
    bloodType:        {type:String, default:''},        // 혈액형
    locale:           {type:String, default:''},        // 지역
    hidePerson:       {type:Array, default:[]},         // 지인
    balance:          {type:Number, default: 0 },       // 잔액 
    agit:             { type: mongoose.Schema.Types.ObjectId, ref: "place" }, // 편집자

    // for voice mall
    uuid:             {type:String},                    // 임시 UUID
    signedOutAt:      {type:Date, default: Date.now},   // 회원 탈퇴 일시.

    // ledger:           {type:Array, default:[]},                                 // 지갑
    contribution:     {type:Number, default:0},                                 // 기여도
    
    post:             [{type:mongoose.Schema.Types.ObjectId, ref:'post'}], //post
    history:          [{type:mongoose.Schema.Types.ObjectId, ref:'history'}], // history

    // social login info
    socialLogins:     {type:[], default:[]},            // 소셜 로그인 정보
    loginType:        {type:String}                     // 로그인 타입 (FACEBOOK, GOOGLE, EMAIL 등)
  }, {timestamps: true, minimize: false})

  try{
    // const list = await mongoose.connection.db.listCollections().toArray()
    // let index = _.findIndex(list, {name:'users'})
    // if(index < 0)
    //   users.index({
    //     email:1,
    //     enabled:1,
    //     isVerifiedEmail:1,
    //     role:1,
    //     uuid:1
    //   })
    // else
    //   {log('init schema (users): collection found. creation skipped')}

    global.Users = mongoose.model('users', users)
    return new Promise((resolve, reject)=>{resolve('done')})
  }
  catch(err){
    log('err:', err)
  }
}

module.exports = initSchema()
