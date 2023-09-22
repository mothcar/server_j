'use strict'

let initSchema = async ()=>{
  const ads = new mongoose.Schema({
    parent_id:     {type:String, default:''},                          // 부모 id  
    place_type:    {type:String, default:''},                          // place type 
    user_id:       {type:mongoose.Schema.Types.ObjectId, ref:'users', autopopulate: true}, // 편집자
    title:         {type:String, default:''},                          // 글제목
    content:       {type:String, default:''},                          // 글내용
    image:         {type:Array, default:[]},                           // content image
    money:         {type:Number, default:0},                           // 잔액
    expire_date:   {type:String, default:''},                          // 종료기간
    location:      {type:Object, default:{}},                          // coords
    level:         {type:Number, default: 5},                          // 보이는 레벨
    activate:      {type:Boolean,default: true},                       // 활성화
    
  }, {timestamps: true, minimize: false})

  try{
    const list = await mongoose.connection.db.listCollections().toArray()
    let index = _.findIndex(list, {name:'ads'})
    if(index < 0){
      ads.index({parent_id:1,user_id:1})
      ads.plugin(require('mongoose-autopopulate'))
    }
    else
      log('init schema (voices.products): collection found. creation skipped')

    global.Ads = mongoose.model('ads', ads)
    return new Promise((resolve, reject)=>{resolve('done')})
  }
  catch(err){
    log('err:', err)
  }
}

module.exports = initSchema()
