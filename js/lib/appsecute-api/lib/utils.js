define(["underscore","moment"],function(e,t){return{isFunction:function(t){return e.isFunction(t)},isUrl:function(e){if(!e)return!1;if("/"===e.substring(0,1))return!0;var t=new RegExp("(http|https){0,1}(://){0,1}w*(../)+([a-zA-Z0-9])+(.[A-Za-z]){0,1}","i");return t.test(e)},parseUrl:function(e){var t,r=/^(?:([A-Za-z]+):)?(\/{0,3})([0-9.\-A-Za-z]+)(?::(\d+))?(?:\/([^?#]*))?(?:\?([^#]*))?(?:#(.*))?$/,n=r.exec(e),o=["url","scheme","slash","host","port","path","query","hash"],i={};for(t=0;t<o.length;t+=1)i[o[t]]=n[t];return i},reconstructServerUrl:function(e){var t,r=require("appsecute-api/lib/start"),n=r.getStartDocumentUri();if(n){var o=this.parseUrl(n);o.scheme&&o.slash&&o.host&&(t=o.scheme+":"+o.slash+o.host,o.port&&(t+=":"+o.port))}return t||(t=window.location.protocol+"//"+window.location.host),t+="/"+e},getGuid:function(){var e="xxxxxxxx-xxxx-4xxx-yxxx-xxxxxxxxxxxx".replace(/[xy]/g,function(e){var t=16*Math.random()|0,r="x"===e?t:3&t|8;return r.toString(16)}).toUpperCase();return e},processHttpHeaders:function(e){for(var t,r=/^(.*?):[ \t]*([^\r\n]*)\r?$/gm,n={};;){if(t=r.exec(e),!t)break;n[t[1].toLowerCase()]=t[2]}return n},getCookie:function(e){var t,r,n,o=null,i=document.cookie.split(";");for(t=0;t<i.length;t++)if(r=i[t].substr(0,i[t].indexOf("=")),n=i[t].substr(i[t].indexOf("=")+1),r=r.replace(/^\s+|\s+$/g,""),r===e){o=unescape(n);break}return o},setCookie:function(e,t,r,n,o,i){document.cookie=e+"="+escape(t)+(r?";expires="+r.toGMTString():"")+(n?";path="+n:"")+(o?";domain="+o:"")+(i?";secure":"")},deleteCookie:function(e,t,r){document.cookie=e+"="+(t?";path="+t:"")+(r?";domain="+r:"")+";expires=Thu, 01-Jan-1970 00:00:01 GMT"},getDateString:function(e,r){return t(e).format("MM/DD/YYYY HH:mm"+(r?":ss":""))},isArray:function(t){return e.isArray(t)},strEndsWith:function(e,t){return-1!==e.indexOf(t,e.length-t.length)}}});
//# sourceMappingURL=utils.js.map