/* HTML5 Shiv v3.6.1 | @afarkas @jdalton @jon_neal @rem | MIT/GPL2 Licensed */
(function(w,C){function v(){var e=D.elements;return"string"==typeof e?e.split(" "):e;}function z(f){var e=u[f[d]];e||(e={},A++,f[d]=A,u[A]=e);return e;}function c(f,e,g){e||(e=C);if(B){return e.createElement(f);}g||(g=z(e));e=g.cache[f]?g.cache[f].cloneNode():a.test(f)?(g.cache[f]=g.createElem(f)).cloneNode():g.createElem(f);return e.canHaveChildren&&!F.test(f)?g.frag.appendChild(e):e;}function E(f,e){if(!e.cache){e.cache={},e.createElem=f.createElement,e.createFrag=f.createDocumentFragment,e.frag=e.createFrag();}f.createElement=function(g){return !D.shivMethods?e.createElem(g):c(g,f,e);};f.createDocumentFragment=Function("h,f","return function(){var n=f.cloneNode(),c=n.createElement;h.shivMethods&&("+v().join().replace(/\w+/g,function(g){e.createElem(g);e.frag.createElement(g);return'c("'+g+'")';})+");return n}")(D,e.frag);}function b(f){f||(f=C);var e=z(f);if(D.shivCSS&&!y&&!e.hasCSS){var h,g=f;h=g.createElement("p");g=g.getElementsByTagName("head")[0]||g.documentElement;h.innerHTML="x<style>article,aside,figcaption,figure,footer,header,hgroup,nav,section{display:block}mark{background:#FF0;color:#000}</style>";h=g.insertBefore(h.lastChild,g.firstChild);e.hasCSS=!!h;}B||E(f,e);return f;}var x=w.html5||{},F=/^<|^(?:button|map|select|textarea|object|iframe|option|optgroup)$/i,a=/^(?:a|b|code|div|fieldset|h1|h2|h3|h4|h5|h6|i|label|li|ol|p|q|span|strong|style|table|tbody|td|th|tr|ul)$/i,y,d="_html5shiv",A=0,u={},B;(function(){try{var f=C.createElement("a");f.innerHTML="<xyz></xyz>";y="hidden" in f;var e;if(!(e=1==f.childNodes.length)){C.createElement("a");var h=C.createDocumentFragment();e="undefined"==typeof h.cloneNode||"undefined"==typeof h.createDocumentFragment||"undefined"==typeof h.createElement;}B=e;}catch(g){B=y=!0;}})();var D={elements:x.elements||"abbr article aside audio bdi canvas data datalist details figcaption figure footer header hgroup mark meter nav output progress section summary time video",shivCSS:!1!==x.shivCSS,supportsUnknownElements:B,shivMethods:!1!==x.shivMethods,type:"default",shivDocument:b,createElement:c,createDocumentFragment:function(g,f){g||(g=C);if(B){return g.createDocumentFragment();}for(var f=f||z(g),l=f.frag.cloneNode(),k=0,j=v(),i=j.length;k<i;k++){l.createElement(j[k]);}return l;}};w.html5=D;b(C);})(this,document);
/*
* json2.js
*    2011-10-19
*
*    Public Domain.
*    NO WARRANTY EXPRESSED OR IMPLIED. USE AT YOUR OWN RISK.
*    See http://www.JSON.org/js.html
*/
var JSON;if(!JSON){JSON={};}(function(){function f(n){return n<10?"0"+n:n;}if(typeof Date.prototype.toJSON!=="function"){Date.prototype.toJSON=function(key){return isFinite(this.valueOf())?this.getUTCFullYear()+"-"+f(this.getUTCMonth()+1)+"-"+f(this.getUTCDate())+"T"+f(this.getUTCHours())+":"+f(this.getUTCMinutes())+":"+f(this.getUTCSeconds())+"Z":null;};String.prototype.toJSON=Number.prototype.toJSON=Boolean.prototype.toJSON=function(key){return this.valueOf();};}var cx=/[\u0000\u00ad\u0600-\u0604\u070f\u17b4\u17b5\u200c-\u200f\u2028-\u202f\u2060-\u206f\ufeff\ufff0-\uffff]/g,escapable=/[\\\"\x00-\x1f\x7f-\x9f\u00ad\u0600-\u0604\u070f\u17b4\u17b5\u200c-\u200f\u2028-\u202f\u2060-\u206f\ufeff\ufff0-\uffff]/g,gap,indent,meta={"\b":"\\b","\t":"\\t","\n":"\\n","\f":"\\f","\r":"\\r",'"':'\\"',"\\":"\\\\"},rep;function quote(string){escapable.lastIndex=0;return escapable.test(string)?'"'+string.replace(escapable,function(a){var c=meta[a];return typeof c==="string"?c:"\\u"+("0000"+a.charCodeAt(0).toString(16)).slice(-4);})+'"':'"'+string+'"';}function str(key,holder){var i,k,v,length,mind=gap,partial,value=holder[key];if(value&&typeof value==="object"&&typeof value.toJSON==="function"){value=value.toJSON(key);}if(typeof rep==="function"){value=rep.call(holder,key,value);}switch(typeof value){case"string":return quote(value);case"number":return isFinite(value)?String(value):"null";case"boolean":case"null":return String(value);case"object":if(!value){return"null";}gap+=indent;partial=[];if(Object.prototype.toString.apply(value)==="[object Array]"){length=value.length;for(i=0;i<length;i+=1){partial[i]=str(i,value)||"null";}v=partial.length===0?"[]":gap?"[\n"+gap+partial.join(",\n"+gap)+"\n"+mind+"]":"["+partial.join(",")+"]";gap=mind;return v;}if(rep&&typeof rep==="object"){length=rep.length;for(i=0;i<length;i+=1){if(typeof rep[i]==="string"){k=rep[i];v=str(k,value);if(v){partial.push(quote(k)+(gap?": ":":")+v);}}}}else{for(k in value){if(Object.prototype.hasOwnProperty.call(value,k)){v=str(k,value);if(v){partial.push(quote(k)+(gap?": ":":")+v);}}}}v=partial.length===0?"{}":gap?"{\n"+gap+partial.join(",\n"+gap)+"\n"+mind+"}":"{"+partial.join(",")+"}";gap=mind;return v;}}if(typeof JSON.stringify!=="function"){JSON.stringify=function(value,replacer,space){var i;gap="";indent="";if(typeof space==="number"){for(i=0;i<space;i+=1){indent+=" ";}}else{if(typeof space==="string"){indent=space;}}rep=replacer;if(replacer&&typeof replacer!=="function"&&(typeof replacer!=="object"||typeof replacer.length!=="number")){throw new Error("JSON.stringify");}return str("",{"":value});};}if(typeof JSON.parse!=="function"){JSON.parse=function(text,reviver){var j;function walk(holder,key){var k,v,value=holder[key];if(value&&typeof value==="object"){for(k in value){if(Object.prototype.hasOwnProperty.call(value,k)){v=walk(value,k);if(v!==undefined){value[k]=v;}else{delete value[k];}}}}return reviver.call(holder,key,value);}text=String(text);cx.lastIndex=0;if(cx.test(text)){text=text.replace(cx,function(a){return"\\u"+("0000"+a.charCodeAt(0).toString(16)).slice(-4);});}if(/^[\],:{}\s]*$/.test(text.replace(/\\(?:["\\\/bfnrt]|u[0-9a-fA-F]{4})/g,"@").replace(/"[^"\\\n\r]*"|true|false|null|-?\d+(?:\.\d*)?(?:[eE][+\-]?\d+)?/g,"]").replace(/(?:^|:|,)(?:\s*\[)+/g,""))){j=eval("("+text+")");return typeof reviver==="function"?walk({"":j},""):j;}throw new SyntaxError("JSON.parse");};}}());(function(){if(typeof window.console==="undefined"){window.console={};var b=0,c=function(){},a=["assert","error","clear","count","debug","dir","dirxml","exception","group","groupCollapsed","groupEnd","info","log","profile","profileEnd","table","time","timeEnd","trace","warn"];for(;b<a.length;b++){window.console[a[b]]=c;}}if(typeof window.console.memory==="undefined"){window.console.memory={};}})();function loadScript(b){var a;if(b.url){a='<script src="'+b.url+'"><\/script>';}else{a="<script>"+b.code+"<\/script>";}if(b.seo_remove){document.write(a);}else{document.write("</div>"+a+'<div class="seo-remove">');}}