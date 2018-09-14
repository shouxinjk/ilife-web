// 文档加载完毕后执行
$(document).ready(function ()
{
    //根据屏幕大小计算字体大小
    const oHtml = document.getElementsByTagName('html')[0]
    const width = oHtml.clientWidth;
    var rootFontSize = 12 * (width / 1440);// 在1440px的屏幕基准像素为12px
    rootFontSize = rootFontSize <8 ? 8:rootFontSize;//最小为8px
    oHtml.style.fontSize = rootFontSize+ "px";
    //设置正文部分宽度
    var bodyWidth = 960*width/1440; //1440分辨率下显示960宽度
    $("#body").width(bodyWidth);
    galleryWidth = bodyWidth*0.7;//占比70%，960下宽度为672
    galleryHeight = 9*galleryWidth/16;//宽高比为16:9
    $("#main").width(galleryWidth);
    //处理参数
    var args = getQuery();
    var category = args["category"]; //当前目录
    var id = args["id"];//当前内容
    //判断屏幕大小，如果是小屏则跳转
    if(width<800){
        window.location.href=window.location.href.replace(/info.html/g,"info2.html");
    }
    //加载导航和内容
    loadCategories(category);
    loadItem(id);   
    loadHosts(id);
});

var galleryWidth = 673;
var galleryHeight = 378;

//将item显示到页面
function showContent(item){
    //左侧：
    //标题
    $("#content").append("<div class='title'>"+item.title+"</div>");
    // 标签
    //正文及图片
    for(var i=0;i<item.images.length;i++){
        $("#gallery").append("<li><img src='" + item.images[i] + "' alt=''/></li>");//加载图片幻灯
        $("#content").append("<img src='" + item.images[i] + "' width='100%'/>");//正文图片
    }

    //初始化图片幻灯
    $('#gallery').galleryView({
        panel_width: galleryWidth,
        panel_height: galleryHeight,
        frame_width: 80,
        frame_height: 60
    }); 

    //右侧：
    //购买按钮
    if(item.distributor.images.length>0)$("#shopping-summary").append("<img src='"+item.distributor.images[0]+"'/>");
    if(item.seller.images.length>0)$("#shopping-summary").append("<img src='"+item.seller.images[0]+"'/>");
    if(item.manufacturer.images.length>0)$("#shopping-summary").append("<img src='"+item.manufacturer.images[0]+"'/>");
    $("#jumpbtn").click(function(){//支持点击事件
        console.log(item.url);
        window.location.href = item.url;
    });    
    //标题
    $("#title").html(item.title);
    //推荐者列表
    //标签云
    for(var i=0;i<item.tags.length;i++){
        $("#tags").append("<div class='tag'>" + item.tags[i] + "</div>");//加载图片幻灯
    }
    //随机着色
    $("#tags").find("div").each(function(){
        var rgb = Math.floor(Math.random()*(2<<23));
        var bgColor = '#'+rgb.toString(16);
        var color= '#'+(0xFFFFFF-rgb).toString(16);
        $(this).css({"background-color":bgColor,"color":color});
    });
    //广告
    //TODO
}

/*
<view class="person" data-url="{{_key}}" catchtap='jump'>
    <image class="person-img" mode="aspectFill" src="{{avatarUrl}}" data-url="{{_key}}" catchtap='jump'/>
    <view class="person-name">{{nickName}}</view>
    <!-- 关注按钮 -->
    <view class="connect-status{{connected?'':'-pending'}}">{{connected?'已关注':'+关注'}}</view> 
</view>  
*/
function showHosts(hosts){
    var template="<div class='person'>"+
    "<div class='logo'><img src='__imgSrc' alt='__name'/></div>"+//image
    "<div class='name'>__name</div>"+//name
    "<div class='connection'><button type='button' class='btn __status'>__text</button></div>"+//button
    "</div>";
    for(var i=0;i<hosts.length;i++){
        var h = hosts[i];
        var hostEl = template.replace(/__imgSrc/g,h.avatarUrl)
            .replace(/__name/g,h.nickName)
            .replace(/__status/g,"toconnect")
            .replace(/__text/g,"+关注");
        $("#author").append(hostEl);
    }
}

function loadItem(key){//获取内容列表
    $.ajax({
        url:"https://data.shouxinjk.net/_db/sea/my/stuff/"+key,
        type:"get",
        data:{},
        success:function(data){
            showContent(data);
        }
    })            
}

function loadHosts(itemId){//获取推荐者列表，可能有多个
    $.ajax({
        url:"https://data.shouxinjk.net/_db/sea/user/users/",
        type:"get",
        data:{itemId:itemId},
        success:function(data){
            showHosts(data);
        }
    })
}

function loadCategories(currentCategory){
    $.ajax({
        url:"https://data.shouxinjk.net/_db/sea/category/categories",
        type:"get",
        success:function(msg){
            var navObj = $(".navUl");
            for(var i = 0 ; i < msg.length ; i++){
                navObj.append("<li data='"+msg[i]._key+"'>"+msg[i].name+"</li>");
                if(currentCategory == msg[i]._key)//高亮显示当前选中的category
                    $(navObj.find("li")[i]).addClass("showNav");
            }
            //注册点击事件
            navObj.find("li").click(function(){
                var key = $(this).attr("data");
                //跳转到首页
                window.location.href = "index.html?category="+key;
            })
        }
    })    
}
