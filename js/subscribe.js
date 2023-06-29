var client = "web";
// 文档加载完毕后执行
$(document).ready(function ()
{
    //根据屏幕大小判定是移动端还是桌面
    const oHtml = document.getElementsByTagName('html')[0]
    const width = oHtml.clientWidth;
    if(width<800){
       client = "wap";
    }
    var args = getQuery();//获取参数
    var id = args["id"]?args["id"]:0;

    //初始化AMIS
    initAmis();

});

//后端服务接口
var SX_API = "https://data.shouxinjk.net/ilife/a";
var SAAS_API = "https://air.biglistoflittlethings.com/rest-api";

//传递订阅套餐信息：
var price = 1; //注意：单位为分
var productId = "product001"; //套餐ID
var productName = "测试套餐"; //套餐名称

//获取租户ID
function getTenantId(){
    return -1; //获取租户ID，默认为-1，后端自动建立
}

/**
 * 根据out_trade_no检查支付状态
 * 采用计时器在显示支付二维码之后开始循环检查。获取检查结果后显示提示信息并关闭抽屉
 */
let paycheckTimer = null;
let paycheckInterval = 1200;
let paycheckIntervalCount = 15 * 60 * 1000 / paycheckInterval; //倒计时15分钟，超出则取消
function checkPayResult ( out_trade_no ) {
  console.log("try check pay result by out_trade_no.",out_trade_no);
  //开始一个计时器
  paycheckTimer = setInterval(function(){
      console.log("try check pay result by out_trade_no.",out_trade_no, new Date().getTime());
      if(paycheckIntervalCount<0){
        console.log("timeout cancel interval.");
        clearInterval(paycheckTimer);
        paycheckTimer = null;
        return;
      }

        $.ajax({
            url: SX_API + "/wxPay/rest/pay-result/"+out_trade_no,
            type:"post",
            data:{},
            success:function(res){
                console.log("got pay result.",res);
                if(res.data && res.data.success && res.data.data && res.data.data.tradeState==="SUCCESS"){
                  clearInterval(paycheckTimer);
                  paycheckTimer = null;
                  //提示已经获取支付结果
                  console.log("todo close drawer and show tips.");
                  //通过触发按钮事件完成
                  let amisBtn = document.querySelector('.__sx__btn__closeDialog>span');
                  if(amisBtn){
                    amisBtn.click();
                  }
                }
            }
        })

      paycheckIntervalCount--;
    }, paycheckInterval);

}

//建立订阅记录
function createPkgSubscritpionRecord ( out_trade_no, salePackageId, subscribeType ) {
    console.log("try add pkg subscription.",out_trade_no, salePackageId, subscribeType);
    let effectiveDate = new Date();//默认当前日期开始
    let expireDate = new Date().setFullYear(effectiveDate.getFullYear()+1);


        $.ajax({
            url: SAAS_API + "/erp/subscription/add",
            type:"post",
            data: {
              id: out_trade_no,
              tenantId: getTenantId(),
              tradeNo: out_trade_no,
              salePackageId: salePackageId,
              subscribeType: subscribeType,
              effectiveOn: effectiveDate,
              expireOn: expireDate,
            },
            headers: {}, //TODO：需要取消身份认证
            success:function(res){
                console.log("got pay result.",res);
                if(res.data && res.data.success && res.data.data && res.data.data.tradeState==="SUCCESS"){
                  clearInterval(paycheckTimer);
                  paycheckTimer = null;
                  //提示已经获取支付结果
                  console.log("todo close drawer and show tips.");
                  //通过触发按钮事件完成
                  let amisBtn = document.querySelector('.__sx__btn__closeDialog>span');
                  if(amisBtn){
                    amisBtn.click();
                  }
                }
            }
        })
  
  }


