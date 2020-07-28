(function() {

  "use strict";

  //==========================================
  // EXPORTING MODULE
  //==========================================

  let Lang = {};
  if ( typeof module === "object" && module && typeof module.exports === "object" ) {
    Lang = require("../lang.js");
    module.exports = JpnLang;
  }
  else {
    Lang = window.JsLingua.Cls.Lang;
    window.JsLingua.aserv("lang", "jpn", JpnLang);
  }

  //==========================================
  // CONSTANTS
  //==========================================
  const lookup = {
    0: "零", 1:"一", 2:"二", 3:"三", 4:"四", 5:"五",
    6:"六", 7:"七", 8:"八", 9:"九", 10:"十",
    100:"百", 1000:"千", 10000:"万",
    100000000:"億", 1000000000000:"兆"
  },
  bigNbr = [
    1000000000000, 100000000,
    10000, 1000, 100, 10
  ];

  //==========================================
  // CLASS CONSTRUCTOR
  //==========================================

  /**
  * Contains Japanese charsets and transformations
  *
  * @class JpnLang
  * @extends Lang
  */
  function JpnLang() {
    Lang.call(this, "jpn");

    Lang._nChs.call(this, "Hiragana", 0x3040, 0x309F);
    Lang._nChs.call(this, "Katakana", 0x30A0, 0x30FF);
    Lang._nChs.call(this, "Kanji", 0x4E00, 0x9FBF);
    Lang._nChs.call(this, "Punctuation", 0x3000, 0x303F);

    Lang._nTrans.call(this, "hira2kata", "Hiragana to Katakana", [{offset:0x0060, setName:"Hiragana"}]);
    Lang._nTrans.call(this, "kata2hira", "Katakana to Hiragana", [{offset:-0x0060, setName:"Katakana"}]);
  }

  JpnLang.prototype = Object.create(Lang.prototype);
  let Me = JpnLang.prototype;
  Me.constructor = JpnLang;

  //==========================================
  // STATIC FUNCTIONS
  //==========================================

  //==========================================
  // CHARSETS FUNCTIONS
  //==========================================

  //Inhereted: no override

  //==========================================
  // TRANSFORMATION FUNCTIONS
  //==========================================

  //The transformations are added in the constructor

  //==========================================
  // PRONOUNCE FUNCTIONS
  //==========================================

  /*
  * Write the Arabic number in Japanese Kanjis
  *
  * @method pronounceNumber
  * @override
  */
  Me.nbr2str = __toJapaneseLetters;

  /**
  * Transform from Arabic numbers to Japanese letters
  *
  * @method __toJapaneseLetters
  * @private
  * @memberof JpnLang
  * @param {Number} num the integer number
  * @return {String} Japanese writing of numbers
  */
  function __toJapaneseLetters (num) {

    if (isNaN(num)) return "";

    let neg = false;
    if (num < 0) {
      neg = true;
      num = - num;
    }

    if (num < 10) return lookup[num];

    //search for the max index
    let i = 0,
    max = 1,
    div;
    for (i = 0; i < bigNbr.length; i++) {
      max = bigNbr[i];
      div = ~~(num/max);
      if (div > 0)
      break;
    }
    let rem = ~~(num % max),
    result = "";
    if (div > 0)
    if (div > 1 || max > 1000)  result += __toJapaneseLetters(div);
    result += lookup[max];
    if (rem > 0) result += __toJapaneseLetters(rem);

    if (neg) result = "マイナス" + result;

    return result;

  }

}());
