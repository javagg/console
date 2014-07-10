define("ace/ext/spellcheck",["require","exports","module","ace/lib/event","ace/editor","ace/config"],function(e,t){var n=e("../lib/event");t.contextMenuHandler=function(e){var t=e.target,i=t.textInput.getElement();if(t.selection.isEmpty()){var s=t.getCursorPosition(),o=t.session.getWordRange(s.row,s.column),r=t.session.getTextRange(o);if(t.session.tokenRe.lastIndex=0,t.session.tokenRe.test(r)){var l="",c=r+" "+l;i.value=c,i.setSelectionRange(r.length,r.length+1),i.setSelectionRange(0,0),i.setSelectionRange(0,r.length);var a=!1;n.addListener(i,"keydown",function u(){n.removeListener(i,"keydown",u),a=!0}),t.textInput.setInputHandler(function(e){if(console.log(e,c,i.selectionStart,i.selectionEnd),e==c)return"";if(0===e.lastIndexOf(c,0))return e.slice(c.length);if(e.substr(i.selectionEnd)==c)return e.slice(0,-c.length);if(e.slice(-2)==l){var n=e.slice(0,-2);if(" "==n.slice(-1))return a?n.substring(0,i.selectionEnd):(n=n.slice(0,-1),t.session.replace(o,n),"")}return e})}}};var i=e("../editor").Editor;e("../config").defineOptions(i.prototype,"editor",{spellcheck:{set:function(e){var n=this.textInput.getElement();n.spellcheck=!!e,e?this.on("nativecontextmenu",t.contextMenuHandler):this.removeListener("nativecontextmenu",t.contextMenuHandler)},value:!0}})});
//# sourceMappingURL=ext-spellcheck.js.map