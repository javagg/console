define("ace/mode/sql",["require","exports","module","ace/lib/oop","ace/mode/text","ace/tokenizer","ace/mode/sql_highlight_rules","ace/range"],function(e,t){var r=e("../lib/oop"),o=e("./text").Mode,n=(e("../tokenizer").Tokenizer,e("./sql_highlight_rules").SqlHighlightRules),i=(e("../range").Range,function(){this.HighlightRules=n});r.inherits(i,o),function(){this.lineCommentStart="--"}.call(i.prototype),t.Mode=i}),define("ace/mode/sql_highlight_rules",["require","exports","module","ace/lib/oop","ace/mode/text_highlight_rules"],function(e,t){var r=e("../lib/oop"),o=e("./text_highlight_rules").TextHighlightRules,n=function(){var e="select|insert|update|delete|from|where|and|or|group|by|order|limit|offset|having|as|case|when|else|end|type|left|right|join|on|outer|desc|asc",t="true|false|null",r="count|min|max|avg|sum|rank|now|coalesce",o=this.createKeywordMapper({"support.function":r,keyword:e,"constant.language":t},"identifier",!0);this.$rules={start:[{token:"comment",regex:"--.*$"},{token:"string",regex:'".*?"'},{token:"string",regex:"'.*?'"},{token:"constant.numeric",regex:"[+-]?\\d+(?:(?:\\.\\d*)?(?:[eE][+-]?\\d+)?)?\\b"},{token:o,regex:"[a-zA-Z_$][a-zA-Z0-9_$]*\\b"},{token:"keyword.operator",regex:"\\+|\\-|\\/|\\/\\/|%|<@>|@>|<@|&|\\^|~|<|>|<=|=>|==|!=|<>|="},{token:"paren.lparen",regex:"[\\(]"},{token:"paren.rparen",regex:"[\\)]"},{token:"text",regex:"\\s+"}]}};r.inherits(n,o),t.SqlHighlightRules=n});
//# sourceMappingURL=mode-sql.js.map