// 文档加载完毕后执行
$(document).ready(function ()
{
    //获取数据保护：通过sohu接口直接得到所在城市信息，有可能无法得到，使用默认值
    if(typeof(returnCitySN)!="undefined"){
        //returnCitySN = {"cip": "110.184.65.88", "cid": "510100", "cname": "四川省成都市"};
        //获取用户位置
        getUserLocation();
    }
    //根据屏幕大小计算字体大小
    const oHtml = document.getElementsByTagName('html')[0]
    const width = oHtml.clientWidth;
    var rootFontSize = 12 * (width / 1440);// 在1440px的屏幕基准像素为12px
    rootFontSize = rootFontSize <8 ? 8:rootFontSize;//最小为8px
    rootFontSize = rootFontSize >16 ? 16:rootFontSize;//最大为18px
    oHtml.style.fontSize = rootFontSize+ "px";
    //计算图片流宽度：根据屏幕宽度计算，最小显示2列
    if(width < 2*columnWidth){//如果屏幕不能并排2列，则调整图片宽度
        columnWidth = (width-columnMargin*4)/2;//由于每一个图片左右均留白，故2列有4个留白
    }
    var args = getQuery();//获取参数
    $('#waterfall').NewWaterfall({
        width: columnWidth,
        delay: 100,
    });
    category = args["category"]?args["category"]:0; //如果是跳转，需要获取当前目录
    tagging = args["keyword"]?args["keyword"]:""; //通过搜索跳转
    filter = args["filter"]?args["filter"]:""; //根据指定类型进行过滤
    if(tagging.trim().length>0){
        $(".search input").attr("placeholder"," "+tagging);
        $(".search input").val(tagging);
    }
    loadCategories(category);//加载导航目录
    $(document).keydown(function(event){//注册搜索事件：回车搜索全部
        if(event.keyCode==13){
            tagging = $(".search input").val().trim();
            window.location.href="index.html?keyword="+tagging;
        }
    });
    $("#findAll").click(function(){//注册搜索事件：点击搜索全部
        tagging = $(".search input").val().trim();
        window.location.href="index.html?keyword="+tagging;
    }); 
    $("#findByPrice").click(function(){//注册搜索事件：点击搜索好价
        tagging = $(".search input").val().trim();
        window.location.href="index.html?filter=byPrice&keyword="+tagging;
    });  
    $("#findByDistance").click(function(){//注册搜索事件：点击搜索附近
        tagging = $(".search input").val().trim();
        window.location.href="index.html?filter=byDistance&keyword="+tagging;    	
    }); 
    $("#findByScore").click(function(){//注册搜索事件：点击搜索好物
        tagging = $(".search input").val().trim();
        window.location.href="index.html?filter=byScore&keyword="+tagging;
    });    

    //注册copy监听事件：注意需要在内部处理触发节点
    document.addEventListener('copy',copyItem);

});

var pendingCopyItem = "";

var columnWidth = 300;//默认宽度300px
var columnMargin = 5;//默认留白5px

var loading = false;
var dist = 500;
var num = 1;//需要加载的内容下标

var items = [];//所有内容列表
var category  = 0; //当前目录ID
var tagging = ""; //当前目录关联的查询关键词，搜索时直接通过该字段而不是category进行
var filter = "";//通过filter区分好价、好物、附近等不同查询组合

var page = {
    size:20,//每页条数
    total:1,//总页数
    current:-1//当前翻页
};

var esQuery={
    from:0,
    size:page.size,
    query: {
        match_all: {}
    },
    sort: [
        { "@timestamp": { order: "desc" }},
        { "_score":   { order: "desc" }}
    ]
};

var esQueryByPrice={
  from:0,
  size:page.size,
  query: {
    function_score: {
      query: {
        match_all: {}
      },
      script_score: {
        script: "double discount=0;try{discount=doc['price.sale'].value/(doc['price.sale'].value+0.01);}catch(Exception ex){discount=0;} return 1+discount;"
      },
      boost_mode: "multiply"
    }
  },
    sort: [
        { "_score":   { "order": "desc" }},
        { "@timestamp": { "order": "desc" }}
    ]
};

function getQueryByDistance(lat=30.671479,lon=104.072331){//默认开始搜索地点为成都市，需要替换为用户地址
	var esQueryByDistance={
	  from:0,
	  size:page.size,
	  query: {
	    function_score: {
	      query: {
	        match_all: {}
	      },
	      functions: [
	        {
	          gauss: {
	            location: { 
	              origin: { "lat": lat, "lon": lon },//使用起始地址填充
	              offset: "3km",
	              scale:  "2km"
	            }
	          }
	        }
	      ],
	      boost_mode: "multiply"
	    }
	  },
	    sort: [
	        { "_score":   { "order": "desc" }},
	        { "@timestamp": { "order": "desc" }}
	    ]
	};
	return esQueryByDistance;
}

