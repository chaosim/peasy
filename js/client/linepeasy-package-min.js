(function(){var f=twoside("peasy/peasy.js").exports,m=[].indexOf||function(a){for(var c=0,b=this.length;c<b;c++)if(c in this&&this[c]===a)return c;return-1},l=[].slice;f.Parser=f.BaseParser=function(){return function(){var a,c;c=this;a=this.base={};this.ruleIndex=0;a.parse=this.parse=function(b,h,d){null==h&&(h=c.root);null==d&&(d=0);c.data=b;c.cur=d;c.ruleStack={};c.cache={};return h()};a.rec=this.rec=function(b){var h;h=c.ruleIndex++;return function(){var d,a,g,e;a=c.ruleStack;d=null!=(e=c.cache)[h]?
e[h]:e[h]={};e=c.cur;a=null!=a[e]?a[e]:a[e]=[];if(0>m.call(a,h)){a.push(h);for(d=null!=d[e]?d[e]:d[e]=[void 0,e];;)if(c.cur=e,g=b())if(d[1]===c.cur){d[0]=g;break}else d[0]=g,d[1]=c.cur;else{g=d[0];c.cur=d[1];break}a.pop();return g}d=d[e];c.cur=d[1];return d[0]}};a.memo=this.memo=function(b){var h;h=c.ruleIndex++;return function(d){return function(){var d,a;d=null!=(a=c.cache)[h]?a[h]:a[h]={};a=c.cur;if(d=d[a])return c.cur=d[1],d[0];d=b();c.cache[h][a]=[d,c.cur];return d}}(this)};a.orp=this.orp=function(){var b,
h;h=1<=arguments.length?l.call(arguments,0):[];h=function(){var d,a,g;g=[];d=0;for(a=h.length;d<a;d++)b=h[d],"string"===typeof b?g.push(c.literal(b)):g.push(b);return g}();return function(d){return function(){var d,a,e,q;a=c.cur;e=0;for(q=h.length;e<q;e++)if(b=h[e],c.cur=a,d=b())return d}}(this)};a.andp=this.andp=function(){var b,a;a=1<=arguments.length?l.call(arguments,0):[];a=function(){var d,p,g;g=[];d=0;for(p=a.length;d<p;d++)b=a[d],"string"===typeof b?g.push(c.literal(b)):g.push(b);return g}();
return function(){var d,c,g;c=0;for(g=a.length;c<g;c++)if(b=a[c],!(d=b()))return;return d}};a.notp=this.notp=function(b){"string"===typeof b&&(b=c.literal(b));return function(){return!b()}};a.may=this.may=function(b){"string"===typeof b&&(b=c.literal(b));return function(a){return function(){var d,a;d=c.cur;if(a=b())return a;c.cur=d;return!0}}(this)};a.any=this.any=function(b){"string"===typeof b&&(b=c.literal(b));return function(a){return function(){var d,a;for(d=[];a=b();)d.push(a);return d}}(this)};
a.some=this.some=function(b){"string"===typeof b&&(b=c.literal(b));return function(){var a,d;if(d=b()){for(a=[d];d=b();)a.push(d);return a}}};a.times=this.times=function(b,a){"string"===typeof b&&(b=c.literal(b));return function(){var d,c;for(d=0;d++<a;)if(c=b())result.push(c);else return;return result}};a.list=this.list=function(b,a){null==a&&(a=c.spaces);"string"===typeof b&&(b=c.literal(b));"string"===typeof a&&(a=c.literal(a));return function(){var d,c;if(c=b()){for(d=[c];a()&&(c=b());)d.push(c);
return d}}};a.listn=this.listn=function(b,a,d){null==d&&(d=c.spaces);"string"===typeof b&&(b=c.literal(b));"string"===typeof d&&(d=c.literal(d));return function(){var c,g,e;if(e=b()){g=[e];for(c=1;c++<a;)if(d()&&(e=b()))g.push(e);else return;return g}}};a.follow=this.follow=function(b){"string"===typeof b&&(b=c.literal(b));return function(a){return function(){var a,h;a=c.cur;h=b();c.cur=a;return h}}(this)};a.literal=this.literal=function(b){return function(){var a,d;a=b.length;d=c.cur;if(c.data.slice(d,
a=d+a)===b)return c.cur=a,!0}};a["char"]=this["char"]=function(b){return function(){if(c.data[c.cur]===b)return c.cur++,b}};a.wrap=this.wrap=function(b,a,d){null==a&&(a=c.spaces);null==d&&(d=c.spaces);"string"===typeof b&&(b=c.literal(b));return function(){var c;if(a()&&(c=b()&&d()))return c}};a.spaces=this.spaces=function(){var b,a,d,f;d=c.data;f=0;for(a=c.cur;(b=d[a++])&&(" "===b||"\t"===b);)f++;c.cur+=f;return f+1};a.spaces1=this.spaces1=function(){var b,a,d;d=c.data;for(a=c.cur;(b=d[a++])&&(" "===
b||"\t"===b);)lent++;c.cur+=0;return 0};a.eoi=this.eoi=function(){return c.cur===c.data.length};a.identifierLetter=this.identifierLetter=function(){var b;b=c.data[c.cur];if("$"===b||"_"===b||"a"<=b&&"z">b||"A"<=b&&"Z">=b||"0"<=b&&"9">=b)return c.cur++,!0};a.followIdentifierLetter=this.followIdentifierLetter=function(){var b;b=c.data[c.cur];return("$"===b||"_"===b||"a"<=b&&"z">b||"A"<=b&&"Z">=b||"0"<=b&&"9">=b)&&b};a.digit=this.digit=function(){var b;b=c.data[c.cur];if("0"<=b&&"9">=b)return c.cur++,
b};a.letter=this.letter=function(){var b;b=c.data[c.cur];if("a"<=b&&"z">=b||"A"<=b&&"Z">=b)return c.cur++,b};a.lower=this.lower=function(){var b;b=c.data[c.cur];if("a"<=b&&"z">=b)return c.cur++,b};a.upper=this.upper=function(){var b;b=c.data[c.cur];if("A"<=b&&"Z">=b)return c.cur++,b};a.identifier=this.identifier=function(){var b,a,d,f;d=c.data;f=a=c.cur;b=d[a];if("a"<=b&&"z">=b||"A"<=b&&"Z">=b||"$"===b||"_"===b){for(a++;;)if(b=d[a],"a"<=b&&"z">=b||"A"<=b&&"Z">=b||"0"<=b&&"9">=b||"$"===b||"_"===b)a++;
else break;c.cur=a;return d.slice(f,a)}};a.number=this.number=function(){var b,a,d;d=c.data;a=c.cur;b=d[a];if("0"<=b&&"9">=b){for(a++;;)if(b=d[a],"0"<=b&&"9">=b)a++;else break;c.cur=a;return d.slice(start,a)}};a.string=this.string=function(){var b,a,d,f,g,e;g=c.data;f=a=c.cur;b=g[a];if('"'===b)d=b,e='"';else if("'"===b)d=b,e="'";else return;for(a++;;)if(b=g[a],"\n"===b||"\r"===b)c.error("new line is forbidden in single line string.");else if("\\"===b)b=g[a+1],"\n"===b||"\r"===b?c.error("new line is forbidden in single line string."):
b?a+=2:c.error("unexpect end of input, string is not closed");else{if(b===d)return c.cur=a+1,eval(e+g.slice(f,+a+1||9E9)+e);b?a++:c.error("new line is forbidden in string.")}};a.select=this.select=function(a,c){var d;console.log("select");if((d=c[a])||(d=c["default"]||c[""]))return d()};a.selectp=this.selectp=function(a,f){return function(){if(a())return c.select(f)}}}}();f.debugging=!1;f.testing=!1;f.debug=function(a){if(f.debugging)return console.log(a)};f.warn=function(a){if(f.debugging||f.testing)return console.log(a)};
f.Charset=function(a){var c,b,f;b=0;for(f=a.length;b<f;b++)c=a[b],this[c]=!0;return this};f.Charset.prototype.contain=function(a){return this.hasOwnProperty(a)};f.charset=function(a){return new f.Charset(a)};f.inCharset=function(a,c){f.warn("peasy.inCharset(char, set) is deprecated, use set.contain(char) instead.");return c.hasOwnProperty(a)};f.in_=f.inCharset;f.isdigit=function(a){return"0"<=a&&"9">=a};f.isletter=function(a){return"a"<=a&&"z">=a||"A"<=a&&"Z">=a};f.islower=function(a){return"a"<=
a&&"z">=a};f.isupper=function(a){return"A"<=a&&"Z">=a};f.isIdentifierLetter=function(a){return"$"===a||"_"===a||"a"<=a&&"z">=a||"A"<=a&&"Z">=a||"0"<=a&&"9">=a};f.digits="0123456789";f.lowers="abcdefghijklmnopqrstuvwxyz";f.uppers="ABCDEFGHIJKLMNOPQRSTUVWXYZ";f.letters=f.lowers+f.uppers;f.letterDigits=f.letterDigits;f.extend=function(a){if(!a)return a;for(var c=1,b=arguments.length;c<b;c++){var f=arguments[c];if(f)for(var d in f)a[d]=f[d]}return a};f.isArray=function(a){return a&&"object"==typeof a&&
"number"==typeof a.length&&toString.call(a)==arrayClass||!1};f.isObject=function(a){return!(!a||!objectTypes[typeof a])}})();
(function(){var f=twoside("peasy/index"),m=f.require,l=f.exports,l=f.module,a={}.hasOwnProperty,c=function(b,c){function g(){this.constructor=b}for(var e in c)a.call(c,e)&&(b[e]=c[e]);g.prototype=c.prototype;b.prototype=new g;b.__super__=c.prototype;return b},b=[].indexOf||function(a){for(var b=0,c=this.length;b<c;b++)if(b in this&&this[b]===a)return b;return-1},h=[].slice,m=m("./peasy"),l=l.exports={};"object"===typeof window&&m.extend(l,m);l.Parser=function(a){function f(){var a,e;f.__super__.constructor.apply(this,
arguments);e=this;a=this.lineparser={};this.parse=function(a,b,c,d,f){null==b&&(b=e.root);null==c&&(c=0);null==d&&(d=0);null==f&&(f=0);e.data=a;e.cur=c;e.lineno=d;e.row=f;e.ruleStack={};e.cache={};return b()};a.rec=this.rec=function(a){var c;c=e.ruleIndex++;return function(){var d,f,n,g,h,k;f=e.ruleStack;d=null!=(n=e.cache)[c]?n[c]:n[c]={};k=e.cur;n=e.lineno;h=e.row;f=null!=f[k]?f[k]:f[k]=[];if(0>b.call(f,c)){f.push(c);for(d=null!=d[k]?d[k]:d[k]={result:void 0,cur:k,lineno:n,row:h};;)if(e.cur=k,e.lineno=
n,e.row=h,g=a())if(d.cur===e.cur){d.result=g;break}else d.result=g,d.cur=e.cur,d.lineno=e.lineno,d.row=e.row;else{g=d.result;e.cur=d.cur;e.lineno=d.lineno;e.row=d.row;break}f.pop();return g}d=d[k];e.cur=d.cur;e.lineno=d.lineno;e.row=d.row;return d.result}};a.memo=this.memo=function(a){var b;b=e.ruleIndex++;return function(c){return function(){var c,d;c=null!=(d=e.cache)[b]?d[b]:d[b]={};d=e.cur;if(c=c[d])return e.cur=c.cur,e.lineno=lineno,e.row=row,c.result;c=a();e.cache[b][d]={result:c,cur:e.cur,
lineno:e.lineno,row:e.row};return c}}(this)};a.orp=this.orp=function(){var a,b;b=1<=arguments.length?h.call(arguments,0):[];b=function(){var c,d,f;f=[];c=0;for(d=b.length;c<d;c++)a=b[c],"string"===typeof a?f.push(e.literal(a)):f.push(a);return f}();return function(c){return function(){var c,d,f,r,g,h;r=e.cur;c=e.lineno;f=e.row;g=0;for(h=b.length;g<h;g++)if(a=b[g],e.cur=r,e.lineno=c,e.row=f,d=a())return d}}(this)};a.andp=this.andp=function(){var a,b;b=1<=arguments.length?h.call(arguments,0):[];b=function(){var c,
d,f;f=[];c=0;for(d=b.length;c<d;c++)a=b[c],"string"===typeof a?f.push(e.literal(a)):f.push(a);return f}();return function(){var c,e,d;e=0;for(d=b.length;e<d;e++)if(a=b[e],!(c=a()))return;return c}};a.notp=this.notp=function(a){"string"===typeof a&&(a=e.literal(a));return function(){return!a()}};a.may=this.may=function(a){"string"===typeof a&&(a=e.literal(a));return function(b){return function(){var b,c,d,f;d=e.cur;b=e.lineno;c=e.row;if(f=a())return f;e.cur=d;e.lineno=b;e.row=c;return!0}}(this)};a.any=
this.any;a.some=this.some;a.times=this.times;a.list=this.list;a.listn=this.listn;a.follow=this.follow=function(a){"string"===typeof a&&(a=e.literal(a));return function(b){return function(){var b,c,d,f;d=e.cur;b=e.lineno;c=e.row;f=a();e.cur=d;e.lineno=b;e.row=c;return f}}(this)};a.literal=this.literal=function(a){var b;b=a.length;return function(){var c,d,f,g,h,k;d=e.cur;h=e.lineno;k=e.row;f=e.data;for(g=0;g<b;)if(c=a[g],f[g]===c)g++,d++,"\n"===c?(h++,k=0):k++;else return;e.cur=d;e.lineno=h;e.row=
k;return!0}};a["char"]=this["char"]=function(a){return function(){if(e.data[e.cur]===a)return e.cur++,"\n"===a?(e.lineno++,e.row=0):e.row++,a}};a.wrap=this.wrap=function(a,b,c){null==b&&(b=e.spaces);null==c&&(c=e.spaces);"string"===typeof a&&(a=e.literal(a));return function(){var e;if(b()&&(e=a()&&c()))return e}};a.spaces=this.spaces=function(){var a,b,c,d;c=e.data;d=0;for(b=e.cur;(a=c[b++])&&(" "===a||"\t"===a);)d++;e.cur+=d;e.row+=d;return d+1};a.spaces1=this.spaces1=function(){var a,b,c;c=e.data;
for(b=e.cur;(a=c[b++])&&(" "===a||"\t"===a);)lent++;e.cur+=0;e.row+=0;return 0};a.eoi=this.eoi=function(){return e.cur>=e.data.length};a.identifierLetter=this.identifierLetter=function(){var a;a=e.data[e.cur];if("$"===a||"_"===a||"a"<=a&&"z">a||"A"<=a&&"Z">=a||"0"<=a&&"9">=a)return e.cur++,e.row++,!0};a.followIdentifierLetter=this.followIdentifierLetter=function(){var a;a=e.data[e.cur];return("$"===a||"_"===a||"a"<=a&&"z">a||"A"<=a&&"Z">=a||"0"<=a&&"9">=a)&&a};a.digit=this.digit=function(){var a;
a=e.data[e.cur];if("0"<=a&&"9">=a)return e.cur++,e.row++,a};a.letter=this.letter=function(){var a;a=e.data[e.cur];if("a"<=a&&"z">=a||"A"<=a&&"Z">=a)return e.cur++,e.row++,a};a.lower=this.lower=function(){var a;a=e.data[e.cur];if("a"<=a&&"z">=a)return e.cur++,e.row++,a};a.upper=this.upper=function(){var a;a=e.data[e.cur];if("A"<=a&&"Z">=a)return e.cur++,e.row++,a};a.identifier=this.identifier=function(){var a,b,c,d;c=e.data;d=b=e.cur;a=c[b];if("a"<=a&&"z">=a||"A"<=a&&"Z">=a||"$"===a||"_"===a){for(b++;;)if(a=
c[b],"a"<=a&&"z">=a||"A"<=a&&"Z">=a||"0"<=a&&"9">=a||"$"===a||"_"===a)b++;else break;e.row+=b-e.cur;e.cur=b;return c.slice(d,b)}};a.number=this.number=function(){var a,b,c;c=e.data;b=e.cur;a=c[b];if("0"<=a&&"9">=a){for(b++;;)if(a=c[b],"0"<=a&&"9">=a)b++;else break;e.row+=b-e.cur;e.cur=b;return c.slice(start,b)}};a.string=this.string=function(){var a,b,c,d,f,g,h;g=e.data;f=b=e.cur;d=e.row;a=g[b];if('"'===a)c=a,h='"',d++;else if("'"===a)c=a,h="'",d++;else return;for(b++;;)if(a=g[b],"\n"===a||"\r"===
a)e.error("new line is forbidden in single line string.");else if("\\"===a)a=g[b+1],"\n"===a||"\r"===a?e.error("new line is forbidden in single line string."):a?(b+=2,d+=2):e.error("unexpect end of input, string is not closed");else{if(a===c)return e.cur=b+1,e.row=d+1,eval(h+g.slice(f,+b+1||9E9)+h);a?(b++,d++):e.error("new line is forbidden in string.")}};a.select=this.select;a.selectp=this.selectp}c(f,a);return f}(m.BaseParser)})();
