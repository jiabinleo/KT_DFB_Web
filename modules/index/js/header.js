$(function () {
    $(".weather-box-place").html(" 梅州&nbsp;&nbsp;&nbsp;");
    $(".weather-box-weather").text("晴");
    $(".location-icon").parent().click(function () {

    });
    $(".home-icon").parent().click(function () {
        backToDefaultView()
    });
    $(".map-icon").parent().click(function () {
        switchToAdministrativeDivisionsLayer();
        morphTo2D();
    });
    $(".satellite-map-icon").parent().click(function () {
        switchToImageLayer();
        morphTo3D();
    });
//    洪水水淹
    /*$("#calculus-analysis-dropdown li").click(function () {
        var contactid = 'popout-flood',
            img = 'flood_icon',
            name = '洪水水淹';
        barClick.fadeInPop(contactid);
        popoOutList.appendLi(img,name,contactid);
    });*/
//    标绘工具
    $(".gongju-icon").parent().click(function () {
        var contactid = 'popout-plotting',
            img = 'bhgj_icon',
            name = '标绘工具';
        barClick.fadeInPop(contactid);
        popoOutList.appendLi(img,name,contactid);
        mappolt.init();
    });
//    落区管理
    $(".luoqu-icon").parent().click(function () {
        dropAreaMan.init();
        var contactid = 'popout-dropArea',
            img = 'luoqu_icon',
            name = '落区管理';
        barClick.fadeInPop(contactid);
        popoOutList.appendLi(img,name,contactid);
    });

});
setInterval(function(){$(".weather-box-date").html(getExactDate)},1000);
function getExactDate() {
    var mydate = new Date(),data='';
    var Week = ['日','一','二','三','四','五','六'];
    data += mydate.getFullYear()+'年'; //获取完整的年份(4位,1970-????)
    data += mydate.getMonth()+1+'月'; //获取当前月份(0-11,0代表1月)
    data += mydate.getDate()+'日&nbsp;&nbsp;&nbsp;'; //获取当前日(1-31)
    data += '星期'+Week[mydate.getDay()]+'&nbsp;&nbsp;&nbsp;'; //获取当前星期X(0-6,0代表星期天)
    data += mydate.getHours()>9?mydate.getHours()+':':'0'+mydate.getHours()+':'; //获取当前小时数(0-23)
    data += mydate.getMinutes()>9?mydate.getMinutes()+':':'0'+mydate.getMinutes()+':'; //获取当前分钟数(0-59)
    data += mydate.getSeconds()>9?mydate.getSeconds()+'&nbsp;&nbsp;&nbsp;':'0'+mydate.getSeconds()+'&nbsp;&nbsp;&nbsp;'; //获取当前秒数(0-59)
    return data;
}
