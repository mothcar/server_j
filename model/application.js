'use strict'

let initSchema = async ()=>{
  const application = new mongoose.Schema({
    center_id:        {type:mongoose.Schema.Types.ObjectId, ref:'publicPlace'},// 선택된 직업명 global.JOB  
    idx:              {type:String},                  // 각 장소 순번  
    job_code:         {type:String},                  // 선택된 직업명 global.JOB  
    job_name:         {type:String, default:""},      // 직업이름 
    user_id:          {type:String, default:""},      // 유저 id 
    user_name:        {type:String, default:""},      // 이름
    title:            {type:String, default:""},      // 직함
    user_img:         {type:String, default:""},       // 사진
    email:            {type:String},                  // 이메일
    phone:            {type:String, default:""},      // 휴대폰번호
    reason:           {type:String, default:""},      // 신청사유
    r_depth_1:        {type:String, default:""},      // 대지역
    r_depth_2:        {type:String, default:""},      // 중지역
    r_depth_3:        {type:String, default:""},      // 소지역
    apply_confirm:    {type:Boolean, default:false},  // 신청서 확인여부 
    deny_reason:      {type:String},                  // 거절사유 
    user_confirm:     {type:Boolean, default:false},  // 본인이 확인여부 
    denied:           {type:Boolean, default:false},  // 거절됨 
    obsolete:         {type:Boolean, default:false},  // 기존실재인물 
  }, {timestamps: true, minimize: false})

  try{
    const list = await mongoose.connection.db.listCollections().toArray()
    let index = _.findIndex(list, {name:'application'})
    if(index < 0)
    application.index({user_id:1,user_name:1})
    else
      log('init schema (voices.products): collection found. creation skipped')

    global.Application = mongoose.model('application', application)
    return new Promise((resolve, reject)=>{resolve('done')})
  }
  catch(err){
    log('err:', err)
  }
}

module.exports = initSchema()
