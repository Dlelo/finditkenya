!function(w){function y(e,t){e=e.replace(/[\[]/,"\\[").replace(/[\]]/,"\\]");var i=new RegExp("[\\?&]"+e+"=([^&#]*)").exec(t);return null==i?"":i[1]}w.prettyPhoto={version:"3.0"},w.fn.prettyPhoto=function(t){t=jQuery.extend({animation_speed:"fast",slideshow:!1,autoplay_slideshow:!1,opacity:.8,show_title:!0,allow_resize:!0,default_width:500,default_height:344,counter_separator_label:"/",theme:"facebook",hideflash:!1,wmode:"opaque",autoplay:!0,modal:!1,overlay_gallery:!0,keyboard_shortcuts:!0,changepicturecallback:function(){},callback:function(){},markup:'<div class="pp_pic_holder">       <div class="ppt">&nbsp;</div>       <div class="pp_top">        <div class="pp_left"></div>        <div class="pp_middle"></div>        <div class="pp_right"></div>       </div>       <div class="pp_content_container">        <div class="pp_left">        <div class="pp_right">         <div class="pp_content">          <div class="pp_loaderIcon"></div>          <div class="pp_fade">           <a href="#" class="pp_expand" title="Expand the image">Expand</a>           <div class="pp_hoverContainer">            <a class="pp_next" href="#">next</a>            <a class="pp_previous" href="#">previous</a>           </div>           <div id="pp_full_res"></div>           <div class="pp_details clearfix">            <p class="pp_description"></p>            <a class="pp_close" href="#">Close</a>            <div class="pp_nav">             <a href="#" class="pp_arrow_previous">Previous</a>             <p class="currentTextHolder">0/0</p>             <a href="#" class="pp_arrow_next">Next</a>            </div>           </div>          </div>         </div>        </div>        </div>       </div>       <div class="pp_bottom">        <div class="pp_left"></div>        <div class="pp_middle"></div>        <div class="pp_right"></div>       </div>      </div>      <div class="pp_overlay"></div>',gallery_markup:'<div class="pp_gallery">         <a href="#" class="pp_arrow_previous">Previous</a>         <ul>          {gallery}         </ul>         <a href="#" class="pp_arrow_next">Next</a>        </div>',image_markup:'<img id="fullResImage" src="" />',flash_markup:'<object classid="clsid:D27CDB6E-AE6D-11cf-96B8-444553540000" width="{width}" height="{height}"><param name="wmode" value="{wmode}" /><param name="allowfullscreen" value="true" /><param name="allowscriptaccess" value="always" /><param name="movie" value="{path}" /><embed src="{path}" type="application/x-shockwave-flash" allowfullscreen="true" allowscriptaccess="always" width="{width}" height="{height}" wmode="{wmode}"></embed></object>',quicktime_markup:'<object classid="clsid:02BF25D5-8C17-4B23-BC80-D3488ABDDC6B" codebase="http://www.apple.com/qtactivex/qtplugin.cab" height="{height}" width="{width}"><param name="src" value="{path}"><param name="autoplay" value="{autoplay}"><param name="type" value="video/quicktime"><embed src="{path}" height="{height}" width="{width}" autoplay="{autoplay}" type="video/quicktime" pluginspage="http://www.apple.com/quicktime/download/"></embed></object>',iframe_markup:'<iframe src ="{path}" width="{width}" height="{height}" frameborder="no"></iframe>',inline_markup:'<div class="pp_inline clearfix">{content}</div>',custom_markup:""},t);var i,e,p,a,o,s,r,n=this,l=!1,d=w(window).height(),h=w(window).width();function c(e){$pp_pic_holder.find("#pp_full_res object,#pp_full_res embed").css("visibility","hidden"),$pp_pic_holder.find(".pp_fade").fadeOut(settings.animation_speed,function(){w(".pp_loaderIcon").show(),e()})}function _(e,t){if(resized=!1,g(e,t),imageWidth=e,imageHeight=t,(h<s||d<o)&&doresize&&settings.allow_resize&&!l){for(resized=!0,fitting=!1;!fitting;)h<s?(imageWidth=h-200,imageHeight=t/e*imageWidth):d<o?(imageHeight=d-200,imageWidth=e/t*imageHeight):fitting=!0,o=imageHeight,s=imageWidth;g(imageWidth,imageHeight)}return{width:Math.floor(imageWidth),height:Math.floor(imageHeight),containerHeight:Math.floor(o),containerWidth:Math.floor(s)+40,contentHeight:Math.floor(p),contentWidth:Math.floor(a),resized:resized}}function g(e,t){e=parseFloat(e),t=parseFloat(t),$pp_details=$pp_pic_holder.find(".pp_details"),$pp_details.width(e),detailsHeight=parseFloat($pp_details.css("marginTop"))+parseFloat($pp_details.css("marginBottom")),$pp_details=$pp_details.clone().appendTo(w("body")).css({position:"absolute",top:-1e4}),detailsHeight+=$pp_details.height(),detailsHeight=detailsHeight<=34?36:detailsHeight,w.browser.msie&&7==w.browser.version&&(detailsHeight+=8),$pp_details.remove(),p=t+detailsHeight,a=e,o=p+$ppt.height()+$pp_pic_holder.find(".pp_top").height()+$pp_pic_holder.find(".pp_bottom").height(),s=e}function m(e){return e.match(/youtube\.com\/watch/i)?"youtube":e.match(/vimeo\.com/i)?"vimeo":-1!=e.indexOf(".mov")?"quicktime":-1!=e.indexOf(".swf")?"flash":-1!=e.indexOf("iframe")?"iframe":-1!=e.indexOf("custom")?"custom":"#"==e.substr(0,1)?"inline":"image"}function u(){doresize&&"undefined"!=typeof $pp_pic_holder&&(scroll_pos=f(),titleHeight=$ppt.height(),contentHeight=$pp_pic_holder.height(),contentwidth=$pp_pic_holder.width(),projectedTop=d/2+scroll_pos.scrollTop-contentHeight/2,$pp_pic_holder.css({top:projectedTop,left:h/2+scroll_pos.scrollLeft-contentwidth/2}))}function f(){return self.pageYOffset?{scrollTop:self.pageYOffset,scrollLeft:self.pageXOffset}:document.documentElement&&document.documentElement.scrollTop?{scrollTop:document.documentElement.scrollTop,scrollLeft:document.documentElement.scrollLeft}:document.body?{scrollTop:document.body.scrollTop,scrollLeft:document.body.scrollLeft}:void 0}function v(e){if(theRel=w(e).attr("data-gal"),galleryRegExp=/\[(?:.*)\]/,isSet=!!galleryRegExp.exec(theRel),pp_images=isSet?jQuery.map(n,function(e,t){if(-1!=w(e).attr("data-gal").indexOf(theRel))return w(e).attr("href")}):w.makeArray(w(e).attr("href")),pp_titles=isSet?jQuery.map(n,function(e,t){if(-1!=w(e).attr("data-gal").indexOf(theRel))return w(e).find("img").attr("alt")?w(e).find("img").attr("alt"):""}):w.makeArray(w(e).find("img").attr("alt")),pp_descriptions=isSet?jQuery.map(n,function(e,t){if(-1!=w(e).attr("data-gal").indexOf(theRel))return w(e).attr("title")?w(e).attr("title"):""}):w.makeArray(w(e).attr("title")),w("body").append(settings.markup),$pp_pic_holder=w(".pp_pic_holder"),$ppt=w(".ppt"),$pp_overlay=w("div.pp_overlay"),isSet&&settings.overlay_gallery){currentGalleryPage=0,toInject="";for(var t=0;t<pp_images.length;t++){var i=new RegExp("(.*?).(jpg|jpeg|png|gif)$").exec(pp_images[t]);classname=i?"":"default",toInject+="<li class='"+classname+"'><a href='#'><img src='"+pp_images[t]+"' width='50' alt='' /></a></li>"}toInject=settings.gallery_markup.replace(/{gallery}/g,toInject),$pp_pic_holder.find("#pp_full_res").after(toInject),$pp_pic_holder.find(".pp_gallery .pp_arrow_next").click(function(){return w.prettyPhoto.changeGalleryPage("next"),w.prettyPhoto.stopSlideshow(),!1}),$pp_pic_holder.find(".pp_gallery .pp_arrow_previous").click(function(){return w.prettyPhoto.changeGalleryPage("previous"),w.prettyPhoto.stopSlideshow(),!1}),$pp_pic_holder.find(".pp_content").hover(function(){$pp_pic_holder.find(".pp_gallery:not(.disabled)").fadeIn()},function(){$pp_pic_holder.find(".pp_gallery:not(.disabled)").fadeOut()}),itemWidth=57,$pp_pic_holder.find(".pp_gallery ul li").each(function(e){w(this).css({position:"absolute",left:e*itemWidth}),w(this).find("a").unbind("click").click(function(){return w.prettyPhoto.changePage(e),w.prettyPhoto.stopSlideshow(),!1})})}settings.slideshow&&($pp_pic_holder.find(".pp_nav").prepend('<a href="#" class="pp_play">Play</a>'),$pp_pic_holder.find(".pp_nav .pp_play").click(function(){return w.prettyPhoto.startSlideshow(),!1})),$pp_pic_holder.attr("class","pp_pic_holder "+settings.theme),$pp_overlay.css({opacity:0,height:w(document).height(),width:w(document).width()}).bind("click",function(){settings.modal||w.prettyPhoto.close()}),w("a.pp_close").bind("click",function(){return w.prettyPhoto.close(),!1}),w("a.pp_expand").bind("click",function(e){return w(this).hasClass("pp_expand")?(w(this).removeClass("pp_expand").addClass("pp_contract"),doresize=!1):(w(this).removeClass("pp_contract").addClass("pp_expand"),doresize=!0),c(function(){w.prettyPhoto.open()}),!1}),$pp_pic_holder.find(".pp_previous, .pp_nav .pp_arrow_previous").bind("click",function(){return w.prettyPhoto.changePage("previous"),w.prettyPhoto.stopSlideshow(),!1}),$pp_pic_holder.find(".pp_next, .pp_nav .pp_arrow_next").bind("click",function(){return w.prettyPhoto.changePage("next"),w.prettyPhoto.stopSlideshow(),!1}),u()}return doresize=!0,scroll_pos=f(),w(window).unbind("resize").resize(function(){u(),d=w(window).height(),h=w(window).width(),"undefined"!=typeof $pp_overlay&&$pp_overlay.height(w(document).height())}),t.keyboard_shortcuts&&w(document).unbind("keydown").keydown(function(e){if("undefined"!=typeof $pp_pic_holder&&$pp_pic_holder.is(":visible")){switch(e.keyCode){case 37:w.prettyPhoto.changePage("previous");break;case 39:w.prettyPhoto.changePage("next");break;case 27:settings.modal||w.prettyPhoto.close()}return!1}}),w.prettyPhoto.initialize=function(){return settings=t,w.browser.msie&&6==parseInt(w.browser.version)&&(settings.theme="light_square"),v(this),settings.allow_resize&&w(window).scroll(function(){u()}),u(),set_position=jQuery.inArray(w(this).attr("href"),pp_images),w.prettyPhoto.open(),!1},w.prettyPhoto.open=function(e){return"undefined"==typeof settings&&(settings=t,w.browser.msie&&6==w.browser.version&&(settings.theme="light_square"),v(e.target),pp_images=w.makeArray(e),pp_titles=arguments[1]?w.makeArray(arguments[1]):w.makeArray(""),pp_descriptions=arguments[2]?w.makeArray(arguments[2]):w.makeArray(""),isSet=1<pp_images.length,set_position=0),w.browser.msie&&6==w.browser.version&&w("select").css("visibility","hidden"),settings.hideflash&&w("object,embed").css("visibility","hidden"),function(e){set_position==e-1?($pp_pic_holder.find("a.pp_next").css("visibility","hidden"),$pp_pic_holder.find("a.pp_next").addClass("disabled").unbind("click")):($pp_pic_holder.find("a.pp_next").css("visibility","visible"),$pp_pic_holder.find("a.pp_next.disabled").removeClass("disabled").bind("click",function(){return w.prettyPhoto.changePage("next"),!1}));0==set_position?$pp_pic_holder.find("a.pp_previous").css("visibility","hidden").addClass("disabled").unbind("click"):$pp_pic_holder.find("a.pp_previous.disabled").css("visibility","visible").removeClass("disabled").bind("click",function(){return w.prettyPhoto.changePage("previous"),!1});1<e?w(".pp_nav").show():w(".pp_nav").hide()}(w(pp_images).size()),w(".pp_loaderIcon").show(),$ppt.is(":hidden")&&$ppt.css("opacity",0).show(),$pp_overlay.show().fadeTo(settings.animation_speed,settings.opacity),$pp_pic_holder.find(".currentTextHolder").text(set_position+1+settings.counter_separator_label+w(pp_images).size()),$pp_pic_holder.find(".pp_description").show().html(unescape(pp_descriptions[set_position])),settings.show_title&&""!=pp_titles[set_position]&&void 0!==pp_titles[set_position]?$ppt.html(unescape(pp_titles[set_position])):$ppt.html("&nbsp;"),movie_width=parseFloat(y("width",pp_images[set_position]))?y("width",pp_images[set_position]):settings.default_width.toString(),movie_height=parseFloat(y("height",pp_images[set_position]))?y("height",pp_images[set_position]):settings.default_height.toString(),-1!=movie_width.indexOf("%")||-1!=movie_height.indexOf("%")?(movie_height=parseFloat(w(window).height()*parseFloat(movie_height)/100-150),movie_width=parseFloat(w(window).width()*parseFloat(movie_width)/100-150),l=!0):l=!1,$pp_pic_holder.fadeIn(function(){switch(imgPreloader="",m(pp_images[set_position])){case"image":imgPreloader=new Image,nextImage=new Image,isSet&&set_position>w(pp_images).size()&&(nextImage.src=pp_images[set_position+1]),prevImage=new Image,isSet&&pp_images[set_position-1]&&(prevImage.src=pp_images[set_position-1]),$pp_pic_holder.find("#pp_full_res")[0].innerHTML=settings.image_markup,$pp_pic_holder.find("#fullResImage").attr("src",pp_images[set_position]),imgPreloader.onload=function(){i=_(imgPreloader.width,imgPreloader.height),_showContent()},imgPreloader.onerror=function(){alert("Image cannot be loaded. Make sure the path is correct and image exist."),w.prettyPhoto.close()},imgPreloader.src=pp_images[set_position];break;case"youtube":i=_(movie_width,movie_height),movie="http://www.youtube.com/v/"+y("v",pp_images[set_position]),settings.autoplay&&(movie+="&autoplay=1"),toInject=settings.flash_markup.replace(/{width}/g,i.width).replace(/{height}/g,i.height).replace(/{wmode}/g,settings.wmode).replace(/{path}/g,movie);break;case"vimeo":i=_(movie_width,movie_height),movie_id=pp_images[set_position];var e=movie_id.match(/http:\/\/(www\.)?vimeo.com\/(\d+)/);movie="http://player.vimeo.com/video/"+e[2]+"?title=0&amp;byline=0&amp;portrait=0",settings.autoplay&&(movie+="&autoplay=1;"),vimeo_width=i.width+"/embed/?moog_width="+i.width,toInject=settings.iframe_markup.replace(/{width}/g,vimeo_width).replace(/{height}/g,i.height).replace(/{path}/g,movie);break;case"quicktime":(i=_(movie_width,movie_height)).height+=15,i.contentHeight+=15,i.containerHeight+=15,toInject=settings.quicktime_markup.replace(/{width}/g,i.width).replace(/{height}/g,i.height).replace(/{wmode}/g,settings.wmode).replace(/{path}/g,pp_images[set_position]).replace(/{autoplay}/g,settings.autoplay);break;case"flash":i=_(movie_width,movie_height),flash_vars=pp_images[set_position],flash_vars=flash_vars.substring(pp_images[set_position].indexOf("flashvars")+10,pp_images[set_position].length),filename=pp_images[set_position],filename=filename.substring(0,filename.indexOf("?")),toInject=settings.flash_markup.replace(/{width}/g,i.width).replace(/{height}/g,i.height).replace(/{wmode}/g,settings.wmode).replace(/{path}/g,filename+"?"+flash_vars);break;case"iframe":i=_(movie_width,movie_height),frame_url=pp_images[set_position],frame_url=frame_url.substr(0,frame_url.indexOf("iframe")-1),toInject=settings.iframe_markup.replace(/{width}/g,i.width).replace(/{height}/g,i.height).replace(/{path}/g,frame_url);break;case"custom":i=_(movie_width,movie_height),toInject=settings.custom_markup;break;case"inline":myClone=w(pp_images[set_position]).clone().css({width:settings.default_width}).wrapInner('<div id="pp_full_res"><div class="pp_inline clearfix"></div></div>').appendTo(w("body")),i=_(w(myClone).width(),w(myClone).height()),w(myClone).remove(),toInject=settings.inline_markup.replace(/{content}/g,w(pp_images[set_position]).html())}imgPreloader||($pp_pic_holder.find("#pp_full_res")[0].innerHTML=toInject,_showContent())}),!1},w.prettyPhoto.changePage=function(e){if(currentGalleryPage=0,"previous"==e){if(set_position--,set_position<0)return void(set_position=0)}else"next"==e?(set_position++,set_position>w(pp_images).size()-1&&(set_position=0)):set_position=e;doresize||(doresize=!0),w(".pp_contract").removeClass("pp_contract").addClass("pp_expand"),c(function(){w.prettyPhoto.open()})},w.prettyPhoto.changeGalleryPage=function(e){"next"==e?(currentGalleryPage++,currentGalleryPage>totalPage&&(currentGalleryPage=0)):"previous"==e?(currentGalleryPage--,currentGalleryPage<0&&(currentGalleryPage=totalPage)):currentGalleryPage=e,itemsToSlide=currentGalleryPage==totalPage?pp_images.length-totalPage*itemsPerPage:itemsPerPage,$pp_pic_holder.find(".pp_gallery li").each(function(e){w(this).animate({left:e*itemWidth-itemsToSlide*itemWidth*currentGalleryPage})})},w.prettyPhoto.startSlideshow=function(){void 0===r?($pp_pic_holder.find(".pp_play").unbind("click").removeClass("pp_play").addClass("pp_pause").click(function(){return w.prettyPhoto.stopSlideshow(),!1}),r=setInterval(w.prettyPhoto.startSlideshow,settings.slideshow)):w.prettyPhoto.changePage("next")},w.prettyPhoto.stopSlideshow=function(){$pp_pic_holder.find(".pp_pause").unbind("click").removeClass("pp_pause").addClass("pp_play").click(function(){return w.prettyPhoto.startSlideshow(),!1}),clearInterval(r),r=void 0},w.prettyPhoto.close=function(){clearInterval(r),$pp_pic_holder.stop().find("object,embed").css("visibility","hidden"),w("div.pp_pic_holder,div.ppt,.pp_fade").fadeOut(settings.animation_speed,function(){w(this).remove()}),$pp_overlay.fadeOut(settings.animation_speed,function(){w.browser.msie&&6==w.browser.version&&w("select").css("visibility","visible"),settings.hideflash&&w("object,embed").css("visibility","visible"),w(this).remove(),w(window).unbind("scroll"),settings.callback(),doresize=!0,e=!1,delete settings})},_showContent=function(){w(".pp_loaderIcon").hide(),$ppt.fadeTo(settings.animation_speed,1),projectedTop=scroll_pos.scrollTop+(d/2-i.containerHeight/2),projectedTop<0&&(projectedTop=0),$pp_pic_holder.find(".pp_content").animate({height:i.contentHeight},settings.animation_speed),$pp_pic_holder.animate({top:projectedTop,left:h/2-i.containerWidth/2,width:i.containerWidth},settings.animation_speed,function(){$pp_pic_holder.find(".pp_hoverContainer,#fullResImage").height(i.height).width(i.width),$pp_pic_holder.find(".pp_fade").fadeIn(settings.animation_speed),isSet&&"image"==m(pp_images[set_position])?$pp_pic_holder.find(".pp_hoverContainer").show():$pp_pic_holder.find(".pp_hoverContainer").hide(),i.resized&&w("a.pp_expand,a.pp_contract").fadeIn(settings.animation_speed),!settings.autoplay_slideshow||r||e||w.prettyPhoto.startSlideshow(),settings.changepicturecallback(),e=!0}),isSet&&settings.overlay_gallery&&"image"==m(pp_images[set_position])?(itemWidth=57,navWidth="facebook"==settings.theme?58:38,itemsPerPage=Math.floor((i.containerWidth-100-navWidth)/itemWidth),itemsPerPage=itemsPerPage<pp_images.length?itemsPerPage:pp_images.length,totalPage=Math.ceil(pp_images.length/itemsPerPage)-1,0==totalPage?(navWidth=0,$pp_pic_holder.find(".pp_gallery .pp_arrow_next,.pp_gallery .pp_arrow_previous").hide()):$pp_pic_holder.find(".pp_gallery .pp_arrow_next,.pp_gallery .pp_arrow_previous").show(),galleryWidth=itemsPerPage*itemWidth+navWidth,$pp_pic_holder.find(".pp_gallery").width(galleryWidth).css("margin-left",-galleryWidth/2),$pp_pic_holder.find(".pp_gallery ul").width(itemsPerPage*itemWidth).find("li.selected").removeClass("selected"),goToPage=Math.floor(set_position/itemsPerPage)<=totalPage?Math.floor(set_position/itemsPerPage):totalPage,itemsPerPage?$pp_pic_holder.find(".pp_gallery").hide().show().removeClass("disabled"):$pp_pic_holder.find(".pp_gallery").hide().addClass("disabled"),w.prettyPhoto.changeGalleryPage(goToPage),$pp_pic_holder.find(".pp_gallery ul li:eq("+set_position+")").addClass("selected")):($pp_pic_holder.find(".pp_content").unbind("mouseenter mouseleave"),$pp_pic_holder.find(".pp_gallery").hide())},this.unbind("click").click(w.prettyPhoto.initialize)}}(jQuery);
