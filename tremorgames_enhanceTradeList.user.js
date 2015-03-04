// ==UserScript==
// @name        tremor_Games_pricelist
// @namespace   somefoo
// @include     http://www.tremorgames.com/?action=tradeinprices*
// @version     1.2
// @grant       none
// ==/UserScript==


// some utility patches
$.fn.checkSelfVisible = function() {
  return this.filter(function() {
     // todo check  visbility when required
    return $(this).css("display") != "none";
  });
};
// not used atm
$.fn.checkSelfInVisible = function() {
  return this.filter(function() {
    return $(this).css("display") == "none";
  });
};
$.fn.filterData = function(key, value) {
  return this.filter(function() {
    return $(this).data(key) == value;
  });
};
if (typeof String.prototype.startsWith != 'function') {
  // see below for better implementation!
  String.prototype.startsWith = function (str){
    return this.indexOf(str) == 0;
  };
};


var status_div = $('<div style="display: inline">Nothing to do</div>');
var pnl = $('<div id="foo"" style="background: #ededed; width: 100%; height: 20px; padding: 5px; margin: 5px;"></div>');


// TODO: this function is ugly. Split in one for hidding, and one for showing ?
function filter_wrap(filter, fname, hidden, func){
  hidden = typeof hidden !== 'undefined' ? hidden : false;
  func = typeof func !== 'undefined' ? func : "hide";
  var prices = $("#prices");
  var elems;
  if(hidden){
    var elems = prices.find("tbody tr").filterData(fname, "1").filter(filter);
    console.log("Show ", elems.length, "elements");
    elems.removeData(fname);
    elems[func]();
  }else{
    elems = prices.find("tbody tr").checkSelfVisible().filter(filter);
    elems.data(fname, "1");
    console.log("added data", fname, elems.data(fname));
    elems[func]();
  }
};


function filterTextWorker(){
  if(!interval_running) return;
  var text = txt_search.val();
  if( text != lastSearch ){
    console.log("change detected.", lastSearch, text);
    filter_by_title(text);
  }
  if(interval_running) setTimeout(filterTextWorker, worker_interval);
};

function filter_by_title(_text, shouldHide){
  shouldHide = typeof shouldHide !== 'undefined' ? shouldHide : true;
  with_status("Search for text: " + _text, function(text, _hide){
    if(_hide) $('#prices').hide();
    var ltext = text.toLowerCase();  
    var oldText = lastSearch;
    lastSearch = text;
    // TODO: use an higher min char count and use this again in general?
    //if(text.length <=  2){
    // filter_wrap(null, "search", false);
    //}else{

    // filter the visible entries
    filter_wrap(function(){
      return ! $(this).find("td a").get(0).innerHTML.toLowerCase().startsWith(ltext);
    }, "search", false, "hide");

    // add removed entries again, if required
    if(! text.startsWith(oldText)){
      filter_wrap(function(){
        return $(this).find("td a").get(0).innerHTML.toLowerCase().startsWith(ltext);
      }, "search", true, "show");

      if(chk_hide_nav.prop("checked")) hide_not_owned();
      if(chk_hide_req.prop("checked")) hide_not_required();
    }
    if(_hide) $('#prices').show();
    status_div.html("Done");
  }, [_text, shouldHide]);
};


function hide_not_required(shouldHide){
  shouldHide = typeof shouldHide !== 'undefined' ? shouldHide : true;
  with_status("Hide not required games", function(_hide){
    console.log("called with", _hide);
    if(_hide) $('#prices').hide();
    filter_wrap(function(){
      return $(this).children("td").get(3).innerHTML <= 0;
    }, "not_required", ! chk_hide_req.prop("checked"), chk_hide_req.prop("checked") ? "hide" : "show");
    if(! chk_hide_req.prop("checked")){  
      if(chk_hide_nav.prop("checked")) hide_not_owned(false);
      if(txt_search.val().length > 0) filter_by_title(txt_search.val(), false);
    }
    if(_hide) $('#prices').show();
    status_div.html("Done");
  }, [shouldHide]);
};

function hide_not_owned(shouldHide){
  shouldHide = typeof shouldHide !== 'undefined' ? shouldHide : true;
  with_status("Hide not owned games", function(_hide){
    console.log("called with", _hide);
    if(_hide) $('#prices').hide();
    filter_wrap(function(){
      return $(this).children("td").get(4).innerHTML.length <= 0;
    }, "not_owned", ! chk_hide_nav.prop("checked"), chk_hide_nav.prop("checked") ? "hide" : "show");
    if(! chk_hide_nav.prop("checked")){  
      if(chk_hide_req.prop("checked")) hide_not_required(false);
      if(txt_search.val().length > 0) filter_by_title(txt_search.val(), false);
    }
    if(_hide) $('#prices').show();
    status_div.html("Done");  
  }, [shouldHide]);
};


function with_status(message, func, args){
  console.log("status: " + message);
  status_div.html(message);
  setTimeout(function(){
    console.log("apply call to", func, "with param", args);
   func.apply(null, args);
  }, 100);
};



// hide not owned items
var chk_hide_nav = $('<input type="checkbox" name="hide_nav" style="margin: 4px">');
chk_hide_nav.change(hide_not_owned);

// hide not required items
var chk_hide_req = $('<input type="checkbox" name="hide_req" style="margin: 4px">');
chk_hide_req.change(hide_not_required);

// implements the search
var txt_search = $('<input type="text" value="" style="margin: 4px" />');
var lastSearch = "";
var interval_running = false;
var worker_interval = 500;
txt_search.focusin(function(){
  console.log("focus in");
  interval_running = true;
  filterTextWorker();
  
});
txt_search.focusout(function(){
  console.log("focus out");
  interval_running = true;
  setTimeout(function(){
    filter_by_title(txt_search.val(), true);
  }, 0);
  interval_running = false;
});


pnl.insertBefore($("#prices"))
pnl.append("Hide not owned  ");
pnl.append(chk_hide_nav);
pnl.append("Hide not required");
pnl.append(chk_hide_req);
pnl.append("Search");
pnl.append(txt_search);
pnl.append(status_div);
//})();
