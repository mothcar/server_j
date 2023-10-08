// 'use strict'

const _ = require('lodash')

const initSchema = async ()=>{
  const users = new mongoose.Schema({
    email:            {type:String, unique:true},       // 이메일
    gender:           {type:String, default:''},        // M / W
    name:             {type:String, default:''},        // 사용자 이름
    nickname:         {type:String, default:''},        // 닉네임 
    year:             {type:Number, default:1961},      // 생년 
    birth:            {type:String, default:''},        // 생월일 
    married:          {type:String, default:''},        // 결혼상태 
    password:         {type:String},                    // 로그인 암호
    role:             {type:String, default:'USER'},    // 'ADMIN, OPERATOR, USER', 'POLITICS ADMINIST 행정관리자 명칭들'
    address:          {type:String, default:'대한민국'},  // 행정주소
    phone:            {type:String, default:'010-0000-0000'},  // 휴대폰번호
    enabled:          {type:Boolean},                   // 사용여부
    isVerifiedEmail:  {type:Boolean, default:true},     // 이메일 확인 여부
    user_img:         {type:Array, default:[]},         // user image 
    simple_msg:       [{type:mongoose.Schema.Types.ObjectId, ref:'simpleMsg'}], // 방문자가 남긴 메세지 
    job:              {type:String, default:''},        // 직업
    follow:           [{type:mongoose.Schema.Types.ObjectId, ref:'users'}],
    follower:         [{type:mongoose.Schema.Types.ObjectId, ref:'users'}],
    favorite:         {type:Array, default:[]},         // 즐겨찾기 
    introduction:     {type:String, default:''},        // 소개
    basic_info:       {type:Object, default:{height:{value:[],price:500},weight:{value:[],price:500},blood_type:{value:[],price:500}}}, // 기본정보
    my_values:        {type:Array, default:[]},         // 나의 가치관
    answer_set:       {type:Array, default:[]},         // 보여주기 답
    hidePerson:       {type:Array, default:[]},         // 지인
    balance:          {type:Number, default: 0 },       // 잔액 
    agit:             { type: mongoose.Schema.Types.ObjectId, ref: "place", autopopulate: true }, // agit

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
    users.plugin(require('mongoose-autopopulate'))

    global.Users = mongoose.model('users', users)
    return new Promise((resolve, reject)=>{resolve('done')})
  }
  catch(err){
    log('err:', err)
  }
}

module.exports = initSchema()
