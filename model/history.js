'use strict'

let initSchema = async ()=>{
  const history = new mongoose.Schema({
    editor_id:      {type:mongoose.Schema.Types.ObjectId, ref:'users'}, // 편집자
    content:        {type:String, default:''},                          // 편집내용
    update:         {type:String, default:'2022-06-01'},                // 편집날짜
    confirm:        {type:Boolean,default:false},                       // 관리자 확인
    reward:         {type:Number, default:0},                           // 보상금액
    
    
  }, {timestamps: true, minimize: false})

  try{
    const list = await mongoose.connection.db.listCollections().toArray()
    let index = _.findIndex(list, {name:'history'})
    if(index < 0)
    history.index({editor_id:1,update:1})
    else
      log('init schema (voices.products): collection found. creation skipped')

    global.History = mongoose.model('history', history)
    return new Promise((resolve, reject)=>{resolve('done')})
  }
  catch(err){
    log('err:', err)
  }
}

module.exports = initSchema()