function getUserLocation(){
	console.log("trying to update user location.",returnCitySN);
	// 创建地址解析器实例
	var myGeo = new BMap.Geocoder();
	// 将地址解析为经纬度
	myGeo.getPoint(returnCitySN.cname, function(point){
		if (point) {
			console.log("got detailed location.",point);
			updateUserLocation(point);
		}else{
		console.log("您选择地址没有解析到结果!",returnCitySN);
		}
	}, "成都市");	
}

function updateUserLocation(position){//注意，由于无登录用户检查，只需要更新本地信息
	console.log("trying to update user location.",position);
	//更新到本地cookie，供后续使用
	xcookie.set("lat",position.lat,100);
	xcookie.set("lon",position.lng,100);
}

setInterval(function ()
{
    if ($(window).scrollTop() >= $(document).height() - $(window).height() - dist && !loading)
    {
        // 表示开始加载
        loading = true;

        // 加载内容
        if(items.length < num){//如果内容未获取到本地则继续获取
            loadItems();
        }else{//否则使用本地内容填充
            insertItem();
        }
    }
}, 60);

function loadItems(){//获取内容列表
    var q={
        match: { 
          full_text:"" 
        }
    };    
    if(filter.trim()=="byPrice" || filter.trim()=="byScore"||filter.trim()=="byDistance"){//需要进行过滤
        if(filter.trim()=="byPrice"){
            esQuery = esQueryByPrice;
        }else if(filter.trim()=="byScore"){
            
        }else if(filter.trim()=="byDistance"){
        	var currentLocation = {
        		lat:xcookie.get('lat')?parseFloat(xcookie.get('lat')):30.671479,
        		lon:xcookie.get('lon')?parseFloat(xcookie.get('lon')):104.072331
        	}
        	console.log("try to search around current location.",currentLocation);
            esQuery = getQueryByDistance(currentLocation.lat,currentLocation.lon);
        }
        if(tagging.trim().length>0){//使用指定内容进行搜索
            q.match.full_text = tagging;
            esQuery.query.function_score.query = q;
        }
    }else{//无过滤
        if(tagging.trim().length>0){//使用指定内容进行搜索
            q.match.full_text = tagging;
            esQuery.query = q;
        }else{//搜索全部
            esQuery.query = {
                match_all: {}
            };
        }
    }
    //处理翻页
    esQuery.from = (page.current+1) * page.size;

    $.ajax({
        url:"https://data.pcitech.cn/stuff/_search",
        type:"post",
        data:JSON.stringify(esQuery),//注意：nginx启用CORS配置后不能直接通过JSON对象传值
        headers:{
            "Content-Type":"application/json",
            "Authorization":"Basic ZWxhc3RpYzpjaGFuZ2VtZQ=="
        },
        crossDomain: true,
        success:function(data){
            if(data.hits.hits.length==0){//如果没有内容，则显示提示文字
                showNoMoreMsg();
            }else{
                //更新总页数
                var total = data.hits.total;
                page.total = (total + page.size - 1) / page.size;
                //更新当前翻页
                page.current = page.current + 1;
                //装载具体条目
                var hits = data.hits.hits;
                for(var i = 0 ; i < hits.length ; i++){
                    items.push(hits[i]._source);
                }
                insertItem();
            }
        }
    })
}

/*
function loadItems(){//获取内容列表
    $.ajax({
        url:"https://data.shouxinjk.net/_db/sea/my/stuff",
        type:"get",
        data:{offset:items.length,size:20,category:category},
        success:function(data){
            if(data.length==0){//如果没有内容，则显示提示文字
                showNoMoreMsg();
            }else{
                for(var i = 0 ; i < data.length ; i++){
                    items.push(data[i]);
                }
                insertItem();
            }
        }
    })
}
//*/

