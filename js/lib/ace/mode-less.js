define("ace/mode/less",["require","exports","module","ace/lib/oop","ace/mode/text","ace/tokenizer","ace/mode/less_highlight_rules","ace/mode/matching_brace_outdent","ace/mode/behaviour/css","ace/mode/folding/cstyle"],function(e,t){var r=e("../lib/oop"),o=e("./text").Mode,n=(e("../tokenizer").Tokenizer,e("./less_highlight_rules").LessHighlightRules),i=e("./matching_brace_outdent").MatchingBraceOutdent,a=e("./behaviour/css").CssBehaviour,s=e("./folding/cstyle").FoldMode,l=function(){this.HighlightRules=n,this.$outdent=new i,this.$behaviour=new a,this.foldingRules=new s};r.inherits(l,o),function(){this.lineCommentStart="//",this.blockComment={start:"/*",end:"*/"},this.getNextLineIndent=function(e,t,r){var o=this.$getIndent(t),n=this.getTokenizer().getLineTokens(t,e).tokens;if(n.length&&"comment"==n[n.length-1].type)return o;var i=t.match(/^.*\{\s*$/);return i&&(o+=r),o},this.checkOutdent=function(e,t,r){return this.$outdent.checkOutdent(t,r)},this.autoOutdent=function(e,t,r){this.$outdent.autoOutdent(t,r)}}.call(l.prototype),t.Mode=l}),define("ace/mode/less_highlight_rules",["require","exports","module","ace/lib/oop","ace/lib/lang","ace/mode/text_highlight_rules"],function(e,t){var r=e("../lib/oop"),o=e("../lib/lang"),n=e("./text_highlight_rules").TextHighlightRules,i=function(){var e=o.arrayToMap(function(){for(var e="-webkit-|-moz-|-o-|-ms-|-svg-|-pie-|-khtml-".split("|"),t="appearance|background-clip|background-inline-policy|background-origin|background-size|binding|border-bottom-colors|border-left-colors|border-right-colors|border-top-colors|border-end|border-end-color|border-end-style|border-end-width|border-image|border-start|border-start-color|border-start-style|border-start-width|box-align|box-direction|box-flex|box-flexgroup|box-ordinal-group|box-orient|box-pack|box-sizing|column-count|column-gap|column-width|column-rule|column-rule-width|column-rule-style|column-rule-color|float-edge|font-feature-settings|font-language-override|force-broken-image-icon|image-region|margin-end|margin-start|opacity|outline|outline-color|outline-offset|outline-radius|outline-radius-bottomleft|outline-radius-bottomright|outline-radius-topleft|outline-radius-topright|outline-style|outline-width|padding-end|padding-start|stack-sizing|tab-size|text-blink|text-decoration-color|text-decoration-line|text-decoration-style|transform|transform-origin|transition|transition-delay|transition-duration|transition-property|transition-timing-function|user-focus|user-input|user-modify|user-select|window-shadow|border-radius".split("|"),r="azimuth|background-attachment|background-color|background-image|background-position|background-repeat|background|border-bottom-color|border-bottom-style|border-bottom-width|border-bottom|border-collapse|border-color|border-left-color|border-left-style|border-left-width|border-left|border-right-color|border-right-style|border-right-width|border-right|border-spacing|border-style|border-top-color|border-top-style|border-top-width|border-top|border-width|border|bottom|box-sizing|caption-side|clear|clip|color|content|counter-increment|counter-reset|cue-after|cue-before|cue|cursor|direction|display|elevation|empty-cells|float|font-family|font-size-adjust|font-size|font-stretch|font-style|font-variant|font-weight|font|height|left|letter-spacing|line-height|list-style-image|list-style-position|list-style-type|list-style|margin-bottom|margin-left|margin-right|margin-top|marker-offset|margin|marks|max-height|max-width|min-height|min-width|opacity|orphans|outline-color|outline-style|outline-width|outline|overflow|overflow-x|overflow-y|padding-bottom|padding-left|padding-right|padding-top|padding|page-break-after|page-break-before|page-break-inside|page|pause-after|pause-before|pause|pitch-range|pitch|play-during|position|quotes|richness|right|size|speak-header|speak-numeral|speak-punctuation|speech-rate|speak|stress|table-layout|text-align|text-decoration|text-indent|text-shadow|text-transform|top|unicode-bidi|vertical-align|visibility|voice-family|volume|white-space|widows|width|word-spacing|z-index".split("|"),o=[],n=0,i=e.length;i>n;n++)Array.prototype.push.apply(o,(e[n]+t.join("|"+e[n])).split("|"));return Array.prototype.push.apply(o,t),Array.prototype.push.apply(o,r),o}()),t=o.arrayToMap("hsl|hsla|rgb|rgba|url|attr|counter|counters|lighten|darken|saturate|desaturate|fadein|fadeout|fade|spin|mix|hue|saturation|lightness|alpha|round|ceil|floor|percentage|color|iscolor|isnumber|isstring|iskeyword|isurl|ispixel|ispercentage|isem".split("|")),r=o.arrayToMap("absolute|all-scroll|always|armenian|auto|baseline|below|bidi-override|block|bold|bolder|border-box|both|bottom|break-all|break-word|capitalize|center|char|circle|cjk-ideographic|col-resize|collapse|content-box|crosshair|dashed|decimal-leading-zero|decimal|default|disabled|disc|distribute-all-lines|distribute-letter|distribute-space|distribute|dotted|double|e-resize|ellipsis|fixed|georgian|groove|hand|hebrew|help|hidden|hiragana-iroha|hiragana|horizontal|ideograph-alpha|ideograph-numeric|ideograph-parenthesis|ideograph-space|inactive|inherit|inline-block|inline|inset|inside|inter-ideograph|inter-word|italic|justify|katakana-iroha|katakana|keep-all|left|lighter|line-edge|line-through|line|list-item|loose|lower-alpha|lower-greek|lower-latin|lower-roman|lowercase|lr-tb|ltr|medium|middle|move|n-resize|ne-resize|newspaper|no-drop|no-repeat|nw-resize|none|normal|not-allowed|nowrap|oblique|outset|outside|overline|pointer|progress|relative|repeat-x|repeat-y|repeat|right|ridge|row-resize|rtl|s-resize|scroll|se-resize|separate|small-caps|solid|square|static|strict|super|sw-resize|table-footer-group|table-header-group|tb-rl|text-bottom|text-top|text|thick|thin|top|transparent|underline|upper-alpha|upper-latin|upper-roman|uppercase|vertical-ideographic|vertical-text|visible|w-resize|wait|whitespace|zero".split("|")),n=o.arrayToMap("aqua|black|blue|fuchsia|gray|green|lime|maroon|navy|olive|orange|purple|red|silver|teal|white|yellow".split("|")),i=o.arrayToMap("@mixin|@extend|@include|@import|@media|@debug|@warn|@if|@for|@each|@while|@else|@font-face|@-webkit-keyframes|if|and|!default|module|def|end|declare|when|not|and".split("|")),a=o.arrayToMap("a|abbr|acronym|address|applet|area|article|aside|audio|b|base|basefont|bdo|big|blockquote|body|br|button|canvas|caption|center|cite|code|col|colgroup|command|datalist|dd|del|details|dfn|dir|div|dl|dt|em|embed|fieldset|figcaption|figure|font|footer|form|frame|frameset|h1|h2|h3|h4|h5|h6|head|header|hgroup|hr|html|i|iframe|img|input|ins|keygen|kbd|label|legend|li|link|map|mark|menu|meta|meter|nav|noframes|noscript|object|ol|optgroup|option|output|p|param|pre|progress|q|rp|rt|ruby|s|samp|script|section|select|small|source|span|strike|strong|style|sub|summary|sup|table|tbody|td|textarea|tfoot|th|thead|time|title|tr|tt|u|ul|var|video|wbr|xmp".split("|")),s="\\-?(?:(?:[0-9]+)|(?:[0-9]*\\.[0-9]+))";this.$rules={start:[{token:"comment",regex:"\\/\\/.*$"},{token:"comment",regex:"\\/\\*",next:"comment"},{token:"string",regex:'["](?:(?:\\\\.)|(?:[^"\\\\]))*?["]'},{token:"string",regex:"['](?:(?:\\\\.)|(?:[^'\\\\]))*?[']"},{token:"constant.numeric",regex:s+"(?:em|ex|px|cm|mm|in|pt|pc|deg|rad|grad|ms|s|hz|khz|%)"},{token:"constant.numeric",regex:"#[a-f0-9]{6}"},{token:"constant.numeric",regex:"#[a-f0-9]{3}"},{token:"constant.numeric",regex:s},{token:function(e){return i.hasOwnProperty(e)?"keyword":"variable"},regex:"@[a-z0-9_\\-@]*\\b"},{token:function(o){return e.hasOwnProperty(o.toLowerCase())?"support.type":i.hasOwnProperty(o)?"keyword":r.hasOwnProperty(o)?"constant.language":t.hasOwnProperty(o)?"support.function":n.hasOwnProperty(o.toLowerCase())?"support.constant.color":a.hasOwnProperty(o.toLowerCase())?"variable.language":"text"},regex:"\\-?[@a-z_][@a-z0-9_\\-]*"},{token:"variable.language",regex:"#[a-z0-9-_]+"},{token:"variable.language",regex:"\\.[a-z0-9-_]+"},{token:"variable.language",regex:":[a-z0-9-_]+"},{token:"constant",regex:"[a-z0-9-_]+"},{token:"keyword.operator",regex:"<|>|<=|>=|==|!=|-|%|#|\\+|\\$|\\+|\\*"},{token:"paren.lparen",regex:"[[({]"},{token:"paren.rparen",regex:"[\\])}]"},{token:"text",regex:"\\s+"},{caseInsensitive:!0}],comment:[{token:"comment",regex:".*?\\*\\/",next:"start"},{token:"comment",regex:".+"}]}};r.inherits(i,n),t.LessHighlightRules=i}),define("ace/mode/matching_brace_outdent",["require","exports","module","ace/range"],function(e,t){var r=e("../range").Range,o=function(){};(function(){this.checkOutdent=function(e,t){return/^\s+$/.test(e)?/^\s*\}/.test(t):!1},this.autoOutdent=function(e,t){var o=e.getLine(t),n=o.match(/^(\s*\})/);if(!n)return 0;var i=n[1].length,a=e.findMatchingBracket({row:t,column:i});if(!a||a.row==t)return 0;var s=this.$getIndent(e.getLine(a.row));e.replace(new r(t,0,t,i-1),s)},this.$getIndent=function(e){return e.match(/^\s*/)[0]}}).call(o.prototype),t.MatchingBraceOutdent=o}),define("ace/mode/behaviour/css",["require","exports","module","ace/lib/oop","ace/mode/behaviour","ace/mode/behaviour/cstyle","ace/token_iterator"],function(e,t){var r=e("../../lib/oop"),o=(e("../behaviour").Behaviour,e("./cstyle").CstyleBehaviour),n=e("../../token_iterator").TokenIterator,i=function(){this.inherit(o),this.add("colon","insertion",function(e,t,r,o,i){if(":"===i){var a=r.getCursorPosition(),s=new n(o,a.row,a.column),l=s.getCurrentToken();if(l&&l.value.match(/\s+/)&&(l=s.stepBackward()),l&&"support.type"===l.type){var u=o.doc.getLine(a.row),c=u.substring(a.column,a.column+1);if(":"===c)return{text:"",selection:[1,1]};if(!u.substring(a.column).match(/^\s*;/))return{text:":;",selection:[1,1]}}}}),this.add("colon","deletion",function(e,t,r,o,i){var a=o.doc.getTextRange(i);if(!i.isMultiLine()&&":"===a){var s=r.getCursorPosition(),l=new n(o,s.row,s.column),u=l.getCurrentToken();if(u&&u.value.match(/\s+/)&&(u=l.stepBackward()),u&&"support.type"===u.type){var c=o.doc.getLine(i.start.row),d=c.substring(i.end.column,i.end.column+1);if(";"===d)return i.end.column++,i}}}),this.add("semicolon","insertion",function(e,t,r,o,n){if(";"===n){var i=r.getCursorPosition(),a=o.doc.getLine(i.row),s=a.substring(i.column,i.column+1);if(";"===s)return{text:"",selection:[1,1]}}})};r.inherits(i,o),t.CssBehaviour=i}),define("ace/mode/behaviour/cstyle",["require","exports","module","ace/lib/oop","ace/mode/behaviour","ace/token_iterator","ace/lib/lang"],function(e,t){var r=e("../../lib/oop"),o=e("../behaviour").Behaviour,n=e("../../token_iterator").TokenIterator,i=e("../../lib/lang"),a=["text","paren.rparen","punctuation.operator"],s=["text","paren.rparen","punctuation.operator","comment"],l=0,u=-1,c="",d=0,g=-1,p="",h="",m=function(){m.isSaneInsertion=function(e,t){var r=e.getCursorPosition(),o=new n(t,r.row,r.column);if(!this.$matchTokenType(o.getCurrentToken()||"text",a)){var i=new n(t,r.row,r.column+1);if(!this.$matchTokenType(i.getCurrentToken()||"text",a))return!1}return o.stepForward(),o.getCurrentTokenRow()!==r.row||this.$matchTokenType(o.getCurrentToken()||"text",s)},m.$matchTokenType=function(e,t){return t.indexOf(e.type||e)>-1},m.recordAutoInsert=function(e,t,r){var o=e.getCursorPosition(),n=t.doc.getLine(o.row);this.isAutoInsertedClosing(o,n,c[0])||(l=0),u=o.row,c=r+n.substr(o.column),l++},m.recordMaybeInsert=function(e,t,r){var o=e.getCursorPosition(),n=t.doc.getLine(o.row);this.isMaybeInsertedClosing(o,n)||(d=0),g=o.row,p=n.substr(0,o.column)+r,h=n.substr(o.column),d++},m.isAutoInsertedClosing=function(e,t,r){return l>0&&e.row===u&&r===c[0]&&t.substr(e.column)===c},m.isMaybeInsertedClosing=function(e,t){return d>0&&e.row===g&&t.substr(e.column)===h&&t.substr(0,e.column)==p},m.popAutoInsertedClosing=function(){c=c.substr(1),l--},m.clearMaybeInsertedClosing=function(){d=0,g=-1},this.add("braces","insertion",function(e,t,r,o,n){var a=r.getCursorPosition(),s=o.doc.getLine(a.row);if("{"==n){var l=r.getSelectionRange(),u=o.doc.getTextRange(l);if(""!==u&&"{"!==u&&r.getWrapBehavioursEnabled())return{text:"{"+u+"}",selection:!1};if(m.isSaneInsertion(r,o))return/[\]\}\)]/.test(s[a.column])?(m.recordAutoInsert(r,o,"}"),{text:"{}",selection:[1,1]}):(m.recordMaybeInsert(r,o,"{"),{text:"{",selection:[1,1]})}else if("}"==n){var c=s.substring(a.column,a.column+1);if("}"==c){var g=o.$findOpeningBracket("}",{column:a.column+1,row:a.row});if(null!==g&&m.isAutoInsertedClosing(a,s,n))return m.popAutoInsertedClosing(),{text:"",selection:[1,1]}}}else if("\n"==n||"\r\n"==n){var p="";m.isMaybeInsertedClosing(a,s)&&(p=i.stringRepeat("}",d),m.clearMaybeInsertedClosing());var c=s.substring(a.column,a.column+1);if("}"==c||""!==p){var h=o.findMatchingBracket({row:a.row,column:a.column},"}");if(!h)return null;var f=this.getNextLineIndent(e,s.substring(0,a.column),o.getTabString()),b=this.$getIndent(s);return{text:"\n"+f+"\n"+b+p,selection:[1,f.length,1,f.length]}}}}),this.add("braces","deletion",function(e,t,r,o,n){var i=o.doc.getTextRange(n);if(!n.isMultiLine()&&"{"==i){var a=o.doc.getLine(n.start.row),s=a.substring(n.end.column,n.end.column+1);if("}"==s)return n.end.column++,n;d--}}),this.add("parens","insertion",function(e,t,r,o,n){if("("==n){var i=r.getSelectionRange(),a=o.doc.getTextRange(i);if(""!==a&&r.getWrapBehavioursEnabled())return{text:"("+a+")",selection:!1};if(m.isSaneInsertion(r,o))return m.recordAutoInsert(r,o,")"),{text:"()",selection:[1,1]}}else if(")"==n){var s=r.getCursorPosition(),l=o.doc.getLine(s.row),u=l.substring(s.column,s.column+1);if(")"==u){var c=o.$findOpeningBracket(")",{column:s.column+1,row:s.row});if(null!==c&&m.isAutoInsertedClosing(s,l,n))return m.popAutoInsertedClosing(),{text:"",selection:[1,1]}}}}),this.add("parens","deletion",function(e,t,r,o,n){var i=o.doc.getTextRange(n);if(!n.isMultiLine()&&"("==i){var a=o.doc.getLine(n.start.row),s=a.substring(n.start.column+1,n.start.column+2);if(")"==s)return n.end.column++,n}}),this.add("brackets","insertion",function(e,t,r,o,n){if("["==n){var i=r.getSelectionRange(),a=o.doc.getTextRange(i);if(""!==a&&r.getWrapBehavioursEnabled())return{text:"["+a+"]",selection:!1};if(m.isSaneInsertion(r,o))return m.recordAutoInsert(r,o,"]"),{text:"[]",selection:[1,1]}}else if("]"==n){var s=r.getCursorPosition(),l=o.doc.getLine(s.row),u=l.substring(s.column,s.column+1);if("]"==u){var c=o.$findOpeningBracket("]",{column:s.column+1,row:s.row});if(null!==c&&m.isAutoInsertedClosing(s,l,n))return m.popAutoInsertedClosing(),{text:"",selection:[1,1]}}}}),this.add("brackets","deletion",function(e,t,r,o,n){var i=o.doc.getTextRange(n);if(!n.isMultiLine()&&"["==i){var a=o.doc.getLine(n.start.row),s=a.substring(n.start.column+1,n.start.column+2);if("]"==s)return n.end.column++,n}}),this.add("string_dquotes","insertion",function(e,t,r,o,n){if('"'==n||"'"==n){var i=n,a=r.getSelectionRange(),s=o.doc.getTextRange(a);if(""!==s&&"'"!==s&&'"'!=s&&r.getWrapBehavioursEnabled())return{text:i+s+i,selection:!1};var l=r.getCursorPosition(),u=o.doc.getLine(l.row),c=u.substring(l.column-1,l.column);if("\\"==c)return null;for(var d,g=o.getTokens(a.start.row),p=0,h=-1,f=0;f<g.length&&(d=g[f],"string"==d.type?h=-1:0>h&&(h=d.value.indexOf(i)),!(d.value.length+p>a.start.column));f++)p+=g[f].value.length;if(!d||0>h&&"comment"!==d.type&&("string"!==d.type||a.start.column!==d.value.length+p-1&&d.value.lastIndexOf(i)===d.value.length-1)){if(!m.isSaneInsertion(r,o))return;return{text:i+i,selection:[1,1]}}if(d&&"string"===d.type){var b=u.substring(l.column,l.column+1);if(b==i)return{text:"",selection:[1,1]}}}}),this.add("string_dquotes","deletion",function(e,t,r,o,n){var i=o.doc.getTextRange(n);if(!n.isMultiLine()&&('"'==i||"'"==i)){var a=o.doc.getLine(n.start.row),s=a.substring(n.start.column+1,n.start.column+2);if(s==i)return n.end.column++,n}})};r.inherits(m,o),t.CstyleBehaviour=m}),define("ace/mode/folding/cstyle",["require","exports","module","ace/lib/oop","ace/range","ace/mode/folding/fold_mode"],function(e,t){var r=e("../../lib/oop"),o=(e("../../range").Range,e("./fold_mode").FoldMode),n=t.FoldMode=function(e){e&&(this.foldingStartMarker=new RegExp(this.foldingStartMarker.source.replace(/\|[^|]*?$/,"|"+e.start)),this.foldingStopMarker=new RegExp(this.foldingStopMarker.source.replace(/\|[^|]*?$/,"|"+e.end)))};r.inherits(n,o),function(){this.foldingStartMarker=/(\{|\[)[^\}\]]*$|^\s*(\/\*)/,this.foldingStopMarker=/^[^\[\{]*(\}|\])|^[\s\*]*(\*\/)/,this.getFoldWidgetRange=function(e,t,r){var o=e.getLine(r),n=o.match(this.foldingStartMarker);if(n){var i=n.index;return n[1]?this.openingBracketBlock(e,n[1],r,i):e.getCommentFoldRange(r,i+n[0].length,1)}if("markbeginend"===t){var n=o.match(this.foldingStopMarker);if(n){var i=n.index+n[0].length;return n[1]?this.closingBracketBlock(e,n[1],r,i):e.getCommentFoldRange(r,i,-1)}}}}.call(n.prototype)});
//# sourceMappingURL=mode-less.js.map