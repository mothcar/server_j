'use strict'

let initSchema = async ()=>{
  const reply = new mongoose.Schema({
    parent_id:     {type:String, default:''},                          // 원래 포스트 
    nickname:      {type:String, default:''},                          // 닉네임 
    user_id:       {type:mongoose.Schema.Types.ObjectId, ref:'users', autopopulate: true}, // 편집자
    // user_id:       {type:mongoose.Schema.Types.ObjectId, ref:'users'}, // 편집자
    comment:       {type:String, default:''},                          // 글내용
    place_type:    {type:String, default:''},                          // 장소 type
    reply_type:    {type:String, default:'POS'},                       // 성향 POS, NAG
    confirm:       {type:Boolean,default:false},                       // 관리자 확인
    like:          {type:Number, default:0},                           // 인기 
    
  }, {timestamps: true, minimize: false})

  try{
    const list = await mongoose.connection.db.listCollections().toArray()
    let index = _.findIndex(list, {name:'reply'})
    if(index < 0){
    reply.index({parent_id:1,user_id:1})
    reply.plugin(require('mongoose-autopopulate'))
    }
    else
      log('init schema (voices.products): collection found. creation skipped')

    global.Reply = mongoose.model('reply', reply)
    return new Promise((resolve, reject)=>{resolve('done')})
  }
  catch(err){
    log('err:', err)
  }
}

module.exports = initSchema()
