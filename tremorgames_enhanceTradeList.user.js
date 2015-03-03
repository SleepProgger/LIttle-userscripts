// ==UserScript==
// @name        tremor_Games_pricelist
// @namespace   somefoo
// @include     http://www.tremorgames.com/?action=tradeinprices*
// @version     1
// @grant       none
// ==/UserScript==

var pnl = $('<div id="foo"" style="background: #ededed; width: 100%; height: 20px; padding: 5px; margin: 5px;"></div>');

var chk_hide_nav = $('<input type="checkbox" name="hide_nav" style="margin: 4px">');
chk_hide_nav.change(function(){
  if(chk_hide_nav.prop("checked")) $('#prices tbody tr :empty').parent().hide();
  else  $('#prices tbody tr :empty').parent().show();
});

var chk_hide_req = $('<input type="checkbox" name="hide_req" style="margin: 4px">');
chk_hide_req.change(function(){
  var foo = "show";
  if(chk_hide_req.prop("checked")) foo = "hide";
  $("#prices tbody tr").each(function(){
    if( $(this).find("td").get(3).innerHTML <= 0 ) $(this)[foo]();
  });
});

pnl.insertBefore($("#prices"))
pnl.append("Hide not owned  ");
pnl.append(chk_hide_nav);
pnl.append("Hide not required  ");
pnl.append(chk_hide_req);
