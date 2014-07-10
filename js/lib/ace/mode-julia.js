define("ace/mode/julia",["require","exports","module","ace/lib/oop","ace/mode/text","ace/tokenizer","ace/mode/julia_highlight_rules","ace/mode/folding/cstyle"],function(e,t){var i=e("../lib/oop"),o=e("./text").Mode,n=(e("../tokenizer").Tokenizer,e("./julia_highlight_rules").JuliaHighlightRules),r=e("./folding/cstyle").FoldMode,a=function(){this.HighlightRules=n,this.foldingRules=new r};i.inherits(a,o),function(){this.lineCommentStart="#",this.blockComment=""}.call(a.prototype),t.Mode=a}),define("ace/mode/julia_highlight_rules",["require","exports","module","ace/lib/oop","ace/mode/text_highlight_rules"],function(e,t){var i=e("../lib/oop"),o=e("./text_highlight_rules").TextHighlightRules,n=function(){this.$rules={start:[{include:"#function_decl"},{include:"#function_call"},{include:"#type_decl"},{include:"#keyword"},{include:"#operator"},{include:"#number"},{include:"#string"},{include:"#comment"}],"#bracket":[{token:"keyword.bracket.julia",regex:"\\(|\\)|\\[|\\]|\\{|\\}|,"}],"#comment":[{token:["punctuation.definition.comment.julia","comment.line.number-sign.julia"],regex:"(#)(?!\\{)(.*$)"}],"#function_call":[{token:["support.function.julia","text"],regex:"([a-zA-Z0-9_]+!?)(\\w*\\()"}],"#function_decl":[{token:["keyword.other.julia","meta.function.julia","entity.name.function.julia","meta.function.julia","text"],regex:"(function|macro)(\\s*)([a-zA-Z0-9_\\{]+!?)(\\w*)([(\\\\{])"}],"#keyword":[{token:"keyword.other.julia",regex:"\\b(?:function|type|immutable|macro|quote|abstract|bitstype|typealias|module|baremodule|new)\\b"},{token:"keyword.control.julia",regex:"\\b(?:if|else|elseif|while|for|in|begin|let|end|do|try|catch|finally|return|break|continue)\\b"},{token:"storage.modifier.variable.julia",regex:"\\b(?:global|local|const|export|import|importall|using)\\b"},{token:"variable.macro.julia",regex:"@\\w+\\b"}],"#number":[{token:"constant.numeric.julia",regex:"\\b0(?:x|X)[0-9a-fA-F]*|(?:\\b[0-9]+\\.?[0-9]*|\\.[0-9]+)(?:(?:e|E)(?:\\+|-)?[0-9]*)?(?:im)?|\\bInf(?:32)?\\b|\\bNaN(?:32)?\\b|\\btrue\\b|\\bfalse\\b"}],"#operator":[{token:"keyword.operator.update.julia",regex:"=|:=|\\+=|-=|\\*=|/=|//=|\\.//=|\\.\\*=|\\\\=|\\.\\\\=|^=|\\.^=|%=|\\|=|&=|\\$=|<<=|>>="},{token:"keyword.operator.ternary.julia",regex:"\\?|:"},{token:"keyword.operator.boolean.julia",regex:"\\|\\||&&|!"},{token:"keyword.operator.arrow.julia",regex:"->|<-|-->"},{token:"keyword.operator.relation.julia",regex:">|<|>=|<=|==|!=|\\.>|\\.<|\\.>=|\\.>=|\\.==|\\.!=|\\.=|\\.!|<:|:>"},{token:"keyword.operator.range.julia",regex:":"},{token:"keyword.operator.shift.julia",regex:"<<|>>"},{token:"keyword.operator.bitwise.julia",regex:"\\||\\&|~"},{token:"keyword.operator.arithmetic.julia",regex:"\\+|-|\\*|\\.\\*|/|\\./|//|\\.//|%|\\.%|\\\\|\\.\\\\|\\^|\\.\\^"},{token:"keyword.operator.isa.julia",regex:"::"},{token:"keyword.operator.dots.julia",regex:"\\.(?=[a-zA-Z])|\\.\\.+"},{token:"keyword.operator.interpolation.julia",regex:"\\$#?(?=.)"},{token:["variable","keyword.operator.transposed-variable.julia"],regex:"(\\w+)((?:'|\\.')*\\.?')"},{token:"text",regex:"\\[|\\("},{token:["text","keyword.operator.transposed-matrix.julia"],regex:"([\\]\\)])((?:'|\\.')*\\.?')"}],"#string":[{token:"punctuation.definition.string.begin.julia",regex:"'",push:[{token:"punctuation.definition.string.end.julia",regex:"'",next:"pop"},{include:"#string_escaped_char"},{defaultToken:"string.quoted.single.julia"}]},{token:"punctuation.definition.string.begin.julia",regex:'"',push:[{token:"punctuation.definition.string.end.julia",regex:'"',next:"pop"},{include:"#string_escaped_char"},{defaultToken:"string.quoted.double.julia"}]},{token:"punctuation.definition.string.begin.julia",regex:'\\b\\w+"',push:[{token:"punctuation.definition.string.end.julia",regex:'"\\w*',next:"pop"},{include:"#string_custom_escaped_char"},{defaultToken:"string.quoted.custom-double.julia"}]},{token:"punctuation.definition.string.begin.julia",regex:"`",push:[{token:"punctuation.definition.string.end.julia",regex:"`",next:"pop"},{include:"#string_escaped_char"},{defaultToken:"string.quoted.backtick.julia"}]}],"#string_custom_escaped_char":[{token:"constant.character.escape.julia",regex:'\\\\"'}],"#string_escaped_char":[{token:"constant.character.escape.julia",regex:"\\\\(?:\\\\|[0-3]\\d{,2}|[4-7]\\d?|x[a-fA-F0-9]{,2}|u[a-fA-F0-9]{,4}|U[a-fA-F0-9]{,8}|.)"}],"#type_decl":[{token:["keyword.control.type.julia","meta.type.julia","entity.name.type.julia","entity.other.inherited-class.julia","punctuation.separator.inheritance.julia","entity.other.inherited-class.julia"],regex:"(type|immutable)(\\s+)([a-zA-Z0-9_]+)(?:(\\s*)(<:)(\\s*[.a-zA-Z0-9_:]+))?"},{token:["other.typed-variable.julia","support.type.julia"],regex:"([a-zA-Z0-9_]+)(::[a-zA-Z0-9_{}]+)"}]},this.normalizeRules()};n.metaData={fileTypes:["jl"],firstLineMatch:"^#!.*\\bjulia\\s*$",foldingStartMarker:"^\\s*(?:if|while|for|begin|function|macro|module|baremodule|type|immutable|let)\\b(?!.*\\bend\\b).*$",foldingStopMarker:"^\\s*(?:end)\\b.*$",name:"Julia",scopeName:"source.julia"},i.inherits(n,o),t.JuliaHighlightRules=n}),define("ace/mode/folding/cstyle",["require","exports","module","ace/lib/oop","ace/range","ace/mode/folding/fold_mode"],function(e,t){var i=e("../../lib/oop"),o=(e("../../range").Range,e("./fold_mode").FoldMode),n=t.FoldMode=function(e){e&&(this.foldingStartMarker=new RegExp(this.foldingStartMarker.source.replace(/\|[^|]*?$/,"|"+e.start)),this.foldingStopMarker=new RegExp(this.foldingStopMarker.source.replace(/\|[^|]*?$/,"|"+e.end)))};i.inherits(n,o),function(){this.foldingStartMarker=/(\{|\[)[^\}\]]*$|^\s*(\/\*)/,this.foldingStopMarker=/^[^\[\{]*(\}|\])|^[\s\*]*(\*\/)/,this.getFoldWidgetRange=function(e,t,i){var o=e.getLine(i),n=o.match(this.foldingStartMarker);if(n){var r=n.index;return n[1]?this.openingBracketBlock(e,n[1],i,r):e.getCommentFoldRange(i,r+n[0].length,1)}if("markbeginend"===t){var n=o.match(this.foldingStopMarker);if(n){var r=n.index+n[0].length;return n[1]?this.closingBracketBlock(e,n[1],i,r):e.getCommentFoldRange(i,r,-1)}}}}.call(n.prototype)});
//# sourceMappingURL=mode-julia.js.map