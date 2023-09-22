'use strict'

let initSchema = async () => {
  const ledger = new mongoose.Schema({
    user:         {type:mongoose.Schema.Types.ObjectId, ref:'users'}, // user ID
    trans_date:   { type: String, default: '12.12.' },      // date
    trans_time:   { type: String, default: '12:12' },       // date
    description:  { type: String, default: '입출금' },        // 입금 / 출금 
    type:         { type: String, default: 'GET' },         // SEND / GET 
    amount:       { type: Number, default: 0 },             // 금액
    balance:      { type: Number, default: 0 },             // 잔액 

  }, { timestamps: true, minimize: false })

  try {
    const list = await mongoose.connection.db.listCollections().toArray()
    let index = _.findIndex(list, { name: 'ledger' })
    if (index < 0)
      ledger.index({ user: 1 })
    else
      log('init schema (ledger): collection found. creation skipped')

    global.Ledger = mongoose.model('ledger', ledger)
    return new Promise((resolve, reject) => { resolve('done') })
  }
  catch (err) {
    log('err:', err)
  }
}

module.exports = initSchema()
