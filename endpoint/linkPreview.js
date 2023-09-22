"use strict";

const faker = require("faker");
const express = require("express");
const xlsx = require("xlsx");
const linkpreview = express.Router({});
const dateFormat = require("dateformat");
const policy = require("../helper/sharing_policy.js");
// const { getLinkPreview, getPreviewFromContent }  = require( "link-preview-js")
// import from;

//--------------------------------------------------
// Default Boiler Function 2022
//--------------------------------------------------

linkpreview.get("/", async (req, res) => {
  log("req.query :", req.query);
  // log('test : req.query :', req.query)

  try {
    let qry = req.query;
    
    const ogs = require("open-graph-scraper");
    const options = qry

    ogs(options, (error, results, response) => {
      //   console.log('error:', error); // This returns true or false. True if there was an error. The error itself is inside the results object.
      //   console.log('results:', results); // This contains all of the Open Graph results
      console.log("title:", results); // This contains all of the Open Graph results
      let params = {
        title : results.ogTitle,
        origin_url: results.ogUrl,
        image: results.ogImage,
      }
      //   console.log('response:', response); // This contains the HTML of page
      res.json({ msg: RCODE.OPERATION_SUCCEED, data: { item: params } });
    });

    // console.log("Result : ", response);
    // await browser.close();
    // res.json({ msg: RCODE.OPERATION_SUCCEED, data: { item: "ok" } });
  } catch (err) {
    log("err=", err);
    res.status(500).json({ msg: RCODE.SERVER_ERROR, data: {} });
  }
});


//--------------------------------------------------
// New functions 2022
//--------------------------------------------------

module.exports = linkpreview;
