
var sysConfig =
    {
        //请求后台服务地址服务地址
        header: "http://14.116.184.77:8098",
		// header: "http://192.168.1.240:8080",
        img: 'http://192.168.2.13:8082/small',
        //影像地图服务
        imageMapurl: "http://202.104.132.66:9000/geoserver/gwc/service/wms",
        imageMapname: "SZ:IMG",
        //电子地图服务
        regionMapurl: "http://202.104.132.66:9000/geoserver/gwc/service/wms",
        regionMapname: "SZ:IMG",

        //高层服务地址
        DEMUrl: "http://202.104.132.66:9000/sz_terrain",

        //默认视野（初始显示范围） 参数顺序中心经度，中心纬度，视角高度(米）
        defaultCameraView: [114.17,22.63, 200000],


        flyToHight: 200000,//鹰眼图定位主地图的高度

    };

//一些基础请求数据
var basicData={};



/*解决跨域问题*/
$.ajaxSetup({
    contentType: "application/x-www-form-urlencoded;charset=utf-8",
    success: function (result, status, xhr) {
    },
    beforeSend: function (xhr, settings) {
    },
    xhrFields: {
        withCredentials: true
    }
});


//元素的拖拽

//拖动的函数 参数是被拖动的目标元素
function drag(ele) {

    //鼠标键按下 开启跟随
    ele.onmousedown = function (event) {
        event = event || window.event;  //解决IE8的兼容性问题

        //当前鼠标的距离文档的坐标
        var top = getPageY(event);
        var left = getPageX(event);

        //相对于所点击的元素的左上角的点
        var offsetX = event.offsetX;
        var offsetY = event.offsetY;

        //跟随
        moveWithMe(ele, offsetX, offsetY);

        //禁止默认行为
        return false;
    };

    //鼠标抬起
    ele.onmouseup = function (event) {
        //所谓的甩掉，不要再跟随
        doNotmoveWithMe();
    };

    //所谓跟随，就是根据鼠标当前的位置不断地 进行重绘
    function moveWithMe(ele, offsetX, offsetY) {
        var html = document.documentElement;
        html.onmousemove = function (event) {
            event = event || window.event;

            //获得当前鼠标的位置
            var top = getPageY(event);
            var left = getPageX(event);
            // 决定绘制 div 的位置
            top = top - offsetY;
            left = left - offsetX;

            //重新绘制 div
            ele.style.top = top + 'px';
            ele.style.left = left + 'px';
        }
    }

    function doNotmoveWithMe(ele) {
        var html = document.documentElement;
        html.onmousemove = null;
    }
}



















