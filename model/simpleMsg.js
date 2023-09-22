"use strict";

let initSchema = async () => {
  const simpleMsg = new mongoose.Schema(
    {
      user_id:    { type: mongoose.Schema.Types.ObjectId, ref: "users" }, // 편집자
      target_id:  { type: String, default: "" },                          // 대상자
      photo_url:  { type: String, default: "" },                          // photo url
      og_url:     { type: String, default: "" },                          // Link url
      og_image:   { type: String, default: "" },                          // 대표 image
      og_title:   { type: String, default: "" },                          // title
      comment:    { type: String, default: "" },                          // post내용
      confirm:    { type: Boolean, default: false },                      // 관리자 확인
      tags:       { type: Array, default: [] },                           // 관련 키워드
      hits:       { type: Number, default: 0 },                           // 조회
      recommend:  { type: Number, default: 0 },                           // 추천
      reward:     { type: Number, default: 0 },                           // 보상금액
      reply:      [{ type: mongoose.Schema.Types.ObjectId, ref: "reply" }], // 댓글
      like:       { type: Number, default: 0 },                           // 인기
      tendency:   { type: String, default: "" },                          // 글성격
    },
    { timestamps: true, minimize: false }
  );

  try {
    const list = await mongoose.connection.db.listCollections().toArray();
    let index = _.findIndex(list, { name: "simpleMsg" });
    if (index < 0) simpleMsg.index({ og_title: 1, user_id: 1, comment: 1 });
    else
      log("init schema (voices.products): collection found. creation skipped");

    global.SimpleMsg = mongoose.model("simpleMsg", simpleMsg);
    return new Promise((resolve, reject) => {
      resolve("done");
    });
  } catch (err) {
    log("err:", err);
  }
};

module.exports = initSchema();
