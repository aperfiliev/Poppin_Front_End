if(typeof String.prototype.trim!="function"){String.prototype.trim=function(){return this.replace(/^\s+|\s+$/g,"");};}GPItemList=(function(g){function b(){this.root=null;}b.prototype={add:function(h){var l={val:h,right:null,left:null};if(this.root===null){this.root=l;return l.val;}else{var k=this.root;var j=true;var i=h.valueOf();while(j){if(k.val.valueOf()<i){if(k.right===null){j=false;k.right=l;}k=k.right;}else{if(k.val.valueOf()>i){if(k.left===null){j=false;k.left=l;}k=k.left;}else{j=false;}}}return k.val;}},get:function(i){var h=this.root;while(h!=null){if(h.val.valueOf()<i){h=h.right;}else{if(h.val.valueOf()>i){h=h.left;}else{return h.val;}}}return null;}};function f(h){this._values=new Object();this._bstValues=new b();this._current=null;}f.PRICE_TYPE=0;f.STRING_TYPE=1;f.INTEGER_TYPE=2;f.FLOAT_TYPE=3;f.MULTI_TYPE=4;f.prototype={setLabel:function(h){this._label=h;},getLabel:function(){return this._label;},addValue:function(h){if(this._values.hasOwnProperty(h)){this._values[h]++;return this._bstValues.get(h);}else{this._values[h]=1;return this._bstValues.add(new Object(h));}},getValues:function(j){var h=[];var i=j?function(l,k){if(l!==null){i(l.right,k);k.push(l.val.valueOf());i(l.left,k);}}:function(l,k){if(l!==null){i(l.left,k);k.push(l.val.valueOf());i(l.right,k);}};i(this._bstValues.root,h);return h;},setType:function(h){this._type=h;return this;},getType:function(){return this._type;},setCurrentValue:function(i,h){if(this._values.hasOwnProperty(i)){this._current=this._bstValues.get(i);}if(h&&this._values.hasOwnProperty(h)){this._highest=this._bstValues.get(h);}else{delete this._highest;}return this;},clearCurrentValue:function(){this._current=this._highest=null;},getCurrentValue:function(){return{lowest:!!this._current&&this._current.valueOf(),highest:!!this._highest&&this._highest.valueOf()};},getCurrentValueItemsCount:function(){var n=this.getCurrentValue();if(n&&n.lowest){if(!n.highest){return this._values[n.lowest];}else{var j=this.getValues();var k=0,l=0;var h=n.lowest;while(j[k]<h){k++;}var m=n.highest;while(j[k]&&j[k]<=m){l+=this._values[j[k]];}return l;}}return false;},deleteValues:function(){this._values=new Object();this._bstValues=new b();this._current=null;}};function d(){var h={};this._getAttributes=function(){return h;};}d.prototype={getAttrValue:function(j,i){var k=this._getAttributes();if(k.hasOwnProperty(j)){var h=k[j];if(!!i){return h[i].valueOf();}else{return h;}}},setAttr:function(l,m){var j=this._getAttributes();if(m instanceof Array){if(!!j[l]){j=j[l];for(var k=0,h=m.length;k<h;k++){j.push(m[k]);}}else{j[l]=m;}}else{if(!j[l]){j[l]=[];}j[l].push(m);}return this;},getAllAttributes:function(){var l=this._getAttributes();var o={};for(var j in l){var k=[];var n=l[j];for(var m=0,h=n.length;m<h;m++){k.push(n[m].valueOf());}o[j]=k;}o.id=this._id;return o;},setID:function(h){this._id=h;},getID:function(){return this._id;}};function c(h){this._opts={itemsPerPage:50};g.extend(this._opts,h);var k=this;function n(r){var q=new f();q.setLabel(r.label);switch(r.type){case"multi":q.setType(f.MULTI_TYPE);break;case"int":q.setType(f.INTEGER_TYPE);break;case"float":q.setType(f.FLOAT_TYPE);break;case"price":q.setType(f.PRICE_TYPE);break;case"str":default:q.setType(f.STRING_TYPE);}if(r.useInSort){k._sortAttrs[r.id]={order:r.sortOrder,label:r.label,desc:r.sortDesc};}if(r.useInFilter){k._filterAttrs[r.id]={order:r.filterOrder,label:r.label};k._filterState[r.id]={};}k._attributes[r.id]=q;}function p(u,v){if(v instanceof Array){var s=k._attributes[u];var r=[];for(var t=0,q=v.length;t<q;t++){r.push(s.addValue(v[t]));}return r;}else{return k._attributes[u].addValue(v);}}function j(q){return k._filterAttrs.hasOwnProperty(q);}function o(q){return k._sortAttrs.hasOwnProperty(q);}function l(q){return k._attributes.hasOwnProperty(q);}function i(v){var q=k._items;for(var s=0,t=v.length;s<t;s++){var y=new d();var r=v[s];y.setID(r.id);var x=r.attributes;for(var w in x){var u=x[w].name||x[w];if(k.getAttrType(w)==f.STRING_TYPE){u=unescape(u);}else{if(k.getAttrType(w)==f.PRICE_TYPE){u=parseFloat(u.replace(/\$|,/gi,""));if(isNaN(u)){u=0;}}}if(l(w)){y.setAttr(w,p(w,u));}else{y.setAttr(w,unescape(u));}}q.push(y);}}function m(){for(var u=0,r=k._items.length;u<r;u++){k._selectedItems.push(k._items[u]);}var s=k._filterAttrs;for(var t in s){var q=k._attributes[t];var v=q.getValues();for(var u=0,r=v.length;u<r;u++){var w=v[u];q.setCurrentValue(w);k._filterState[t][w]=q.getCurrentValueItemsCount();q.clearCurrentValue();}}}this.setAttributes=function(r){k._attributes={};k._sortAttrs={};k._filterAttrs={};k._filterState={};for(var s=0,q=r.length;s<q;s++){n(r[s]);}};this.initItemsList=function(r){k._current_page=0;k._items=[];k._selectedItems=[];var q=k._attributes;for(key in q){q[key].deleteValues();}i(r);m();};}c.prototype={setItemsPerPage:function(h){this._opts.itemsPerPage=h;},getItemsPerPage:function(){return this._opts.itemsPerPage;},_selectItems:function(){this._current_page=0;delete this._selectedItems;delete this._filterState;this._selectedItems=[];this._filterState={};var h={};var y=[];for(var x in this._filterAttrs){y.push(x);var u=this._attributes[x].getCurrentValue();if(u.lowest){h[x]=u;this._filterState[x]={selected:true,value:u};}else{this._filterState[x]={};}}var m=this._items;var p=y.length;for(var z=0,B=m.length;z<B;z++){var o=true;var r=m[z];var w=0;while(o&&w<p){var t=y[w++];var D=h[t];if(!!D){var v=0;var C=r.getAttrValue(t);var n=C.length;if(D.highest){var q;while(v<n&&(((q=C[v].valueOf())<D.lowest)||q>D.highest)){v++;}}else{while(v<n&&C[v].valueOf()!=D.lowest){v++;}}if(v==n){o=false;}}}if(o){this._selectedItems.push(r);for(w=0;w<p;w++){t=y[w];var s=r.getAttrValue(t);var A=s.length;var l=this._filterState[t];if(!l.selected){for(var v=0;v<A;v++){var D=s[v].valueOf();if(!!l[D]){l[D]++;}else{l[D]=1;}}}}}}if(!!this._sortingCriteria&&this._sortingCriteria.length){this.sortItems();}},addFilter:function(j,i,h){this._attributes[j].setCurrentValue(i,h);this._selectItems();},getAttrType:function(i){var h=this._attributes[i];return(!!h)?h.getType():null;},removeFilter:function(h){this._attributes[h].clearCurrentValue();this._selectItems();},clearFilters:function(){var i=this._filterAttrs;for(var h in i){this._attributes[h].clearCurrentValue();}this._selectItems();},getPagesCount:function(){if(this._selectedItems!=null){if(!this._opts.itemsPerPage){return 1;}var h=this._selectedItems.length;var i=h%this._opts.itemsPerPage;return(h-i)/this._opts.itemsPerPage+~~!!i;}else{return 0;}},setCurrentPage:function(h){this._current_page=h%this.getPagesCount();},getCurrentPage:function(){return this._current_page;},sortItems:function(h){function i(o,v){var k={};var s=o.shift();var t=s.attrName;var m=j._attributes[t].getValues(s.descOrder);for(var n=0,p=m.length;n<p;n++){k[m[n]]=[];}while(v.length){var q=v.shift();var u=q.getAttrValue(t);for(var n=0,p=u.length;n<p;n++){k[u[n]].push(q);}}if(o.length){for(var n=0,p=m.length;n<p;n++){i(o,k[m[n]]);}}var r={};for(var n=0,p=m.length;n<p;n++){var l=k[m[n]];while(l.length){var w=l.shift();if(!r.hasOwnProperty(w.getID())){v.push(w);r[w.getID()]=true;}}delete k[m[n]];}o.unshift(s);}var j=this;this._sortingCriteria=h||this._sortingCriteria;i(this._sortingCriteria,j._selectedItems);},clearSortCriteria:function(){delete this._sortingCriteria;},getItems:function(){if(this.getPagesCount()==1){return this._selectedItems;}else{var h=this._opts.itemsPerPage;var i=this._current_page*h;return this._selectedItems.slice(i,i+h);}},getSelectedItemsCountInfo:function(){var i=this._opts.itemsPerPage||this._selectedItems.length;var j=this._current_page*i;var h=j+i;return{total:this._selectedItems.length,start:j+1,end:this._selectedItems.length>h?h:this._selectedItems.length};},getFilterOptions:function(){var n=[];var l=this._filterAttrs;var k=this._filterState;for(var j in l){n[l[j].order]={value:k[j],name:j,label:l[j].label};}for(var m=0,h=n.length;m<h;m++){if(!n[m]){n.splice(m,1);}}return n;},getSortOptions:function(){return this._sortAttrs;}};function a(i){var h=i&&i.toString().trim();if(!h.length){throw new Error("ItemRenderer: A template must be specified as a constructor parameter");}this.getTemplate=function(){return h;};}a.prototype.mergeItemData=function(l){var k=this.getTemplate();var j=/\s/g;var n=/[\(\)\\\.\/\-\*\?\+\^\$\:\]\[\}\{]/g;for(var h in l){var i=l[h];if(h=="salesprice"&&parseInt(i[0])!==i[0]){i[0]=i[0].formatMoney(2,".");}var m=new RegExp("\\{\\{"+h.replace(n,"\\$&").replace(j,"\\s+")+"\\}\\}","g");k=k.replace(m,i.toString());}return k;};function e(o){var h=null;var i=false;var p=0;var r={itemListContainer:".itemlist",paginationLinksContainer:".pagination",sortCriteriaSelector:".sort",sortOrderSwitcherContainer:".sort",enableSortOrderSwitcher:true,filterContainer:".filter",itemsCountCont:".itemscount",itemListCellTemplate:"",onItemsLoaded:null,onAfterShow:null,attrMultiValSep:"^",filterByRange:{},filtersUI:{},filterClearDefaultText:"Everything",filtersClearCaptions:{},itemListColumns:4,itemListGetter:new ItemListGetter(".itemcellinfo")};g.extend(r,o);var s=new a(r.itemListCellTemplate);var t=g(r.itemListContainer);if(!t.length){throw new Error("GPItemList: The specified item list container does not exist.");}function m(u){return !!r.filterByRange[u];}var j=g(r.itemsCountCont);function n(u){t.hide().html("");var z="";var y=u.getItems();var w=y.length;if(w){for(var v=0;v<w;v++){var A=s.mergeItemData(y[v].getAllAttributes());z+=A;if((v+1)%r.itemListColumns==0||(v+1)==w){var C='<span class="sep-item-list-rows"></span>';z+=C;}}}else{z="No items found.";}t.html(z);t.children("div").each(function(D){if(!(D%r.itemListColumns)){g(this).addClass("first");}});try{if(typeof r.onItemsLoaded=="function"){r.onItemsLoaded(t);}}catch(x){if(console&&console.log){console.log(x);}}t.show();try{if(typeof r.onAfterShow=="function"){r.onAfterShow();}}catch(x){if(console&&console.log){console.log(x);}}var B=u.getSelectedItemsCountInfo();if(B.total){j.html(B.start+"-"+B.end+" of "+B.total);}}function q(w){var D=g(r.sortCriteriaSelector);if(D.length){var F=w.getSortOptions();var x=[];for(var A in F){var y=x.length;var z=F[A].order;x.push({id:A,index:z});while(y&&z<x[y-1].index){y--;}x.splice(y,0,x.pop().id);}if(x.length){D=D.html('<div class="selectwrap"><select class="sortoptions" title="Select the sort criteria" onchange="_gaq.push([\'_trackEvent\', \'Categories\', \'Sorting\']);"></select></div>').find("select");D.append('<option value="clear" selected="selected">Select</option>');for(var y=0;A=x[y];y++){D.append('<option value="'+A+'" name="'+F[A].desc+'">'+F[A].label+"</option>");}function C(){w.clearSortCriteria();var H=D.val();var G=D.find(":selected").attr("name")=="true";if(H!="clear"){w.sortItems([{attrName:H.replace(/[0-9]/g,""),descOrder:G}]);n(w);}}D.bind("change",C);if(r.enableSortOrderSwitcher){var B=g("<a>").attr({"class":"asc",href:"#",title:"Change to descending direction"}).bind("click",function(G){G.preventDefault();i=!i;if(i){B.attr({"class":"desc",title:"Change to ascending direction"}).html("Descending");}else{B.attr({"class":"asc",title:"Change to descending direction"}).html("Ascending");}C();}).html("Ascending").appendTo(r.sortOrderSwitcherContainer);}}}var E=g(r.filterContainer);if(E.length){function v(){var Z=w.getFilterOptions();E.html("");for(var V=0,Y=Z.length;V<Y;V++){var U=Z[V].name;var O=Z[V].label;var J=Z[V].value;var M=g('<div class="filter_'+U+'"/>');if(J.selected){var G="<p><span>";G+=O;G+=" </span>";G+=J.value.lowest;if(m(U)){G+=" to ";G+=J.value.highest;}G+=' <a href="#" rel="';G+=U;G+='">remove</a></p>';M.append(G);E.append(M);}else{if(r.filtersUI[U]==="select"){var G='<select class="filters" id="filter_';G+=U;G+='" title="';G+=U;G+='"/>';var Q=g(G).bind("change",function(ac){var ae=g(ac.target);var af=ae.attr("title");if(m(af)){var ad=ae.val().split(r.attrMultiValSep);w.addFilter(af,ad[0],ad[1]);}else{w.addFilter(af,ae.val());}v();l(u,w);n(w);});var P=r.filtersClearCaptions[U]||r.filterClearDefaultText;Q.append('<option value="clear">'+P+"</option>");var I=0;if(m(U)){var R=[];for(var ab in J){I++;var W=0;var S=parseFloat(ab);while(R[W]&&S>R[W].val){W++;}R.splice(W,0,{val:S,qty:J[ab]});}var X=0;while(X<I){var aa=0;var N=R[X].val;var K=N+r.filterByRange[U];while(X<I&&R[X].val>=N&&R[X].val<K){aa+=R[X].qty;X++;}K=R[X-1].val;if(aa){var G='<option value="';G+=N;G+=r.attrMultiValSep;G+=K;G+='">';G+="$"+N;G+=" to ";G+="$"+K;G+=" (";G+=aa;G+=")</option>";Q.append(g(G));}}if(I>1){M.append('<label for="filter_'+U+'">'+O+"</label>");var H=g('<div class="selectwrap">').appendTo(M);H.append(Q);E.append(M);}}else{for(var ab in J){I++;Q.append('<option value="'+ab+'">'+ab+" ("+J[ab]+")</option>");}if(I>1){M.append('<label for="filter_'+U+'">'+O+"</label>");var H=g('<div class="selectwrap">').appendTo(M);H.append(Q);E.append(M);}}}else{var G='<ul class="filters" id="filter_';G+=U;G+='">';var Q=g(G).bind("click",function(ac){if(ac.target.tagName.toLowerCase()=="a"){ac.stopPropagation();ac.preventDefault();var ae=g(ac.target);var af=this.getAttribute("id").replace("filter_","");if(m(af)){var ad=ae.val().split(r.attrMultiValSep);w.addFilter(af,ad[0],ad[1]);}else{w.addFilter(af,ae.attr("title"));}v();l(u,w);n(w);}});var I=0;if(m(U)){var R=[];for(var ab in J){I++;var W=0;var S=parseFloat(ab);while(R[W]&&S>R[W].val){W++;}R.splice(W,0,{val:S,qty:J[ab]});}var X=0;while(X<I){var aa=0;var N=R[X].val;var K=N+r.filterByRange[U];while(X<I&&R[X].val>=N&&R[X].val<K){aa+=R[X].qty;X++;}K=R[X-1].val;if(aa){var G='<li><a href="#" title="';G+=N;G+=r.attrMultiValSep;G+=K;G+="\" onclick=\"_gaq.push(['_trackEvent', 'Categories', 'Filter', 'ByRange']);\" >";G+=N;G+=" to ";G+=K;G+=" (";G+=aa;G+=")</a></li>";Q.append(g(G));}}if(I>1){M.append('<span class="filtertitle '+U+'">'+O+"</span>");M.append(Q);E.append(M);}}else{var T=[];for(var ab in J){if(!!ab){T.push(ab);}}T=T.sort();for(var X=0,L=T.length;X<L;X++){var ab=T[X];I++;Q.append('<li class="'+ab.toString().toLowerCase().replace(/\s+|\++/g,"-")+"\"><a href=\"#\" onclick=\"_gaq.push(['_trackEvent', 'Categories', 'Filter', '"+ab+'\']);" title="'+ab+'">'+ab+" ("+J[ab]+")</a></li>");}if(I>1){M.append('<span class="filtertitle '+U+'">'+O+"</span>");M.append(Q);E.append(M);}}}}}}E.bind("click",function(G){G.preventDefault();var H=G.target;if(H.tagName.toLowerCase()=="a"){w.removeFilter(H.getAttribute("rel"));v();l(u,w);n(w);}});v();}var u=g(r.paginationLinksContainer);if(u.length){u.unbind().bind("click",function(G){var I=G.target;if(I.tagName.toLowerCase()=="li"){I=I.getAttribute("rel");var H=w.getCurrentPage();if(isNaN(I)){if(I=="next"){I=H;if(I<w.getPagesCount()-1){I++;}}else{I=H;if(I){I--;}}}else{I=parseInt(I);}if(I!=H){g("html, body").animate({scrollTop:0},"slow");u.find(".current").removeClass("current");w.setCurrentPage(I);I=u.find("li[rel="+I+"]").addClass("current");n(w);}}});l(u,w);}n(w);}function l(y,v){y.html("");var u=v.getPagesCount();if(u>1){var x=g("<ul>");x.append('<li class="prev" rel="prev">Prev.</li>');x.append('<li class="page current" rel="0">1</li>');for(var w=1;w<u;w++){x.append('<li class="page" rel="'+w+'">'+(w+1)+"</li>");}x.append('<li class="next" rel="next">Next</li>');}y.append(x);}var k=new c(o);this.setAttributes=function(u){k.setAttributes(u);};this.getItemsByColor=function(u){this.objCurrentSelectionInfo=u||this.objCurrentSelectionInfo;var w=g("<div>").css({"background-color":"#FFFFFF",width:"100%",height:"100%",position:"fixed",top:0,left:0}).fadeTo(0,0.5).appendTo("body");var v=r.itemListGetter;v.bindOnSuccess(function(x){k.initItemsList(x);q(k);w.remove();});v.bindOnError(function(){window.alert("An unexpected error occurred");w.remove();});v.getItems(u);this.getItemsByColor=function(x){this.objCurrentSelectionInfo=x||this.objCurrentSelectionInfo;var y=g("<div>").css({"background-color":"#FFFFFF",width:"100%",height:"100%",position:"fixed",top:0,left:0}).fadeTo(0,0.5).appendTo("body");r.itemListGetter.getItems(x);};this.setItemsPerPage=function(x){k.setItemsPerPage(x);l(g(r.paginationLinksContainer),k);n(k);};this.getItemsTotal=function(){return k.getSelectedItemsCountInfo().total;};};}return e;})(jQuery);function ItemListGetter(a){this.itemCell=a;}ItemListGetter.prototype={getItems:function(q){var b=window.location.href;var w=/[?&]range=[^&]+/.exec(b);if(w&&w.length){window.location.href=b.replace(w[0],"");}var g=this;var l=[];var x=$j(".gp_custom_pagination:eq(0)");x.parents("table:eq(0)").remove();var f=/(\d*)\sof\s(\d*)/.exec(x.text());if(f&&f.length==3){var p=parseInt(f[1]);var s=parseInt(f[2]);if(!isNaN(p)&&!isNaN(s)){var r=Math.ceil(s/p);var e=window.location.href+(window.location.href.indexOf("?")==-1?"?range=":"&range=");var y=0;for(var t=1,c=r-1;t<c;t++){y=p*t;var v=t-1;l[v]=e;l[v]+=y+1;l[v]+=",";l[v]+=y+p;l[v]+=",";l[v]+=s;}if(y<s&&r){var a=e;a+=p*(r-1)+1;a+=",";a+=s;a+=",";a+=s;l.push(a);}}}var h=[];var k=0;function m(){if(++k==l.length){g.arrItems=h;d(h);}}function o(i,A,z){$j.ajax({url:A,success:function(E){var D=[];j(D,E.replace(/<img[^>]+>/gi,""));for(var C=0,B=D.length;C<B;C++,z++){i.splice(z,0,D[C]);}m();}});}function j(z,i){$j(i).find(g.itemCell).each(function(){z.push(this.title);});}j(h,"body");var n=h.length;for(var t=0,u=l.length;t<u;t++){o(h,l[t],n);n+=n;}if(!l.length){g.arrItems=h;d(h);}function d(i){$j.ajax({url:"/app/site/hosting/scriptlet.nl",data:{sbcitems:i.join(","),script:"customscript_pp_ss_getitemsbycolor",deploy:"customdeploy_pp_ss_getitemsbycolor",columns:"storedisplayname,custitem_display_thumbnail,custitem_price_description,storedescription,type,onlinecustomerprice,category"},dataType:"json",success:function(z){if(z.error){throw new Error("");}g.success(z);},error:g.err});}},bindOnSuccess:function(a){this.success=a;},bindOnError:function(a){this.err=a;}};var parent_category=$j(".category_data .parent_category").text();var name_category=$j(".category_data .name_category").text();if(parent_category=="No"){name_image=name_category.replace(/[^A-Za-z0-9]/g,"");name_image=name_image.toLowerCase();image_url="/site/pp-cat-images/"+name_image+".jpg";$j("<img />").error(function(){return false;}).load(function(){$j(".cat-banner").html(this);}).attr({src:image_url,alt:name_category});}function AjaxItemListGetter(b){this.itemCell=b;}AjaxItemListGetter.prototype={getItems:function(){var J=this;if(J.arrItems&&J.arrItems.length){J.success(J.arrItems);return;}var F=[];var v=$j(".gp_custom_pagination:eq(0)");v.parents("table:eq(0)").remove();var K=/(\d*)\sof\s(\d*)/.exec(v.text());if(K&&K.length==3){var C=parseInt(K[1]);var z=parseInt(K[2]);if(!isNaN(C)&&!isNaN(z)){var A=Math.ceil(z/C);var L=window.location.href+(window.location.href.indexOf("?")==-1?"?range=":"&range=");var i=0;for(var y=1,M=A-1;y<M;y++){i=C*y;var w=y-1;F[w]=L;F[w]+=i+1;F[w]+=",";F[w]+=i+C;F[w]+=",";F[w]+=z;}if(i<z&&A){var N=L;N+=C*(A-1)+1;N+=",";N+=z;N+=",";N+=z;F.push(N);}}}var I=[];var G=0;function E(){if(++G==F.length){J.arrItems=I;J.success(I);}}function B(c,a,b){$j.ajax({url:a,success:function(e){var f=[];H(f,e.replace(/<img[^>]+>/gi,""));for(var g=0,d=f.length;g<d;g++,b++){c.splice(b,0,f[g]);}E();}});}function H(a,b){$j(b).find(J.itemCell).each(function(){var h={id:this.title};var d={};var f=this.children;var c;for(var g=0,e=f.length;g<e;g++){d[(c=f[g]).className]=c.innerHTML;}h.attributes=d;a.push(h);});}H(I,"body");var D=I.length;for(var y=0,x=F.length;y<x;y++){B(I,F[y],D);D+=D;}if(!F.length){this.success(I);J.arrItems=I;}},bindOnSuccess:function(b){this.success=b;},bindOnError:function(b){this.err=b;}};window.GPItemList=new GPItemList({itemListColumns:3,itemListGetter:new AjaxItemListGetter(".itemcellinfo"),onItemsLoaded:function(d){$j("img",d).each(function(){if(this.getAttribute("src")==""){this.setAttribute("src","/site/pp-templates/thumb.gif");}});$j(".div__addtocart",d).each(function(){var a=$j(this).find(".subclass").val();if(a==="01 15x15 Art"||a==="02 19x19 Art"||a==="03 23x23 Art"||a==="Art"){$j(this).find("a").css("display","none");$j(this).parent().css("padding-bottom","10px");}else{if($j(this).find(".onlinematrixpricerange").val()!==""){$j(this).find("a").css("display","none");$j(this).parent().css("padding-bottom","10px");}else{if($j(this).find(".isdropshipitem").val()==="Yes"){}else{if($j(this).find(".itemtype").val()==="Kit"){if($j(this).find(".quantityavailable").val()==="0"){$j(this).find("a").css("display","none");$j(this).find("a").after("<p>Coming Soon!</p>");}}else{if($j(this).find(".itemtype").val()==="GiftCert"){$j(this).find("a").css("display","none");$j(this).find("a").after('<a href="'+$j(this).parent().find("a").attr("href")+'">Add to cart</a>');console.log($j(this).parent().find("a").attr("href"));}else{if($j(this).find(".quantityavailable").val()==="0"){$j(this).find("a").css("display","none");$j(this).find("a").after("<p>Coming Soon!</p>");}}}}}}});$j(".thumb",d).each(function(){var b=$j(this).find(".flipimage").val();var a=$j(this).find("a").attr("href");if(b!==""){var c=$j(this).find("img").attr("src");$j(this).addClass("flipper");$j(this).html('<div class="face"><a href="'+a+'"><img src="'+c+'"></a></div><div class="back"><a href="'+a+'"><img src="'+b+'"></a></div>');}});var e=$j(".pagination");if(!e.html().length){e.prev().hide();}else{e.prev().show();}if(!$j(".itemlist div").length){$j(".toolbar, .paginationtoolbar").remove();}var f=$j("#filter_custitem3");if(!f.prev().hasClass("filterselect")){f.before('<div class="filterselect">Filter By Color&nbsp;&nbsp;&nbsp;</div>');}f.find("li").each(function(){this.style.backgroundImage="url(http://cdn-web.poppin.com/site/pp-templates/available-colors/"+this.className+".gif)";});$j(".item-cell .price").each(function(){this.innerHTML=this.innerHTML.replace(".00","");});},onAfterShow:function(){var a="",b="";$j(".item-cell").each(function(){if($j(this).hasClass("first")){h1=$j(this).find("h2").height();h2=$j(this).next().find("h2").height();h3=$j(this).next().next().find("h2").height();d1=$j(this).find(".short-desc").height();d2=$j(this).next().find(".short-desc").height();d3=$j(this).next().next().find(".short-desc").height();a=Math.max(h1,h2,h3);b=Math.max(d1,d2,d3);}$j(this).find("h2").height(a);$j(this).find(".short-desc").height(b);});},enableSortOrderSwitcher:false,itemListCellTemplate:'<div class="item-cell"><p class="thumb"><input type="hidden" class="flipimage" value="{{flipimage}}"><a href="/s.nl/it.A/id.{{id}}/.f"><img src="{{thumbnailurl}}" alt="{{displayname}}" /></a></p><p class="short-desc">{{storedescription}}</p><h2><a href="/s.nl/it.A/id.{{id}}/.f">{{displayname}}</a></h2><p class="price">${{salesprice}}</p><div class="div__addtocart"><div class="div__addtocart1"><input type="hidden" class="itemtype" value="{{itemtype}}"><input type="hidden" class="isdropshipitem" value="{{isdropshipitem}}"><input type="hidden" class="onlinematrixpricerange" value="{{onlinematrixpricerange}}"><input type="hidden" class="quantityavailable" value="{{quantityavailable}}"><input type="hidden" class="subclass" value="{{subclass}}"><a href="/app/site/query/additemtocart.nl?c=3363929&n=1&buyid={{buyid}}" onClick="_gaq.push([\'_trackEvent\', \'Categories\', \'AddToCart\', \'{{displayname}}\']);">ADD TO CART</a></div></div></div>',itemsPerPage:24});GPItemList.setAttributes([{id:"displayname",label:"Name A-Z",type:"str",sortDesc:false,sortOrder:1,useInSort:true},{id:"displayname1",label:"Name Z-A",type:"str",sortDesc:true,sortOrder:2,useInSort:true},{id:"salesprice",label:"Price (High-Low)",type:"price",sortDesc:true,sortOrder:3,useInSort:true},{id:"salesprice2",label:"Price (Low-High)",type:"price",sortDesc:false,sortOrder:4,useInSort:true},{id:"custitem3",label:"",filterOrder:1,useInFilter:true}]);jQuery(function(b){GPItemList.getItemsByColor();b("#itemsperpageselector").change(function(){GPItemList.setItemsPerPage(parseInt(b(this).val()));});});