function initAmis(){
    let amis = amisRequire('amis/embed');
    // 通过替换下面这个配置来生成不同页面
    let amisJSON = {
          "type": "page",
          "title": "注册与订阅",
          "data":{
            "qrcode":"images/qrcode.jpg",
            "price": price,
            "id": productId,
            "name": productName,
          },
          "body": [
            {
              "type": "wizard",
              "steps": [
                {
                  "title": "扫码登录",
                  "body": [
                    {
                      "type": "flex",
                      "className": "p-1",
                      "items": [
                        {
                          "type": "container",
                          "body": [
                          ],
                          "size": "xs",
                          "style": {
                            "position": "static",
                            "display": "block",
                            "flex": "1 1 auto",
                            "flexGrow": 1,
                            "flexBasis": "auto"
                          },
                          "wrapperBody": false,
                          "isFixedHeight": false,
                          "isFixedWidth": false,
                          "id": "u:fb33164c79c8"
                        },
                        {
                          "type": "container",
                          "className": "text-center",
                          "body": [
                            {
                              "type": "tpl",
                              "tpl": "打开微信扫码关注",
                              "className": "text-center",
                            }
                          ],
                          "size": "md",
                          "wrapperBody": false,
                          "isFixedHeight": false,
                          "isFixedWidth": false,
                          "id": "u:d68b6d747179"
                        },
                        {
                          "type": "container",
                          "body": [
                          ],
                          "size": "xs",
                          "style": {
                            "position": "static",
                            "display": "block",
                            "flex": "1 1 auto",
                            "flexGrow": 1,
                            "flexBasis": "auto"
                          },
                          "wrapperBody": false,
                          "isFixedHeight": false,
                          "isFixedWidth": false,
                          "id": "u:15819eeec9d3"
                        }
                      ],
                      "style": {
                        "position": "relative"
                      },
                      "id": "u:5c08e705fed1"
                    },
                    {
                      "type": "flex",
                      "className": "p-1",
                      "items": [
                        {
                          "type": "container",
                          "body": [
                          ],
                          "size": "xs",
                          "style": {
                            "position": "static",
                            "display": "block",
                            "flex": "1 1 auto",
                            "flexGrow": 1,
                            "flexBasis": "auto"
                          },
                          "wrapperBody": false,
                          "isFixedHeight": false,
                          "isFixedWidth": false,
                          "id": "u:fb33164c79c8"
                        },
                        {
                          "type": "container",
                          "className": "text-center w-full",
                          "body": [
                            {
                              "type": "image",
                              "name": "qrcode",
                              "className": "text-center w-full",
                              "id": "u:6496d92e6f29"
                            }
                          ],
                          "size": "lg",
                          "wrapperBody": false,
                          "isFixedHeight": false,
                          "isFixedWidth": false,
                          "id": "u:d68b6d747179"
                        },
                        {
                          "type": "container",
                          "body": [
                          ],
                          "size": "xs",
                          "style": {
                            "position": "static",
                            "display": "block",
                            "flex": "1 1 auto",
                            "flexGrow": 1,
                            "flexBasis": "auto"
                          },
                          "wrapperBody": false,
                          "isFixedHeight": false,
                          "isFixedWidth": false,
                          "id": "u:15819eeec9d3"
                        }
                      ],
                      "style": {
                        "position": "relative"
                      },
                      "id": "u:9ddb631220d5"
                    }
                  ],
                  "id": "u:bc51bddf9e00",
                  "mode": "normal"
                },
                {
                  "title": "填写信息",
                  "body": [
                    {
                      "type": "flex",
                      "className": "p-1",
                      "items": [
                        {
                          "type": "container",
                          "body": [
                          ],
                          "size": "xs",
                          "style": {
                            "position": "static",
                            "display": "block",
                            "flex": "1 1 auto",
                            "flexGrow": 1,
                            "flexBasis": "auto"
                          },
                          "wrapperBody": false,
                          "isFixedHeight": false,
                          "isFixedWidth": false,
                          "id": "u:fb33164c79c8"
                        },
                        {
                          "type": "container",
                          "body": [
                            {
                              "type": "input-text",
                              "label": "公司全称",
                              "name": "companyName",
                              "id": "u:09cf370008cd",
                              "required": true,
                              "placeholder": "请填写公司全称，个人请填写姓名"
                            },
                            {
                              "type": "input-text",
                              "label": "联系电话",
                              "name": "contactPhone",
                              "id": "u:3bd8cdecf974",
                              "required": true,
                              "placeholder": "请填写联系电话"
                            }
                          ],
                          "size": "xs",
                          "style": {
                            "position": "static",
                            "display": "block",
                            "flex": "1 1 auto",
                            "flexGrow": 1,
                            "flexBasis": "auto"
                          },
                          "wrapperBody": false,
                          "isFixedHeight": false,
                          "isFixedWidth": false,
                          "id": "u:d68b6d747179"
                        },
                        {
                          "type": "container",
                          "body": [
                          ],
                          "size": "xs",
                          "style": {
                            "position": "static",
                            "display": "block",
                            "flex": "1 1 auto",
                            "flexGrow": 1,
                            "flexBasis": "auto"
                          },
                          "wrapperBody": false,
                          "isFixedHeight": false,
                          "isFixedWidth": false,
                          "id": "u:15819eeec9d3"
                        }
                      ],
                      "style": {
                        "position": "relative"
                      },
                      "id": "u:8e7de29f283f"
                    }
                  ],
                  "mode": "normal",
                  "id": "u:2e34bf548d55"
                },
                {
                  "title": "微信支付",
                  "items": [
                    {
                      "type": "input-text",
                      "name": "var1",
                      "label": "文本"
                    }
                  ],
                  "mode": "normal",
                  "body": [
                    {
                      "type": "flex",
                      "className": "p-1",
                      "items": [
                        {
                          "type": "container",
                          "body": [
                          ],
                          "size": "xs",
                          "style": {
                            "position": "static",
                            "display": "block",
                            "flex": "1 1 auto",
                            "flexGrow": 1,
                            "flexBasis": "auto"
                          },
                          "wrapperBody": false,
                          "isFixedHeight": false,
                          "isFixedWidth": false,
                          "id": "u:fb33164c79c8"
                        },
                        {
                          "type": "container",
                          "body": [
{
                                "type": "page",
                                "className":"text-center items-center justify-center place-content-center   ",
                                "initApi": { //需要从服务器端获取授权链接
                                  "method": "POST",
                                  "url": SX_API+"/wxPay/rest/qrcode-url",  //获取微信支付二维码
                                  "convertKeyToPath": false, //重要：避免自动将key中带有.的键值转换为对象
                                  "replaceData": true,
                                  "autoRefresh": true,
                                  "requestAdaptor": function (api) { //需要根据搜索条件动态组织搜索Query
                                    let orgData = {...api.data}; //原有的数据，由于返回数据会装载到一起，不能直接作为搜索数据
                                    console.log("got current sale package.", orgData);
                                    //根据当前选中套餐构建二维码链接
                                    let out_trade_no = "sub"+ hex_md5(""+getTenantId()+orgData.id+""+(new Date().getTime())+""+Math.random()).substr(3);//购买虚拟豆: 总长度32位， 前三位ppt为购买阅豆
                                    let targetData = {
                                      out_trade_no:out_trade_no,
                                      total_fee:orgData.price,//单位为分
                                      decription:"订阅 "+orgData.name,
                                    };
                      
                                    //提交一条空白订阅记录，待支付完成后更新相应数据
                                    createPkgSubscritpionRecord(out_trade_no, orgData.id, "yearly");//默认为按年订阅
                
                                    //开始查询支付结果
                                    checkPayResult(out_trade_no);
                
                                    let postData = {
                                      ...api,
                                      data: targetData //使用组装后的查询条件
                                    };
                                    console.log("prepare post data.", postData);
                                    return postData;
                                  },
                                  "adaptor": function (payload, response) {
                                    console.log("got wechatpay qrcode url.", payload);
                                    if(payload.success){ //成功则显示
                                      return {
                                        msg: "",//payload.message,
                                        data: {
                                          "text": "微信扫码支付",
                                          "summary": "",
                                          "url": payload.data,//使用默认的第三方平台应用APPID
                                        },
                                        status: 0,//payload.success?0:1
                                      };
                                    }else{
                                      return { //否则显示空白
                                        msg: "",
                                        data: {
                                          "text": "",
                                          "summary": "",
                                          "url": "#",//
                                          "style":"display:none",
                                        },
                                        status: 0,//payload.success?0:1
                                      };
                                    }
                                  },
                                  "data":{
                                    "price": "${price}", //传递价格：单位为分
                                    "id": "${id}", //当前选中阅豆产品ID
                                    "name":"${name}", //当前选中产品名称
                                    "&":"$$" //传递搜索表单数据
                                  }
                                },
                                "body":[
                                  { //显示购买内容
                                    "type": "tpl",
                                    "tpl": "订阅${name}<br/>￥${price*0.01}<br/>&nbsp;"
                                  },
                                  {
                                    "type": "qr-code",
                                    "className":"mx-38",
                                    "codeSize": 128,
                                    "value": "${url}"
                                  },
                                  { //购买提示
                                    "type": "tpl",
                                    "tpl": "<br/>打开微信扫码付款"
                                  },
                                ]
                                
                              }
                          ],
                          "size": "xs",
                          "style": {
                            "position": "static",
                            "display": "block",
                            "flex": "1 1 auto",
                            "flexGrow": 1,
                            "flexBasis": "auto"
                          },
                          "wrapperBody": false,
                          "isFixedHeight": false,
                          "isFixedWidth": false,
                          "id": "u:d68b6d747179"
                        },
                        {
                          "type": "container",
                          "body": [
                          ],
                          "size": "xs",
                          "style": {
                            "position": "static",
                            "display": "block",
                            "flex": "1 1 auto",
                            "flexGrow": 1,
                            "flexBasis": "auto"
                          },
                          "wrapperBody": false,
                          "isFixedHeight": false,
                          "isFixedWidth": false,
                          "id": "u:15819eeec9d3"
                        }
                      ],
                      "style": {
                        "position": "relative"
                      },
                      "id": "u:090c12708984"
                    }
                  ]
                }
              ],
              "id": "u:75caf903e5e4",
              "mode": "horizontal"
            }
          ],
          "id": "u:c7d09bcd1d4e",
          "pullRefresh": {
            "disabled": true
          },
          "regions": [
            "body"
          ]
        };
    let amisScoped = amis.embed('#root', amisJSON);
}


function jump(id){//获取详细内容
    $.ajax({
        url:"https://data.shouxinjk.net/_db/sea/my/stuff/"+id,
        type:"get",
        data:{},
        success:function(item){
            logstash(item,client,"buy step2",function(){
                if(client == "wap"){
                    window.location.href=item.link.wap2?item.link.wap2:item.link.wap;
                }else{
                    window.location.href=item.link.web2?item.link.web2:item.link.web;
                }
                
            });
        }
    })            
}
