define("ace/mode/makefile",["require","exports","module","ace/lib/oop","ace/mode/text","ace/tokenizer","ace/mode/makefile_highlight_rules","ace/mode/folding/coffee"],function(e,t){var i=e("../lib/oop"),n=e("./text").Mode,o=(e("../tokenizer").Tokenizer,e("./makefile_highlight_rules").MakefileHighlightRules),r=e("./folding/coffee").FoldMode,a=function(){this.HighlightRules=o,this.foldingRules=new r};i.inherits(a,n),function(){this.lineCommentStart="#",this.$indentWithTabs=!0}.call(a.prototype),t.Mode=a}),define("ace/mode/makefile_highlight_rules",["require","exports","module","ace/lib/oop","ace/mode/text_highlight_rules","ace/mode/sh_highlight_rules"],function(e,t){var i=e("../lib/oop"),n=e("./text_highlight_rules").TextHighlightRules,o=e("./sh_highlight_rules"),r=function(){var e=this.createKeywordMapper({keyword:o.reservedKeywords,"support.function.builtin":o.languageConstructs,"invalid.deprecated":"debugger"},"string");this.$rules={start:[{token:"string.interpolated.backtick.makefile",regex:"`",next:"shell-start"},{token:"punctuation.definition.comment.makefile",regex:/#(?=.)/,next:"comment"},{token:["keyword.control.makefile"],regex:"^(?:\\s*\\b)(\\-??include|ifeq|ifneq|ifdef|ifndef|else|endif|vpath|export|unexport|define|endef|override)(?:\\b)"},{token:["entity.name.function.makefile","text"],regex:"^([^\\t ]+(?:\\s[^\\t ]+)*:)(\\s*.*)"}],comment:[{token:"punctuation.definition.comment.makefile",regex:/.+\\/},{token:"punctuation.definition.comment.makefile",regex:".+",next:"start"}],"shell-start":[{token:e,regex:"[a-zA-Z_$][a-zA-Z0-9_$]*\\b"},{token:"string",regex:"\\w+"},{token:"string.interpolated.backtick.makefile",regex:"`",next:"start"}]}};i.inherits(r,n),t.MakefileHighlightRules=r}),define("ace/mode/sh_highlight_rules",["require","exports","module","ace/lib/oop","ace/mode/text_highlight_rules"],function(e,t){var i=e("../lib/oop"),n=e("./text_highlight_rules").TextHighlightRules,o=t.reservedKeywords="!|{|}|case|do|done|elif|else|esac|fi|for|if|in|then|until|while|&|;|export|local|read|typeset|unset|elif|select|set",r=t.languageConstructs="[|]|alias|bg|bind|break|builtin|cd|command|compgen|complete|continue|dirs|disown|echo|enable|eval|exec|exit|fc|fg|getopts|hash|help|history|jobs|kill|let|logout|popd|printf|pushd|pwd|return|set|shift|shopt|source|suspend|test|times|trap|type|ulimit|umask|unalias|wait",a=function(){var e=this.createKeywordMapper({keyword:o,"support.function.builtin":r,"invalid.deprecated":"debugger"},"identifier"),t="(?:(?:[1-9]\\d*)|(?:0))",i="(?:\\.\\d+)",n="(?:\\d+)",a="(?:(?:"+n+"?"+i+")|(?:"+n+"\\.))",l="(?:(?:"+a+"|"+n+"))",s="(?:"+l+"|"+a+")",g="(?:&"+n+")",d="[a-zA-Z][a-zA-Z0-9_]*",f="(?:(?:\\$"+d+")|(?:"+d+"=))",u="(?:\\$(?:SHLVL|\\$|\\!|\\?))",c="(?:"+d+"\\s*\\(\\))";this.$rules={start:[{token:"constant",regex:/\\./},{token:["text","comment"],regex:/(^|\s)(#.*)$/},{token:"string",regex:'"',push:[{token:"constant.language.escape",regex:/\\(?:[$abeEfnrtv\\'"]|x[a-fA-F\d]{1,2}|u[a-fA-F\d]{4}([a-fA-F\d]{4})?|c.|\d{1,3})/},{token:"constant",regex:/\$\w+/},{token:"string",regex:'"',next:"pop"},{defaultToken:"string"}]},{token:"variable.language",regex:u},{token:"variable",regex:f},{token:"support.function",regex:c},{token:"support.function",regex:g},{token:"string",start:"'",end:"'"},{token:"constant.numeric",regex:s},{token:"constant.numeric",regex:t+"\\b"},{token:e,regex:"[a-zA-Z_$][a-zA-Z0-9_$]*\\b"},{token:"keyword.operator",regex:"\\+|\\-|\\*|\\*\\*|\\/|\\/\\/|~|<|>|<=|=>|=|!="},{token:"paren.lparen",regex:"[\\[\\(\\{]"},{token:"paren.rparen",regex:"[\\]\\)\\}]"}]},this.normalizeRules()};i.inherits(a,n),t.ShHighlightRules=a}),define("ace/mode/folding/coffee",["require","exports","module","ace/lib/oop","ace/mode/folding/fold_mode","ace/range"],function(e,t){var i=e("../../lib/oop"),n=e("./fold_mode").FoldMode,o=e("../../range").Range,r=t.FoldMode=function(){};i.inherits(r,n),function(){this.getFoldWidgetRange=function(e,t,i){var n=this.indentationBlock(e,i);if(n)return n;var r=/\S/,a=e.getLine(i),l=a.search(r);if(-1!=l&&"#"==a[l]){for(var s=a.length,g=e.getLength(),d=i,f=i;++i<g;){a=e.getLine(i);var u=a.search(r);if(-1!=u){if("#"!=a[u])break;f=i}}if(f>d){var c=e.getLine(f).length;return new o(d,s,f,c)}}},this.getFoldWidget=function(e,t,i){var n=e.getLine(i),o=n.search(/\S/),r=e.getLine(i+1),a=e.getLine(i-1),l=a.search(/\S/),s=r.search(/\S/);if(-1==o)return e.foldWidgets[i-1]=-1!=l&&s>l?"start":"","";if(-1==l){if(o==s&&"#"==n[o]&&"#"==r[o])return e.foldWidgets[i-1]="",e.foldWidgets[i+1]="","start"}else if(l==o&&"#"==n[o]&&"#"==a[o]&&-1==e.getLine(i-2).search(/\S/))return e.foldWidgets[i-1]="start",e.foldWidgets[i+1]="","";return e.foldWidgets[i-1]=-1!=l&&o>l?"start":"",s>o?"start":""}}.call(r.prototype)});
//# sourceMappingURL=mode-makefile.js.map