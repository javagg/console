define("ace/mode/rust",["require","exports","module","ace/lib/oop","ace/mode/text","ace/tokenizer","ace/mode/rust_highlight_rules","ace/mode/folding/cstyle"],function(e,t){var o=e("../lib/oop"),r=e("./text").Mode,n=(e("../tokenizer").Tokenizer,e("./rust_highlight_rules").RustHighlightRules),s=e("./folding/cstyle").FoldMode,u=function(){this.HighlightRules=n,this.foldingRules=new s};o.inherits(u,r),function(){this.lineCommentStart="/\\*",this.blockComment={start:"/*",end:"*/"}}.call(u.prototype),t.Mode=u}),define("ace/mode/rust_highlight_rules",["require","exports","module","ace/lib/oop","ace/mode/text_highlight_rules"],function(e,t){var o=e("../lib/oop"),r=e("./text_highlight_rules").TextHighlightRules,n=function(){this.$rules={start:[{token:"variable.other.source.rust",regex:"'[a-zA-Z_][a-zA-Z0-9_]*[^\\']"},{token:"string.quoted.single.source.rust",regex:"'",push:[{token:"string.quoted.single.source.rust",regex:"'",next:"pop"},{include:"#rust_escaped_character"},{defaultToken:"string.quoted.single.source.rust"}]},{token:"string.quoted.double.source.rust",regex:'"',push:[{token:"string.quoted.double.source.rust",regex:'"',next:"pop"},{include:"#rust_escaped_character"},{defaultToken:"string.quoted.double.source.rust"}]},{token:["keyword.source.rust","meta.function.source.rust","entity.name.function.source.rust","meta.function.source.rust"],regex:"\\b(fn)(\\s+)([a-zA-Z_][a-zA-Z0-9_][\\w\\:,+ \\'<>]*)(\\s*\\()"},{token:"support.constant",regex:"\\b[a-zA-Z_][\\w\\d]*::"},{token:"keyword.source.rust",regex:"\\b(?:as|assert|break|claim|const|copy|Copy|do|drop|else|extern|fail|for|if|impl|in|let|log|loop|match|mod|module|move|mut|Owned|priv|pub|pure|ref|return|unchecked|unsafe|use|while|mod|Send|static|trait|class|struct|enum|type)\\b"},{token:"storage.type.source.rust",regex:"\\b(?:Self|m32|m64|m128|f80|f16|f128|int|uint|float|char|bool|u8|u16|u32|u64|f32|f64|i8|i16|i32|i64|str|option|either|c_float|c_double|c_void|FILE|fpos_t|DIR|dirent|c_char|c_schar|c_uchar|c_short|c_ushort|c_int|c_uint|c_long|c_ulong|size_t|ptrdiff_t|clock_t|time_t|c_longlong|c_ulonglong|intptr_t|uintptr_t|off_t|dev_t|ino_t|pid_t|mode_t|ssize_t)\\b"},{token:"variable.language.source.rust",regex:"\\bself\\b"},{token:"keyword.operator",regex:"!|\\$|\\*|\\-\\-|\\-|\\+\\+|\\+|-->|===|==|=|!=|!==|<=|>=|<<=|>>=|>>>=|<>|<|>|!|&&|\\|\\||\\?\\:|\\*=|/=|%=|\\+=|\\-=|&=|\\^=|,|;"},{token:"constant.language.source.rust",regex:"\\b(?:true|false|Some|None|Left|Right|Ok|Err)\\b"},{token:"support.constant.source.rust",regex:"\\b(?:EXIT_FAILURE|EXIT_SUCCESS|RAND_MAX|EOF|SEEK_SET|SEEK_CUR|SEEK_END|_IOFBF|_IONBF|_IOLBF|BUFSIZ|FOPEN_MAX|FILENAME_MAX|L_tmpnam|TMP_MAX|O_RDONLY|O_WRONLY|O_RDWR|O_APPEND|O_CREAT|O_EXCL|O_TRUNC|S_IFIFO|S_IFCHR|S_IFBLK|S_IFDIR|S_IFREG|S_IFMT|S_IEXEC|S_IWRITE|S_IREAD|S_IRWXU|S_IXUSR|S_IWUSR|S_IRUSR|F_OK|R_OK|W_OK|X_OK|STDIN_FILENO|STDOUT_FILENO|STDERR_FILENO)\\b"},{token:"meta.preprocessor.source.rust",regex:"\\b\\w\\(\\w\\)*!|#\\[[\\w=\\(\\)_]+\\]\\b"},{token:"constant.numeric.integer.source.rust",regex:"\\b(?:[0-9][0-9_]*|[0-9][0-9_]*(?:u|u8|u16|u32|u64)|[0-9][0-9_]*(?:i|i8|i16|i32|i64))\\b"},{token:"constant.numeric.hex.source.rust",regex:"\\b(?:0x[a-fA-F0-9_]+|0x[a-fA-F0-9_]+(?:u|u8|u16|u32|u64)|0x[a-fA-F0-9_]+(?:i|i8|i16|i32|i64))\\b"},{token:"constant.numeric.binary.source.rust",regex:"\\b(?:0b[01_]+|0b[01_]+(?:u|u8|u16|u32|u64)|0b[01_]+(?:i|i8|i16|i32|i64))\\b"},{token:"constant.numeric.float.source.rust",regex:"[0-9][0-9_]*(?:f32|f64|f)|[0-9][0-9_]*[eE][+-]=[0-9_]+|[0-9][0-9_]*[eE][+-]=[0-9_]+(?:f32|f64|f)|[0-9][0-9_]*\\.[0-9_]+|[0-9][0-9_]*\\.[0-9_]+(?:f32|f64|f)|[0-9][0-9_]*\\.[0-9_]+%[eE][+-]=[0-9_]+|[0-9][0-9_]*\\.[0-9_]+%[eE][+-]=[0-9_]+(?:f32|f64|f)"},{token:"comment.line.documentation.source.rust",regex:"//!.*$",push_:[{token:"comment.line.documentation.source.rust",regex:"$",next:"pop"},{defaultToken:"comment.line.documentation.source.rust"}]},{token:"comment.line.double-dash.source.rust",regex:"//.*$",push_:[{token:"comment.line.double-dash.source.rust",regex:"$",next:"pop"},{defaultToken:"comment.line.double-dash.source.rust"}]},{token:"comment.block.source.rust",regex:"/\\*",push:[{token:"comment.block.source.rust",regex:"\\*/",next:"pop"},{defaultToken:"comment.block.source.rust"}]}],"#rust_escaped_character":[{token:"constant.character.escape.source.rust",regex:"\\\\(?:x[\\da-fA-F]{2}|[0-2][0-7]{,2}|3[0-6][0-7]?|37[0-7]?|[4-7][0-7]?|.)"}]},this.normalizeRules()};n.metaData={fileTypes:["rs","rc"],foldingStartMarker:"^.*\\bfn\\s*(\\w+\\s*)?\\([^\\)]*\\)(\\s*\\{[^\\}]*)?\\s*$",foldingStopMarker:"^\\s*\\}",name:"Rust",scopeName:"source.rust"},o.inherits(n,r),t.RustHighlightRules=n}),define("ace/mode/folding/cstyle",["require","exports","module","ace/lib/oop","ace/range","ace/mode/folding/fold_mode"],function(e,t){var o=e("../../lib/oop"),r=(e("../../range").Range,e("./fold_mode").FoldMode),n=t.FoldMode=function(e){e&&(this.foldingStartMarker=new RegExp(this.foldingStartMarker.source.replace(/\|[^|]*?$/,"|"+e.start)),this.foldingStopMarker=new RegExp(this.foldingStopMarker.source.replace(/\|[^|]*?$/,"|"+e.end)))};o.inherits(n,r),function(){this.foldingStartMarker=/(\{|\[)[^\}\]]*$|^\s*(\/\*)/,this.foldingStopMarker=/^[^\[\{]*(\}|\])|^[\s\*]*(\*\/)/,this.getFoldWidgetRange=function(e,t,o){var r=e.getLine(o),n=r.match(this.foldingStartMarker);if(n){var s=n.index;return n[1]?this.openingBracketBlock(e,n[1],o,s):e.getCommentFoldRange(o,s+n[0].length,1)}if("markbeginend"===t){var n=r.match(this.foldingStopMarker);if(n){var s=n.index+n[0].length;return n[1]?this.closingBracketBlock(e,n[1],o,s):e.getCommentFoldRange(o,s,-1)}}}}.call(n.prototype)});
//# sourceMappingURL=mode-rust.js.map