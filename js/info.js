/**
 * Created by 94553 on 2018/3/28.
 */
function GetRequest() {
    var url = location.search; //获取url中"?"符后的字串
    var theRequest = new Object();
    if (url.indexOf("?") != -1) {
        var str = url.substr(1);
        strs = str.split("&");
        for(var i = 0; i < strs.length; i ++) {
            theRequest[strs[i].split("=")[0]]=unescape(strs[i].split("=")[1]);
        }
    }
    return theRequest;
}

var url = "http://data.pcitech.cn/_db/sea";
var key = GetRequest().key;
var navkey = GetRequest().navKey;


$.ajax({
    url:url + "/good/wishes",
    type:"get",
    success:function(msg){
        var navObj = $(".navUl");
        for(var i = 0 ; i < msg.length ; i++){
            navObj.append("<li data='"+msg[i]._key+"'>"+msg[i].name+"</li>");
            if(navkey == msg[i]._key){
                $(navObj.find("li")[i]).addClass("showNav");
            }

        }

        getInfo(key)

        navObj.find("li").click(function(){
            var key = $(this).attr("data");
            window.location.href = "index.html?key="+key;
        })
    }
})



function getInfo(key){
    $.ajax({
        url:url+"/beautiful/things/"+key,
        type:"get",
        success:function(data){
            var content = $(".content");
            content.html("");
//                for(var i = 0 ; i < data.length ; i++){
            content.append(' <div class="information">' +
                '<div class="title">'+data.title+'</div>' +
                '<div class="info_head">' +
                '<div class="head_left"><div class="type category">'+data.type+'</div></div>' +
                '<div class="head_right">' +
                '<div class="right_top">  <div class="categorys">'+data.category+'</div> <div class="starss"> <input value="'+data.rank+'" type="text" disabled="disabled" class="rating" data-min=0 data-max=5 data-step=0.1 data-size=""required title=""> </div> </div>' +
                '<div class="right_bottom"><div class="hot">推荐度:<br><span>'+data.score+'%</span></div></div>' +
                '<div class="headRight"><button onclick="link()">立即拔草</button></div>' +
                '</div>' +
                '</div>' +
                '<div class="clearfix"></div>' +
                '<div class="info_status">'+data.summary+'</div>' +
                '<div class="info_content">'+data.content+'</div>' +
//                            '<div class="info_images">'+imgs+'</div>' +
//                            '<div class="info_source"><div class="source">'+data.source+'</div><div class="info_delete" data="'+data._key+'">×</div></div><div class="clearfix"></div>' +
                '</div>');
//                }

            $(".rating").rating({
                showCaption:false,
                showClear:false,
            });

        }
    })

}



function link(key){
    alert("跳转")
}
