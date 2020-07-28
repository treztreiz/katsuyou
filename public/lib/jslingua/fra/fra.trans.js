(function() {

  "use strict";

  //==========================================
  // EXPORTING MODULE
  //==========================================

  let Trans = null;
  let EngTrans = null;
  if ( typeof module === "object" && module && typeof module.exports === "object" ) {
    Trans = require("../trans.js");
    module.exports = FraTrans;
    EngTrans = require("../eng/eng.trans.js");
  }
  else {
    Trans = window.JsLingua.Cls.Trans;
    window.JsLingua.aserv("trans", "fra", FraTrans);
    EngTrans = window.JsLingua.gserv("trans", "eng");
  }

  //==========================================
  // CONSTANTS
  //==========================================

  const latinRep = {
    "ç": "c",
    "à": "a",
    "è": "e",
    "é": "e",
    "ù": "u"
  },
  latinChars = "[" + Object.keys(latinRep).toString().replace(/,/g, "") + "]";

  //==========================================
  // CLASS CONSTRUCTOR
  //==========================================

  /**
   * French transliteration
   *
   * @class FraTrans
   * @extends Trans
   * @uses EngTrans
   */
  function FraTrans() {
    if (EngTrans.prototype != null){
      EngTrans.call(this);
      let oldPreTrans = this.methods["morse"].preTrans;
      this.methods["morse"].preTrans = function(text) {
        //let result = text.toLowerCase();
        text = text.replace(new RegExp(latinChars, "g"), c => latinRep[c]);
        return oldPreTrans(text);
      }
    }
    else Trans.call(this, "fra");
    this.code = "fra";
  }

  if (EngTrans.prototype != null) {
    FraTrans.prototype = Object.create(EngTrans.prototype);
  }
  else {
    FraTrans.prototype = Object.create(Trans.prototype);
  }

  FraTrans.prototype.constructor = FraTrans;


}());
