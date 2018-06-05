/**
 * Created by 94553 on 2018/3/28.
 */
var url = "http://data.pcitech.cn/_db/sea";
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

var key = GetRequest().key;

if(key == undefined || key == null || key == ""){
    $.ajax({
        url:url + "/good/wishes",
        type:"get",
        success:function(msg){
            var navObj = $(".navUl");
            for(var i = 0 ; i < msg.length ; i++){
                navObj.append("<li data='"+msg[i]._key+"'>"+msg[i].name+"</li>");
                $(navObj.find("li")[0]).addClass("showNav");
            }

            var key =  $(navObj.find("li")[0]).attr("data");
            getList(key);

            navObj.find("li").click(function(){
                var key = $(this).attr("data");
                getList(key);
                $(navObj.find("li")).removeClass("showNav");
                $(this).addClass("showNav");
            })
        }
    })

}else{
    var thisKey = key;
    $.ajax({
        url:url + "/good/wishes",
        type:"get",
        success:function(msg){
            var navObj = $(".navUl");
            for(var i = 0 ; i < msg.length ; i++){
                navObj.append("<li data='"+msg[i]._key+"'>"+msg[i].name+"</li>");
                if(thisKey == msg[i]._key){
                    $(navObj.find("li")[i]).addClass("showNav");
                }

            }

            var key =  $(".showNav").attr("data");
            getList(key);

            navObj.find("li").click(function(){
                var key = $(this).attr("data");
                getList(key);
                $(navObj.find("li")).removeClass("showNav");
                $(this).addClass("showNav");
            })
        }
    })
}





function getList(key){
    var navKey = key;
    $.ajax({
        url:url+"/beautiful/things",
        type:"get",
        data:{wish:key},
        success:function(data){
            $(".math").html(data.length);
            var content = $(".content");
            content.html("");
            for(var i = 0 ; i < data.length ; i++){
                if(data[i].images.length>0){
                    var imgs = "";
                    for(var j = 0;j<data[i].images.length;j++){
                        imgs += "<img src='"+data[i].images[j]+"'>";
                    }
                }

                content.append(' <div class="information">' +
                    '<div class="info_head" data="'+data[i]._key+'">' +
                    '<div class="head_left"><div class="type '+data[i].tags[0].type+'">'+data[i].type+'</div></div>' +
                    '<div class="head_right">' +
                    '<div class="right_top">  <div class="title">'+data[i].title+'</div></div>' +
                    '<div class="right_bottom"> <div class="starss"> <input value="'+data[i].rank+'" type="text" class="rating" data-min=0 data-max=5 data-step=0.1 disabled="disabled" data-size=""required title=""> </div> <div class="hot">推荐度:<span>'+data[i].score+'%</span></div></div>' +
                    '</div>' +
                    '</div>' +
                    '<div class="clearfix"></div>' +
                    '<div class="info_status">'+data[i].summary+'</div>' +
                    '<div class="info_images">'+imgs+'</div>' +
                    '<div class="info_source"><div class="source">'+data[i].source+'</div><div class="info_delete" data="'+data[i]._key+'">×</div></div><div class="clearfix"></div>' +
                    '</div>');
            }


            $(".rating").rating({
                showCaption:false,
                showClear:false,
            });

            $(".info_delete").click(function(){
                var key = $(this).attr("data");
                deleteInfo(key);
            })

            $(".info_head").click(function(){
                var key = $(this).attr("data");
                link(key,navKey);
            })

        }
    })

}


function deleteInfo(key){
    $.ajax({
        url:url+"/things/"+key,
        type:"get",
        success:function(msg){
        }
    })
}


function link(key,navKey){
    window.location.href = "info.html?key="+key+"&navKey="+navKey;
}
