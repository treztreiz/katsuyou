(function() {

  "use strict";

  //==========================================
  // EXPORTING MODULE
  //==========================================

  let Trans = {};
  if ( typeof module === "object" && module && typeof module.exports === "object" ) {
    Trans = require("../trans.js");
    module.exports = JpnTrans;
  }
  else {
    Trans = window.JsLingua.Cls.Trans;
    //window.JpnTrans = JpnTrans;
    window.JsLingua.aserv("trans", "jpn", JpnTrans);
  }

  let hiragana = [
    "が",
    "ぎ",
    "ぐ",
    "げ",
    "ご",
    "ざ",
    "じ",
    "じ",
    "ず",
    "ぜ",
    "ぞ",
    "だ",
    "ぢ",
    "ぢ",
    "づ",
    "で",
    "ど",
    "ば",
    "び",
    "ぶ",
    "べ",
    "ぼ",
    "ぱ",
    "ぴ",
    "ぷ",
    "ぺ",
    "ぽ",
    "ふぁ",
    "ふぉ",
    "ふぃ",
    "か",
    "き",
    "く",
    "け",
    "こ",
    "た",
    "ち",
    "つ",
    "て",
    "と",
    "さ",
    "し",
    "し",
    "す",
    "せ",
    "そ",
    "な",
    "に",
    "ぬ",
    "ね",
    "の",
    "は",
    "ひ",
    "ふ",
    "へ",
    "ほ",
    "ま",
    "み",
    "む",
    "め",
    "も",
    "や",
    "ゆ",
    "よ",
    "ら",
    "り",
    "る",
    "れ",
    "ろ",
    "わ",
    "を",
    "あ",
    "い",
    "う",
    "え",
    "お",
    "ん",
    "ゃ",
    "ぇ",
    "ゅ",
    "ぃ",
    "ょ"
  ],
  hepburn = [//https://en.wikipedia.org/wiki/Hepburn_romanization
    "ga",
    "gi",
    "gu",
    "ge",
    "go",
    "za",
    "ji",
    "zi",
    "zu",
    "ze",
    "zo",
    "da",
    "ji",
    "di",
    "zu",
    "de",
    "do",
    "ba",
    "bi",
    "bu",
    "be",
    "bo",
    "pa",
    "pi",
    "pu",
    "pe",
    "po",
    "fa",
    "fo",
    "fi",
    "ka",
    "ki",
    "ku",
    "ke",
    "ko",
    "ta",
    "chi",
    "tsu",
    "te",
    "to",
    "sa",
    "shi",
    "si",
    "su",
    "se",
    "so",
    "na",
    "ni",
    "nu",
    "ne",
    "no",
    "ha",
    "hi",
    "fu",
    "he",
    "ho",
    "ma",
    "mi",
    "mu",
    "me",
    "mo",
    "ya",
    "yu",
    "yo",
    "ra",
    "ri",
    "ru",
    "re",
    "ro",
    "wa",
    "wo",
    "a",
    "i",
    "u",
    "e",
    "o",
    "n",
    "xya",
    "xye",
    "xyu",
    "xyi",
    "xyo"
  ],
  loneUnTrans = {
    "ku": "く",
    "su": "す",
    "nu": "ぬ",
    "fu": "ふ",
    "hu": "ふ",
    "mu": "む",
    "yu": "ゆ",
    "ru": "る",
    "gu": "ぐ",
    "zu": "ず",
    "du": "づ",
    "bu": "ぶ",
    "pu": "ぷ"
  },
  wabun = [
    " .-..  .. ",//ga
    " -.-..  .. ",//gi
    " ..-  .. ",//gu
    " -.--  .. ",//ge
    " ----  .. ",//go
    " -.-.-  .. ",//za
    " --.-.  .. ",//ji
    " --.-.  .. ",//ji
    " ---.-  .. ",//zu
    " .---.  .. ",//ze
    " ---.  .. ",//zo
    " -.  .. ",//da
    " ..-.  .. ",//dzi
    " ..-.  .. ",//dzi
    " .--.  .. ",//dzu
    " .-.--  .. ",//de
    " ..-..  .. ",//do
    " -...  .. ",//ba
    " --..-  .. ",//bi
    " --..  .. ",//bu
    " .  .. ",//be
    " -..  .. ",//bo
    " -...  .. ",//pa
    " --..-  ..--. ",//pi
    " --..  ..--. ",//pu
    " .  ..--. ",//pe
    " -..  ..--. ",//po
    "*", //fa
    "*", //fo
    "*", //fi
    " .-.. ",//ka
    " -.-.. ",//ki
    " ...- ",//ku
    " -.-- ",//ke
    " ---- ",//ko
    " -. ",//ta
    " ..-. ",//chi
    " .--. ",//tsu
    " .-.-- ",//te
    " ..-.. ",//to
    " -.-.- ",//sa
    " --.-. ",//shi
    " --.-. ",//shi
    " ---.- ",//su
    " .---. ",//se
    " ---. ",//so
    " .-. ",//na
    " -.-. ",//ni
    " .... ",//nu
    " --.- ",//ne
    " ..-- ",//no
    " -... ",//ha
    " --..- ",//hi
    " --.. ",//fu
    " . ",//he
    " -.. ",//ho
    " -..- ",//ma
    " ..-.- ",//mi
    " - ",//mu
    " -...- ",//me
    " -..-. ",//mo
    " .-- ",//ya
    " -..-- ",//yu
    " -- ",//yo
    " ... ",//ra
    " --. ",//ri
    " -.--. ",//ru
    " --- ",//re
    " .-.- ",//ro
    " -.- ",//wa
    " .--- ",//wo
    " --.-- ",//a
    " .- ",//i
    " ..- ",//u
    " -.--- ",//e
    " .-... ",//o
    " .-.-. ",//n
    " .-- ",//xya
    " -.--- ",//xe
    " -..-- ",//xyu
    " .- ",//xi
    " -- "//xyo
  ];

  //==========================================
  // CLASS CONSTRUCTOR
  //==========================================

  /**
   * Japanese transliteration
   *
   * @class JpnTrans
   * @extends Trans
   */
  function JpnTrans() {
    Trans.call(this, "jpn");

    Trans._nTrans.call(this, "hepburn", hiragana, hepburn);
    Trans._sTransCnd.call(this, "hepburn", __hepburnPreTrans, __shikiPostTrans);
    Trans._sUntransCnd.call(this, "hepburn", __hepburnPreUntrans, __loneCharReplace);

    Trans._nTrans.call(this, "nihonshiki", hiragana, hepburn);
    Trans._sTransCnd.call(this, "nihonshiki", __nihonShikiPreTrans, __shikiPostTrans);
    Trans._sUntransCnd.call(this, "nihonshiki", __nihonShikiPreUntrans, __loneCharReplace);

    Trans._nTrans.call(this, "kunreishiki", hiragana, hepburn);
    Trans._sTransCnd.call(this, "kunreishiki", __kunreiShikiPreTrans, __shikiPostTrans);
    Trans._sUntransCnd.call(this, "kunreishiki", __kunreiShikiPreUntrans, __loneCharReplace);

    Trans._nTrans.call(this, "morse", hiragana, wabun);
    Trans._sTransCnd.call(this, "morse", __morsePreTrans, __morsePostTrans);
    Trans._sUntransCnd.call(this, "morse", __morsePreUntrans, __morsePostUntrans);
  }

  JpnTrans.prototype = Object.create(Trans.prototype);
  JpnTrans.prototype.constructor = JpnTrans;

  //==========================================
  // MORSE FUNCTIONS
  //==========================================

  function __ja2morseNormalize(text) {
    var result = text;
    result = result.replace(/[っ]/gi, "つ");
    //Japanese space
    //result = result.replace(/\s/gi, "\t");
    return result;
  }

  function __morsePreTrans(text) {
    var result = text;
    //cleaning non supported codes
    result = result.replace(/[.-]/gi, "");
    result = result.replace(/[ ]+/gi, "\t");
    //result = result.replace(/([^\t])([^\t])/gi, "$1 $2");
    result = __ja2morseNormalize(result);
    return result;
  }

  function __morsePostTrans(text) {
    var result = text;
    result = Trans.specialCharTrans(result);
    result = result.replace(/ +/gi, " ");
    result = result.replace(/\t/gi, "   ");
    //clean non morse characters
    result = result.replace(/[^ .-]/gi, "");

    //Add DO and SN prosigns
    result = "-..---" + result + "...-.";
    return result;
  }

  function __morsePreUntrans(text) {
    var result = text;
    //clean non morse characters
    result = result.replace(/[^ .-]/gi, "");
    result = result.replace(/[ ]{3,}/gi, " \t ");
    result = result.replace(/ +/gi, "  ");
    result = result.replace(/^/gi, " ");
    result = result.replace(/$/gi, " ");

    //delete DO and SN prosigns used to specify the beginning and end of wabun
    result = result.replace(/ -\.\.--- /gi, " ");
    result = result.replace(/ \.\.\.-\. /gi, " ");
    return result;
  }

  function __morsePostUntrans(text) {
    var result = text;
    result = Trans.specialCharUntrans(result);
    result = result.replace(/ +/gi, "");
    result = result.replace(/\t/gi, "　");
    return result;
  }

  //==========================================
  // SHIKI FUNCTIONS
  //==========================================

  function __shikiPreTrans(text) {
    var result = text.replace(/し/gi, "si");
    result = result.replace(/ち/gi, "ti");
    result = result.replace(/つ/gi, "tu");
    result = result.replace(/ふ/gi, "hu");
    result = result.replace(/じ/gi, "zi");
    result = result.replace(/uぉ/gi, "o");
    result = result.replace(/uぁ/gi, "a");
    result = result.replace(/uぃ/gi, "i");
    result = result.replace(/uぇ/gi, "e");
    return result;
  }

  function __shikiPreUntrans(text) {
    let result = text;
    //result = result.replace(/([tzs])y/gi, "$1iy");
    result = result.replace(/si/gi, "し");
    result = result.replace(/ti/gi, "ち");
    result = result.replace(/tu/gi, "つ");
    result = result.replace(/hu/gi, "ふ");
    result = result.replace(/zi/gi, "じ");

    /*result = result.replace(/uぉ/gi, "o");
    result = result.replace(/uぁ/gi, "a");
    result = result.replace(/uぃ/gi, "i");
    result = result.replace(/uぇ/gi, "e");*/
    return result;
  }

  function __shikiPostTrans(text) {
    var result = text.replace(/ix/gi, "");
    result = __littleTsuPostTrans(result);
    return result;
  }

  function __littleTsuPostTrans(text) {
    return text.replace(/(っ+)(.)/gi, function(match, p1, p2) {
      return new Array(2 + p1.length).join(p2);
    });
  }

  function __nihonShikiPreUntrans(text) {
    let result = __doubleReplace(text);
    result = __shikiPreUntrans(result);
    result = result.replace(/di/gi, "ぢ");
    result = result.replace(/du/gi, "づ");
    return __xya2Jap(result);
  }

  function __nihonShikiPreTrans(text) {
    let result = __shikiPreTrans(text);
    result = result.replace(/ぢ/gi, "di");
    result = result.replace(/づ/gi, "du");
    return result;
  }

  /**
   * kunreiShiki pre-transliteration function
   *
   * @method __kunreiShikiPreTrans
   * @private
   * @memberof JpnTrans
   * @param  {String} text Japanese text
   * @return {String}      Pre-tranliterated text
   */
  function __kunreiShikiPreTrans(text) {
    let result = __shikiPreTrans(text);
    result = result.replace(/ぢ/gi, "zi");
    //result = result.replace(/づ/gi, "zu"); //already on hepburn
    return result;
  }

  /**
   * kunreiShiki pre-untransliteration function
   *
   * @method __kunreiShikiPreUntrans
   * @private
   * @memberof JpnTrans
   * @param  {String} text Romanized text
   * @return {String}      Pre-untranliterated text
   */
  function __kunreiShikiPreUntrans(text) {
    var result = __doubleReplace(text);
    result = __shikiPreUntrans(result);
    result = result.replace(/zi/gi, "ぢ");
    return __xya2Jap(result);
  }

  //==========================================
  // HEPBURN FUNCTIONS
  //==========================================

  function __hepburnPreTrans(text) {
    return text.replace(/([しちじぢ])([ゃぇゅょ])/gi, function(match, p1, p2){
      let result = hepburn[hiragana.indexOf(p1)];
      result = result + hepburn[hiragana.indexOf(p2)];
      return result.replace("ixy", "");
    });
  }

  function __hepburnPreUntrans(text) {
    var result = __doubleReplace(text);
    result = result.replace(/(sh|ch|j)([aeuo])/gi, function(match, p1, p2){
      let key = p1 + "i";
      if (hepburn.indexOf(key) > -1) {
        var result =  hiragana[hepburn.indexOf(key)];
        key = "xy" + p2;
        if (hepburn.indexOf(key) > -1) {
          result += hiragana[hepburn.indexOf(key)];
        }
        return result;
      }
      return match;
    });

    return __xya2Jap(result);
  }




  /**
  * Replace the doubled characters with a little "tsu" if different from "n"
  *
  * @method doubleReplace
  * @private
  * @memberof JpnTrans
  * @param  {String} text The text to be replaced
  * @return {String} The same string but the repeated characters are replaced
  */
  function __doubleReplace(text) {
    return text.replace(/(sh|ch|.)\1+/gi, function(match, p1) {
      //vowels are ignored
      if ("aeuio".indexOf(p1) > -1 ) return match;

      var repChar = "っ";

      if (p1 === "n")
        repChar = "ん";
      var repNbr = match.length/p1.length; //Math.floor() match is always a multiple of p1
      var rep = new Array(repNbr).join(repChar);

      return rep + p1;
    });
  }


  /**
   * Transform xya to Japanese little 'tsu' followed by ya
   *
   * @method __xya2Jap
   * @private
   * @memberof JpnTrans
   * @param  {string} text Romanized text
   * @return {string}      text with xya transformed to Japanese
   */
  function __xya2Jap(text) {
    //var result = text.replace("sh", "し").replace("ch", "ち");
    return text.replace(/(sh|ch|.)y([aeuio])/gi, function(match, p1, p2) {
      var key = p1 + "i";
      if (hepburn.indexOf(key) > -1) {
        var result =  hiragana[hepburn.indexOf(key)];
        key = "xy" + p2;
        if (hepburn.indexOf(key) > -1) {
          result += hiragana[hepburn.indexOf(key)];
        }
        return result;
      }

      return match;

    });
  }


  /**
  * Replace the lone characters with their equivalent + "u"
  *
  * @method __loneCharReplace
  * @private
  * @memberof JpnTrans
  * @param  {String} text the text to be replaced
  * @return {String}      The resulted text
  */
  function __loneCharReplace(text) {
    return text.replace(/[a-z][う]?/gi, function(x) {
      var key = x;
      if (x.length > 1) {
        if (x === "tう") {
          return "つ";
        }
        key = x[0];
      }

      key += "u";
      var result = "";
      if (key in loneUnTrans) {
        result = loneUnTrans[key];
      }

      if (x.length > 1) {
        result += "う";
      }

      return result;
    });
  }

}());
