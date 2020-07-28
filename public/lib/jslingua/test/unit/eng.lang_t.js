var EngLang = require('../../eng/eng.lang');
var expect = require('expect.js');

var lang = new EngLang();

describe("English Lang", function(){

  it("pronounceNumber", function(){
    expect(lang.pronounceNumber(1025)).to.eql("one thousand, twenty-five");
  });

  it("charSets", function(){
    var charsets = lang.availableCharSets();
    expect(charsets.length).to.eql(1);//the number of charsets
    var txt = "I am in the charset.";
    var j, all=0, contains=0;
    for(j=0; j < charsets.length; j++){
      var allFct = lang.allCharSetFunction(charsets[j]);
      var containsFct = lang.containsCharSetFunction(charsets[j]);
      all += (allFct(txt))? 1 : 0;
      contains += (containsFct(txt))? 1 : 0;
    }
    expect(all).to.eql(1);
    expect(contains).to.eql(1);
  });

  it("Transform", function(){
    expect(lang.availableTransformations().length).to.eql(2);
    var min = "azerty";
    var maj = "AZERTY";
    var func = lang.transformationFunction("min2maj");
    expect(func(min)).to.eql(maj);
    func = lang.transformationFunction("maj2min");
    expect(func(maj)).to.eql(min);
  });

});
