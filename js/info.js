// 文档加载完毕后执行
$(document).ready(function ()
{
    //根据屏幕大小计算字体大小
    const oHtml = document.getElementsByTagName('html')[0]
    const width = oHtml.clientWidth;
    var rootFontSize = 12 * (width / 1440);// 在1440px的屏幕基准像素为12px
    rootFontSize = rootFontSize <8 ? 8:rootFontSize;//最小为8px
    oHtml.style.fontSize = rootFontSize+ "px";
    //处理参数
    var args = getQuery();
    var category = args["category"]; //当前目录
    var id = args["id"];//当前内容
    //加载导航和内容
    loadCategories(category);
    loadItem(id);
});

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

//将item显示到页面
function showContent(item){
    // 头部幻灯
    // 标题
    $("#content").append("<div class='title'>"+item.title+"</div>");
    // 内容详情，当前显示图片列表
    for(var i=0;i<item.images.length;i++){
        $("#content").append("<div><img src='" + item.images[i] + "' width='100%'/></div>");
    }

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
