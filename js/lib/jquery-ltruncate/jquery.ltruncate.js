!function(s){var t=function(t,e){var n=this;n.items=null,n.status=null,n.showText=null,n.hideText=null;var h={length:10,showText:"More",showClass:"show",hideText:"Less",hideClass:"hide",startStatus:"hidden",showCountHiddenItems:!1},e=s.extend(h,e),i=function(){n.status=e.startStatus,n.items=t.children(),n.items.length>e.length&&(n.items.each(function(t){t+1>e.length&&s(this).addClass("more-less-item").css("display","none")}),n.showContent=s(".more-less-item",t),n.showText=(e.showCountHiddenItems?e.showText+" ("+(n.items.length-e.length)+") ":e.showText)+"...",n.hideText=e.hideText+"...",n.showLink=s("<li>").addClass("more-less-link").append(n.showText),t.append(n.showLink),a(),o())},o=function(){switch(e.startStatus){case"hidden":n.hideItems();break;case"show":n.showItems();break;default:throw"InvalidStartStatusException"}},a=function(){n.showLink.click(function(){return"hidden"==n.status?n.showItems():n.hideItems(),!1})};n.hideItems=function(){n.showContent.hide(),n.showLink.text(n.showText).addClass(e.hideClass).removeClass(e.showClass),n.status="hidden"},n.showItems=function(){n.showContent.show(),n.showLink.text(n.hideText).addClass(e.showClass).removeClass(e.hideClass),n.status="show"},i()};s.fn.lTruncate=function(e){return this.each(function(){new t(s(this),e)})}}(jQuery);
//# sourceMappingURL=jquery.ltruncate.js.map