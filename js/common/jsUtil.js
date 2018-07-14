/**
 * 
 */
Date.prototype.Format = function (fmt) {
    var o = {
        "y+": this.getFullYear(), //年份
        "M+": this.getMonth() + 1, //月份 
        "d+": this.getDate(), //日 
        "H+": this.getHours(), //小时 
        "m+": this.getMinutes(), //分 
        "s+": this.getSeconds(), //秒 
        "q+": Math.floor((this.getMonth() + 3) / 3), //季度 
        "S": this.getMilliseconds() //毫秒 
    };
    if (/(y+)/.test(fmt)) fmt = fmt.replace(RegExp.$1, (this.getFullYear() + "").substr(4 - RegExp.$1.length));
    for (var k in o)
    if (new RegExp("(" + k + ")").test(fmt)) fmt = fmt.replace(RegExp.$1, (RegExp.$1.length == 1) ? (o[k]) : (("00" + o[k]).substr(("" + o[k]).length)));
    return fmt;
};
Array.prototype.indexOf = function(val) {
    for (var i = 0; i < this.length; i++) {
        if (this[i] == val) return i;
    }
    return -1;
};
Array.prototype.remove = function(val) {
    var index = this.indexOf(val);
    if (index > -1) {
        this.splice(index, 1);
    }
};

/***
 * 根据传入的格式化参数格式化参数
 * @param cellvalue 时间戳
 * @param pattern  格式化格式
 * @returns {*}
 */
function timeFormatByUser(cellvalue, pattern) {
    if (pattern == undefined) {
        pattern = "yyyy-MM-dd HH:mm:ss";
    }
    return new Date(cellvalue).Format(pattern);
}
//获取模板内容
function getTemplateHtml(url,callback) {
    $(document.body).append("<div class='tempTemplate' style='display: none'></div>");
    $(".tempTemplate").load(url,function (response, status, xhr) {
        if(status=="success")
        {
            callback(response);
        }
        else
            callback("");
        $(".tempTemplate").remove()

    });

}
//拖动div
var divMove = ({
    init:function($div){
        /* 绑定鼠标左键按住事件 */
        $div.bind("mousedown",function(event){
            /* 获取需要拖动节点的坐标 */
            // $(this).css("cursor","move");
            var offset_x = $(this)[0].offsetLeft;//x坐标
            var offset_y = $(this)[0].offsetTop;//y坐标
            /* 获取当前鼠标的坐标 */
            var mouse_x = event.pageX;
            var mouse_y = event.pageY;
            /* 绑定拖动事件 */
            /* 由于拖动时，可能鼠标会移出元素，所以应该使用全局（document）元素 */
            $(document).bind("mousemove",function(ev){
                /* 计算鼠标移动了的位置 */
                var _x = ev.pageX - mouse_x;
                var _y = ev.pageY - mouse_y;
                /* 设置移动后的元素坐标 */
                var now_x = (offset_x + _x ) + "px";
                var now_y = (offset_y + _y ) + "px";
                /* 改变目标元素的位置 */
                $div.css({
                    top:now_y,
                    left:now_x
                });
            });
        });
        /* 当鼠标左键松开，接触事件绑定 */
        $(document).bind("mouseup",function(){
            $(this).unbind("mousemove");
        });
    }
});

/*获取url参数*/
function getUrlParam(name) {
    var reg = new RegExp("(^|&)" + name + "=([^&]*)(&|$)"); // 构造一个含有目标参数的正则表达式对象
    var r = window.location.search.substr(1).match(reg); // 匹配目标参数
    if (r != null)
        return decodeURIComponent(r[2]);
    return null; // 返回参数值
};




