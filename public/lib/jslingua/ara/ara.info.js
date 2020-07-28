(function() {

  //==========================================
  // MODULE & CONSTRUCTOR
  //==========================================

  "use strict";

  let Info = {};
  if ( typeof module === "object" && module && typeof module.exports === "object" ) {
    Info = require("../info.js");
    module.exports = AraInfo;
  }
  else {
    Info = window.JsLingua.Cls.Info;
    window.JsLingua.aserv("info", "ara", AraInfo);
  }

  /**
   * Contains information about Arabic language
   *
   * @class AraInfo
   * @extends Info
   */
  function AraInfo() {

    Info.call(this, "ara");
    this.name = "Arabic";
    this.origName = "عربية";
    this.dir = "rtl";
    this.wordOrder = "vso";
    this.family = "Afro-Asiatic";
    this.branch = "Semitic";

  }

  AraInfo.prototype = Object.create(Info.prototype);
  AraInfo.prototype.constructor = AraInfo;

  //==========================================
  // DATA
  //==========================================


  //==========================================
  // GETTER FUNCTIONS
  //==========================================


}());
