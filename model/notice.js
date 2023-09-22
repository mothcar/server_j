"use strict";

let initSchema = async () => {
  const notice = new mongoose.Schema(
    {
      user_id: { type: mongoose.Schema.Types.ObjectId, ref: "users" }, // 편집자
      parent_id:      { type: String, default: "" },                // publicPlace id
      public_depth:   { type: Number, default: 1 },                 // depth level 
      og_title:       { type: String, default: "" },                // title
      photo_url:      {type:Array, default:[]},                     // photo url
      comment:        { type: String, default: "" },                // post내용
      r_depth_1:      { type: String, default: "" },                // r_depth_1
      r_depth_2:      { type: String, default: "" },                // r_depth_2
      r_depth_3:      { type: String, default: "" },                // r_depth_3
      admin_address:  {type:String, default:""},                    // 주소
      location:       {type:Object, default:{}},                    // coords
      confirm:        { type: Boolean, default: false },            // 관리자 확인
      tags:           { type: Array, default: [] },                 // 관련 키워드
      hits:           { type: Number, default: 0 },                 // 조회
      recommend:      { type: Number, default: 0 },                 // 추천
      reply:          [{ type: mongoose.Schema.Types.ObjectId, ref: "reply" }], // 댓글
      like:           { type: Number, default: 0 },                 // 인기
      tendency:       { type: String, default: "" },                // 글성격
    },
    { timestamps: true, minimize: false }
  );

  try {
    const list = await mongoose.connection.db.listCollections().toArray();
    let index = _.findIndex(list, { name: "notice" });
    if (index < 0) notice.index({ og_title: 1, user_id: 1, comment: 1 });
    else
      log("init schema (voices.products): collection found. creation skipped");

    global.Notice = mongoose.model("notice", notice);
    return new Promise((resolve, reject) => {
      resolve("done");
    });
  } catch (err) {
    log("err:", err);
  }
};

module.exports = initSchema();
