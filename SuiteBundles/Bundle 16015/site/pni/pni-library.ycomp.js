var GPR_AAE_PNI=function(J){var M={itemListCell:".pni-cell",itemName:".name",itemURL:".url",itemThumbnail:".thumbnail",noThumbnail:"",itemCategoryURL:"",currentItemId:""};var O=false;var N=null;var H=null;var D=null;var I=null;var K=[];var P={};var G=0;function F(R){var Q=-1;var S=J(R).find(M.itemListCell);var T=S.length;if(T){if(D==null){B(J(S[0]))}if(K.length==0&&T>0){L(J(S[T-1]))
}if(!O){S.each(function(U){if(J(this).is("#pni_"+M.currentItemId)){Q=U;O=true;return false}});G=G+T;if(O&&T>1){switch(Q){case 0:E(J(S[Q+1]));break;case (T-1):A(J(S[Q-1]));break;default:A(J(S[Q-1]));E(J(S[Q+1]));break}}}else{if(!H){if(K.length==0){H=I}}if(!N){E(J(S[0]))}}}}function C(Q){if(Q&&Q.length&&(N==null||H==null)){J.ajax({url:Q.shift(),async:false,success:function(R){R=R.replace(/<img\b[^>]*>/ig,"");
F(R);if(N){Q.splice(0,Q.length-1)}C(Q)}})}}function B(Q){D={id:Q.attr("id").replace("pni_",""),name:Q.find(M.itemName).html(),url:Q.find(M.itemURL).html(),thumbnail:Q.find(M.itemThumbnail).html()}}function L(Q){I={id:Q.attr("id").replace("pni_",""),name:Q.find(M.itemName).html(),url:Q.find(M.itemURL).html(),thumbnail:Q.find(M.itemThumbnail).html()}}function A(Q){H={id:Q.attr("id").replace("pni_",""),name:Q.find(M.itemName).html(),url:Q.find(M.itemURL).html(),thumbnail:Q.find(M.itemThumbnail).html()}
}function E(Q){N={id:Q.attr("id").replace("pni_",""),name:Q.find(M.itemName).html(),url:Q.find(M.itemURL).html(),thumbnail:Q.find(M.itemThumbnail).html()}}return{init:function(Q){if(Q!==null&&Q!==undefined){J.extend(M,Q)}J.ajax({url:M.itemCategoryURL,success:function(S){S=S.replace(/<img\b[^>]*>/ig,"");J('#handle_itemMainPortlet [href*="range="]:eq(0)',S).parents("table:eq(0)").find("a").each(function(){var T=J(this);
if(!P[T.attr("href")]){K.push(T.attr("href"));P[T.attr("href")]=true}});F(S);C(K);if(G>1){if(!N){N=D}if(!H){H=I}if(H){M.prev.attr({href:H.url,title:H.name});var R=(H.thumbnail.length&&H.thumbnail.replace(/amp;/gi,""))||M.noThumbnail;M.prevThumb.append('<img src="'+R+'">');M.prevName.html(H.name)}if(N){M.next.attr({href:N.url,title:N.name});var R=(N.thumbnail.length&&N.thumbnail.replace(/amp;/gi,""))||M.noThumbnail;
M.nextThumb.append('<img src="'+R+'">');M.nextName.html(N.name)}M.wraper.show()}else{M.wraper.hide()}}})}}}(jQuery);