//将item显示到页面
function insertItem(){
    // 加载内容
    var item = items[num-1];
    var imgWidth = columnWidth-2*columnMargin;//注意：改尺寸需要根据宽度及留白计算，例如宽度为360，左右留白5，故宽度为350
    var imgHeight = random(50, 300);//随机指定初始值
    //计算图片高度
    var img = new Image();
    img.src = item.images?item.images[0]:"https://www.biglistoflittlethings.com/list/images/logo00.jpeg";
    var orgWidth = img.width;
    var orgHeight = img.height;
    imgHeight = orgHeight/orgWidth*imgWidth;
    //计算文字高度：按照1倍行距计算
    //console.log("orgwidth:"+orgWidth+"orgHeight:"+orgHeight+"width:"+imgWidth+"height:"+imgHeight);
    var image = "<img src='"+item.images[0]+"' width='"+imgWidth+"' height='"+imgHeight+"'/>"
    //var title = "<span class='title'><a href='info.html?category="+category+"&id="+item._key+"'>"+item.title+"</a></span>"
    var title = "<div class='title'>"+item.title+"</div>"
    $("#waterfall").append("<li><div id='"+item._key+"' data='"+item._key+"'>" + image +title+ "</div></li>");
    num++;

    //注册事件
    $("div[data='"+item._key+"']").click(function(e){
        //跳转到详情页
        //window.location.href = "info.html?category="+category+"&id="+item._key;
        //just for test: 拷贝Item到剪贴板，便于后续粘贴
        //copyItem(item._key);
        console.log("trigger copy event");
        //修改当前选中item
        pendingCopyItem = item._key;
        document.execCommand("copy");//触发拷贝事件
    }); 

    // 表示加载结束
    loading = false;
}

//test
function copyItem(event){
    console.log("start copy item.[itemKey]"+pendingCopyItem,event);
    event.preventDefault();//阻止默认行为
    var temp = document.getElementById(pendingCopyItem).outerHTML;
    console.log("html copied.[itemKey]"+pendingCopyItem,temp);
    event.clipboardData.setData('text/html', temp);
     
}

//当没有更多item时显示提示信息
function showNoMoreMsg(){
    //todo：显示没有更多toast
    /*
    $.toast({
        heading: 'Success',
        text: '没有更多了',
        showHideTransition: 'fade',
        icon: 'info'
    });   
    //*/
    $("#footer").toggleClass("footer-hide",false);
    $("#footer").toggleClass("footer-show",true);
}

// 自动加载更多：此处用于测试，动态调整图片高度
function random(min, max)
{
    return min + Math.floor(Math.random() * (max - min + 1))
}

function loadCategories(currentCategory){
    $.ajax({
        url:"https://data.shouxinjk.net/_db/sea/category/categories",
        type:"get",
        success:function(msg){
            var navObj = $(".navUl");
            for(var i = 0 ; i < msg.length ; i++){
                navObj.append("<li data='"+msg[i]._key+"' data-tagging='"+(msg[i].tagging?msg[i].tagging:"")+"'>"+msg[i].name+"</li>");
                if(currentCategory == msg[i]._key){//高亮显示当前选中的category
                    $(navObj.find("li")[i]).addClass("showNav");
                    tagging = msg[i].tagging;
                }
            }
            //注册点击事件
            navObj.find("li").click(function(){
                var key = $(this).attr("data");
                var tagging = $(this).attr("data-tagging");
                changeCategory(key,tagging);//更换后更新内容
                $(navObj.find("li")).removeClass("showNav");
                $(this).addClass("showNav");
            })
        }
    })    
}

function changeCategory(key,q){
    category = key;//更改当前category
    tagging = q;//使用当前category对应的查询更新查询字符串
    items = [];//清空列表
    $("#waterfall").empty();//清除页面元素
    num=1;//设置加载内容从第一条开始
    page.current = -1;//设置浏览页面为未开始
    loadItems();//重新加载数据
}


//cookie 操作封装
var xcookie = {  
    set:function(key,val,time){//设置cookie方法  
        var date=new Date(); //获取当前时间  
        var expiresDays=time;  //将date设置为n天以后的时间  
        date.setTime(date.getTime()+expiresDays*24*3600*1000); //格式化为cookie识别的时间  
        document.cookie=key + "=" + val +";expires="+date.toGMTString();  //设置cookie  
    },  
    get:function(key){//获取cookie方法  
        /*获取cookie参数*/  
        var cookies = document.cookie.replace(/[ ]/g,"");  //获取cookie，并且将获得的cookie格式化，去掉空格字符  
        var arrCookie = cookies.split(";")  //将获得的cookie以"分号"为标识 将cookie保存到arrCookie的数组中  
        var tips;  //声明变量tips  
        for(var i=0;i<arrCookie.length;i++){   //使用for循环查找cookie中的tips变量  
            var arr=arrCookie[i].split("=");   //将单条cookie用"等号"为标识，将单条cookie保存为arr数组  
            if(key==arr[0]){    //匹配变量名称，其中arr[0]是指的cookie名称，如果该条变量为tips则执行判断语句中的赋值操作  
                tips=arr[1];    //将cookie的值赋给变量tips  
                break;          //终止for循环遍历  
            }  
        }  
        return tips;  
    },  
    del:function(key){ //删除cookie方法  
         var date = new Date(); //获取当前时间  
         date.setTime(date.getTime()-10000); //将date设置为过去的时间  
         document.cookie = key + "=v; expires =" +date.toGMTString();//设置cookie  
    }  
};