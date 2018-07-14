
var barClick = {
    init: function () {
       // barClick.bottomTollbarClick();
       barClick.leftTollbarClick();
       barClick.submenuClick();
       barClick.menuBarPackup();
    },
    /*bottomTollbarClick: function () {
        $(".toolbar-box-li").click(function () {
            $(this).addClass("active");
            $(this).siblings().removeClass("active");
            //    就进行相应操作，比如弹出弹框或者描点
            var id = $(this)[0].id;
            switch (id) {
                case "monitoring":
                    break;
                case "plotting":
                    var contactid = 'popout-plotting',
                        img = 'bhgj_icon',
                        name = '标绘工具';
                    barClick.fadeInPop(contactid);
                    popoOutList.appendLi(img,name,contactid);
                    break;
            }
        });
    },*/
    leftTollbarClick: function () {
        $(".bar-head-li").click(function () {
            $(this).toggleClass("active");
            $(this).siblings().removeClass("active");
            var id = $(this)[0].id;
            switch (id) {
                case "ad-division-btn":
                    var contactid = 'popout-region',
                        img = 'quhua_icon',
                        name = '行政区划';
                    barClick.fadeInPop(contactid);
                    popoOutList.appendLi(img,name,contactid);
                    break;

                case "base-data-btn":
                    var contactid = 'popout-base-data',
                        img = 'jbsj_icon',
                        name = '基本数据';
                    barClick.fadeInPop(contactid);
                    popoOutList.appendLi(img,name,contactid);
                    break;
                case "observ-btn":
                    $(".sub-real-time-observation").show();
                    $(".sub-real-time-observation").toggleClass("submenu-animate");
                    var btmHeight = $(".submenu-content").height();
                    $(".menu-bg2").css("height", btmHeight-104);
                    break;
                case "dept-info-btn":
                    break;
                case "calculus-analysis-btn":
                    $(".sub-calculus-analysis").show();
                    $(".sub-calculus-analysis").toggleClass("submenu-animate");
                    var btmHeight = $(".submenu-content").height();
                    $(".menu-bg2").css("height", btmHeight-104);
                    break;
                case "move-target-btn":
                    var contactid = 'popout-moveTarget',
                        img = 'mubiao_icon',
                        name = '移动目标';
                    barClick.fadeInPop(contactid);
                    popoOutList.appendLi(img,name,contactid);
                    // movingTarget.listLength("trace-content-list");
                    break;
                case "video-surve-btn":
                    var contactid = 'popout-video',
                        img = 'jiankong_icon',
                        name = '视频监控';
                    barClick.fadeInPop(contactid);
                    popoOutList.appendLi(img,name,contactid);
                    break;
            }
            /*if(!$("#observ-btn").hasClass("bar-head-active")){
                $(".secondary-menu-box").hide();
            }*/
        })
    },
    submenuClick: function () {
        $(".submenu-content-li").click(function (e) {
            e.stopPropagation();
            $(this).addClass("active");
            $(this).siblings().removeClass("active");
            //    就进行相应操作，比如弹出弹框或者描点
            var id = $(this)[0].id;
            switch (id) {
                case "sub-zdz":
                    var contactid = 'popout-2',
                        img = 'zdz_icon',
                        name = '自动站';
                    barClick.fadeInPop(contactid);
                    popoOutList.appendLi(img,name,contactid);
                    break;
                case "sub-lda":
                    var contactid = 'popout-radar',
                        img = 'leida_icon',
                        name = '雷达';
                    barClick.fadeInPop(contactid);
                    popoOutList.appendLi(img,name,contactid);
                    break;
                case "sub-hshy":
                    var contactid = 'popout-flood',
                        img = 'flood_icon',
                        name = '洪水水淹';
                    barClick.fadeInPop(contactid);
                    popoOutList.appendLi(img,name,contactid);
                    break;
            }
        });

    },
    fadeInPop: function (id) {
        $(".show-hide").hide();
        $('.tworay-img').hide();
        if($(".popout-bg-box").is(':hidden')){
            $(".popout-bg-box").show();
            $(".pedestal-img").show();
            $('#'+id).fadeIn(500);
            $('.tworay-img').fadeIn(500);
        }
        else {
            $('#'+id).fadeIn(500);
            $('.tworay-img').fadeIn(500);
        }
    },
    menuBarPackup: function () {
        $(".toolbar-box-animate").click(function () {
            $(".bar-head-ul").slideToggle(800);
        })
    }
}
$(function () {
    barClick.init();
})
