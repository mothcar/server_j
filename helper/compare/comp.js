'use strict'
const pd = require('../helper/comp/pd')

var s1 = 'vue 개발자';
var s2 = 'javascript 개발자 모임';
var s1Parts= s1.split(' ');
var s2Parts= s2.split(' ');
var sol;

const compare = {
  // Function: compare two sentences
  compSplit : function () {
    for(var i = 0; i<s1Parts.length; i++) {
         if(s1Parts[i] == s2Parts[i])
             sol =  s1Parts[i]
    }
    console.log('## Result : ', sol)
  },

  simpleComp : function() {
    // function : find duplicate string
    let strArray = [ "q", "w", "w", "w", "e", "i", "u", "r"];
    let findDuplicates = arr => arr.filter((item, index) => arr.indexOf(item) != index)
    // console.log('@@@ duplicate : ', findDuplicates(strArray))
  },

  // Function : contains
  containsAny: function (str, substrings) {
      for (var i = 0; i != substrings.length; i++) {
         var substring = substrings[i];
         if (substring.indexOf(str) != - 1) {
           return substring;
         }
      }
      var result = containsAny("vue", ["vue 개발자", "javascript 개발", "defg"]);
      console.log("String was found in substring " + result);
      // Another solution : https://stackoverflow.com/questions/27555971/javascript-search-array-to-see-if-it-contains-part-of-string
      return null;
  },

  compModule : {
    // Function PD
    // Good Module : https://stackoverflow.com/questions/57102484/find-difference-between-two-strings-in-javascript
    let difference = pd( a.split(""), b.split("") );
    console.log('@@PD : ', difference)
  }



}

module.exports = compare
