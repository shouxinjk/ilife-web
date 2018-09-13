// 文档加载完毕后执行
$(document).ready(function ()
{
    var args = getQuery();
    var category = args["category"]; //当前目录
    var id = args["id"];//当前内容
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
    $("#content").append("<div>"+item.title+"</div>");
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
