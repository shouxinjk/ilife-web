// 文档加载完毕后执行
$(document).ready(function ()
{
    var args = getQuery();//获取参数
    var id = args["id"]?args["id"]:0;
    jump(id);
});

function jump(id){//获取详细内容
    $.ajax({
        url:"https://data.shouxinjk.net/_db/sea/my/stuff/"+id,
        type:"get",
        data:{},
        success:function(item){
            log(item);
        }
    })            
}

function log(item){//记录日志
    var target = item.url2?item.url2:item.url;
    var type = item.url2?"processed":"original";
    var data = {
        records:[{
            value:{
                action:"view",
                item:item._key,
                title:item.title,
                url:{
                    type:type,
                    target:target
                },
                timestamp:new Date()
            }
        }]
    };
    console.log("$.support.cors",$.support.cors);
    $.ajax({
        url:"http://kafka-rest.shouxinjk.net/topics/test",
        type:"post",
        data:JSON.stringify(data),//注意：不能使用JSON对象
        headers:{
            "Content-Type":"application/vnd.kafka.json.v2+json",
            "Accept":"application/vnd.kafka.v2+json"
        },
        success:function(result){
            //console.log(result);
            window.location.href = item.url2?item.url2:item.url;
        }
    })            
}