(function() {

  //==========================================
  // MODULE & CONSTRUCTOR
  //==========================================

  "use strict";

  let Info = {};
  if ( typeof module === "object" && module && typeof module.exports === "object" ) {
    Info = require("../info.js");
    module.exports = EngInfo;
  }
  else {
    Info = window.JsLingua.Cls.Info;
    window.JsLingua.aserv("info", "eng", EngInfo);
  }

  /**
   * Contains information about English language
   * @class EngInfo
   * @extends Info
   */
  function EngInfo() {

    Info.call(this, "eng");
    this.name = "English";
    this.origName = "English";
    this.family = "Indo-European";
    this.branch = "Germanic";
  }

  EngInfo.prototype = Object.create(Info.prototype);
  EngInfo.prototype.constructor = EngInfo;


  //==========================================
  // DATA
  //==========================================


  //==========================================
  // GETTER FUNCTIONS
  //==========================================

}());
