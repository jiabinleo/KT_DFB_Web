/**
 * Created by administrotar on 2017/10/11.
 */


function overviewguid() {
    return 'xxxxxxxx-xxxx-4xxx-yxxx-xxxxxxxxxxxx'.replace(/[xy]/g, function (c) {
        var r = Math.random() * 16 | 0, v = c == 'x' ? r : (r & 0x3 | 0x8);
        return v.toString(16);
    });
}
(function (root, factory) {
    root.overview = factory();
}(window, function () {

    //鹰眼图的长宽
    var overviewHeight = sysConfig.overviewHeight, overviewwidth = sysConfig.overviewwidth;

    //鹰眼图的地址和中心点参数
    var mapurl = sysConfig.overviewMapurl;
    var layername = sysConfig.overviewMapName;
    var center = sysConfig.overviewCenter;
    var zoom = sysConfig.overviewZoom;


    var overview = {};
    //消息列表
    overview.msgdata = [];
    overview.msgtype = {
        alarm: "alarm",//观测告警
    }

    var head = document.getElementsByTagName('HEAD').item(0);
    var tstyle = document.createElement('link');
    tstyle.href = "../js/map/OverviewMap/OverView.css";
    tstyle.rel = 'stylesheet';
    tstyle.type = 'text/css';
    head.appendChild(tstyle);

    //表头显示列数
    overview.topcolcount = 2;

    //鹰眼图head
    function headinit() {
        var overviewTop = "";
        overviewTop += " <div class='overview_top '>";

        overviewTop += "<div  class='overview_top_time hide'>";
        overviewTop += " <div class='overview_top_title' >";
        overviewTop += "</div>";
        overviewTop += " <div class='overview_head' >";
        overviewTop += "</div>";
        overviewTop += " <div id='overview_time_body' class='overview_body'>";
        overviewTop += "</div>";
        overviewTop += " <div id='overview_time_page' class='overview_page'>";
        overviewTop += "</div>";
        overviewTop += "</div>";

        overviewTop += "<div  class='overview_top_region '>";
        overviewTop += " <div class='overview_top_title' >";
        overviewTop += "</div>";
        overviewTop += " <div class='overview_head' >";
        overviewTop += "</div>";
        overviewTop += " <div id='overview_region_body' class='overview_body'>";
        overviewTop += "</div>";
        overviewTop += " <div id='overview_region_page' class='overview_page'>";
        overviewTop += "</div>";
        overviewTop += "</div>";

        overviewTop += "<div  class='overview_top_type hide'>";
        overviewTop += " <div class='overview_top_title' >";
        overviewTop += "</div>";
        overviewTop += " <div class='overview_head' >";
        overviewTop += "</div>";
        overviewTop += " <div id='overview_type_body' class='overview_body'>";
        overviewTop += "</div>";
        overviewTop += " <div id='overview_type_page' class='overview_page'>";
        overviewTop += "</div>";
        overviewTop += "</div>";

        overviewTop += "</div>";
        $("#over_view_div").prepend(overviewTop);
        var title = "";
        title += "<div class='title_name'>标题</div>";
        title += "<div class='title_control'></div>";
        $(".overview_top_title").append(title)
        var headcontend = "";
        headcontend += "<div class='headleft'></div>"
        headcontend += "<div class='divul'></div>"
        headcontend += "<div class='headright'></div>"
        $(".overview_top  .overview_head").append(headcontend);

    }

    headinit();
    function contentinit() {
        var content = "<div class='overview_content tab-content'>";

        content += "<div id='overview_time' class='overview_time tab-pane fade'>";
        content += " <ul ></ul>";
        content += " </div>";

        content += "<div id='overview_region' class='kt_overviewmap overview_region tab-pane fade in active  '>";
        content += " <div id='kt_overMap'></div></div>";

        content += "<div id='overview_type' class='overview_type tab-pane fade'>";
        content += " <ul ></ul>";
        content += " <div ></div></div>";

        content += "</div>";
        $("#over_view_div").append(content);
    }

    contentinit();
    function bottominit() {
        var bottomlist = "";
        bottomlist += " <div class='overview_bottom'>";
        bottomlist += "   <ul>";
        bottomlist += "  <li id='li_time' name='overview_top_time' href='#overview_time' data-toggle='tab' class=''>时间<span></span></li>";
        bottomlist += "  <li id='li_region' name='overview_top_region' href='#overview_region' data-toggle='tab' class='active'>区域</li>";
        bottomlist += "  <li id='li_type' name='overview_top_type' href='#overview_type' data-toggle='tab' class=''>类型</li>";
        bottomlist += "   </ul>";
        bottomlist += "  </div>";

        $("#over_view_div").append(bottomlist);

    }

    bottominit();

    var control = "<div id='kt_overControl' class='kt_overviewmapShow' ></div>";

    $("#over_view_div").append(control);


    $(" #kt_overMap").css({
        //"margin": "2px",
        "height": "99%",
        "width": "99%"
    });
    $(".overview_content").css({
        "height": overviewHeight + "px",
        "width": overviewwidth + "px",
    });
    $('#overview_region').css({
        "height": overviewHeight + "px",
        "width": overviewwidth + "px",
    })
    $("#over_view_div").css({
        "width": overviewwidth + "px",
    });

    head.appendChild(tstyle);

    overview.getpageulcontent = function (data) {
        var list = "";
        var myDate = new Date(data.dataTime);
        var datastr = myDate.getDate() + "日" + myDate.getHours() + ":" + myDate.getMinutes();
        var level = data.level;
        list += "<ul>";

        list += "<li class='view_top_head '>" + datastr + "</li>";

        var content = "<span><img src='../images/map_icon/grade" + level + ".jpg'></span>";
        list += "<li class='view_top_head '>" + content + "</li>";
        list += "<li class='view_top_head hide' id='liid' >" + data.id + "</li>";
        list += "</ul>"
        return list;
    }
    overview.typePageCallBack = function (_data) {

        $("#overview_type_body").html("");
        for (var i = 0; i < _data.length; i++) {
            $("#overview_type_body").append(overview.getpageulcontent(_data[i]));
        }
    }
    overview.timePageCallBack = function (_data) {
        $("#overview_time_body").html("");
        for (var i = 0; i < _data.length; i++) {
            $("#overview_time_body").append(overview.getpageulcontent(_data[i]));
        }

    }
    overview.regionPageCallBack = function (_data) {
        $("#overview_region_body").html("");
        for (var i = 0; i < _data.length; i++) {
            $("#overview_region_body").append(overview.getpageulcontent(_data[i]));
        }
    }

    function overViewUiInit() {
        /*****top表头*****/
        function overviewTopHead() {
            var head = "";
            head += "<ul>";

            head += "<li class='view_top_head '>时间</li>";
            head += "<li class='view_top_head '>摘要</li>";
            head += "<li id='id' index='1' class='view_top_head hide'>ID</li>";
            head += "</ul>";

            $(".overview_top_time .divul").append(head);
            $(".overview_top_region .divul").append(head);
            $(".overview_top_type .divul").append(head);
        }

        overviewTopHead();

        /****表尾****/
        function overviewpage() {
            var pagesize = 8;
            overview.overview_time_page = new CustomPageination2("overview_time_page", pagesize, overview.timePageCallBack);
            var testdata = [];
            for (var i = 0; i < 20; i++) {
                var par = {
                    id: i,
                    time: new Date().getTime(),
                    type: overview.msgtype.alarm,
                    level: "4",
                    coordinate: [114.2, 30.5]

                }
                //testdata.push(par);
                //overview.msgdata.push(par);
            }
            //overview.overview_time_page.addData(testdata);

            overview.overview_region_page = new CustomPageination2("overview_region_page", pagesize, overview.regionPageCallBack);

            //overview.overview_region_page.addData(testdata);


            overview.overview_type_page = new CustomPageination2("overview_type_page", pagesize, overview.typePageCallBack);


        }

        overviewpage()
        /***** 时间面板*******/
        function overviewtimeinit() {

            var allli = "<li  id='timelitimeall'  class='lifirst'><img id='alluncheck' class='' src='../images/map_icon/selectalluncheck.png'>" +
                " <img id='allcheck' class='hide' src='../images/map_icon/selectallcheck.png'>全选</li>";
            $(".overview_time ul").append(allli);
            var allli = "<li  id='timeliInvert'  class='lifirst'><img id='reveruncheck' src='../images/map_icon/reverseuncheck.png'>" +
                "<img id='revercheck'  class='hide' src='../images/map_icon/reversecheck.png'>反选</li>";
            $(".overview_time ul").append(allli);
            var timelist = [];
            var curentday = -1;
            var arrlist = [];
            for (var j = -24; j < 0; j++) {
                arrlist.push(j);
            }

            for (var i = 0; i < arrlist.length; i++) {
                var newDate = new Date();
                newDate.setHours(newDate.getHours() + arrlist[i]);
                var des = newDate.getHours() + ":00";
                if (arrlist[i] == 0) {
                    des = "当前";
                }
                var cdate = newDate.getDate();
                if (cdate != curentday) {
                    curentday = cdate;
                    var tli = {
                        id: newDate.getDate(),
                        class: "li" + newDate.getDate() + " date",
                        des: newDate.getMonth() + 1 + "月" + cdate + "日",

                    }
                    timelist.push(tli);
                }
                var li = {
                    id: newDate.getDate() + "D" + newDate.getHours(),
                    class: "li" + newDate.getDate(),
                    des: des,
                    time: newDate.getTime()

                }
                timelist.push(li);
            }

            var newtime = [0, 1, 3, 6, 12, 24, 72];
            for (var i = 0; i < newtime.length; i++) {
                var newDate = new Date();
                newDate.setHours(newDate.getHours() + newtime[i]);
                var des = newDate.getHours() + ":00";
                if (newtime[i] == 0) {
                    des = "当前";
                }
                var cdate = newDate.getDate();
                var id = newDate.getDate() + "D" + newDate.getHours();
                var cl = "li" + newDate.getDate();
                if (cdate != curentday) {
                    des = cdate + "日" + newDate.getHours() + ":00";
                    cl = "li" + newDate.getDate() + " futuredate";
                }
                var li = {
                    id: id,
                    class: cl,
                    des: des,
                    time: newDate.getTime()

                }
                timelist.push(li);
            }
            for (var i = 0; i < timelist.length; i++) {
                var li = "<li class='timeli " + timelist[i].class + "' id='li" + timelist[i].id + "' ><span data='" + timelist[i].time + "'>" + timelist[i].des + "</span></li>";
                $(".overview_time ul").append(li);
            }

        }

        /*****类型*******/
        function overviewtypeinit() {
            //预警信号，观测告警，现场反馈，预测

            var typelist = [];
            typelist.push({id: "typewarning", des: "预警信号"});
            typelist.push({id: "typealert", des: "观测告警"});
            typelist.push({id: "typefeedback", des: "现场反馈"});
            typelist.push({id: "typeForecast", des: "预测"});

            var allli = "<li  id='typelitimeall'  class='typelifirst'><img id='alluncheck' class='' src='../images/map_icon/selectalluncheck.png'>" +
                " <img id='allcheck' class='hide' src='../images/map_icon/selectallcheck.png'>全选</li>";
            $(".overview_type ul").append(allli);
            var allli = "<li  id='typeliInvert'  class='typelifirst'><img id='reveruncheck' src='../images/map_icon/reverseuncheck.png'>" +
                "<img id='revercheck'  class='hide' src='../images/map_icon/reversecheck.png'>反选</li>";
            $(".overview_type ul").append(allli);

            for (var i = 0; i < typelist.length; i++) {
                var li = "<li class='typetimeli' id='li" + typelist[i].id + "' >";
                li+="<img  src='../images/map_icon/"+typelist[i].id+".png'>";
                 li+="<span data='" + typelist[i].id + "'>" + typelist[i].des + "</span>" ;
                 li+="</li>";
                $(".overview_type ul").append(li);
            }

        }

        overviewtimeinit();
        overviewtypeinit();

    }

    overViewUiInit();


    /***   事件    ***/
    $("#kt_overControl").click(function () {
        var isvis = $(".overview_bottom").is(':visible');
        $(this).siblings().toggle(500);
        if (!isvis) {
            $(this).removeClass("overview_inform_animation");
            $(this).removeClass("kt_overviewmapHide").addClass("kt_overviewmapShow");
        }
        else {
            if ($(".overview_push_animation").length > 0)
                $(this).addClass("overview_inform_animation");
            $(this).removeClass("kt_overviewmapShow").addClass("kt_overviewmapHide");
        }

    });
    $(".overview_bottom ul li").click(function () {
        $(this).addClass("active").siblings().removeClass("active");

        $("." + $(this).attr("name")).removeClass("hide").siblings().addClass("hide");
    });

    //时间标签选择
    $(".overview_time  ul li").click(function () {
        $(this).find('span').toggleClass("active");
        if (this.id == "timelitimeall") {
            $(this).find('img').toggleClass("hide");
            if ($(this).find('.hide').first()[0].id == "allcheck")
                $(".overview_time ul .timeli span").removeClass("active");
            else
                $(".overview_time ul .timeli span").addClass("active");

        }
        if (this.id == "timeliInvert") {
            $(this).find('img').toggleClass("hide");
            $(".overview_time ul .timeli span").toggleClass("active");
        }
        if ($(this).hasClass("date")) {
            var tid = this.id;
            if ($(this).find('span').first().hasClass("active"))
                $(".overview_time   ul ." + tid + " span").addClass("active");
            else
                $(".overview_time  ul ." + tid + " span").removeClass("active");
        }
        var slist = $(".overview_time ul .timeli span");
        overview.overview_time_page.removeAllData();
        var tlist = [];
        for (var i = 0; i < slist.length; i++) {
            var isactive = $(slist[i]).hasClass("active");
            if (isactive == false)
                continue;
            var attr = $(slist[i]).attr("data");
            if (!isNaN(attr))
                tlist.push(new Date(parseFloat(attr)));
        }
        var msglist = [];
        for (var i = 0; i < overview.msgdata.length; i++) {
            var timespan = overview.msgdata[i].dataTime;
            if (isNaN(timespan))
                continue
            var tdate = new Date(parseFloat(timespan));
            for (var j = 0; j < tlist.length; j++) {
                var cdate = tlist[j];
                if ((tdate.getDate() == cdate.getDate()) && (tdate.getHours() == cdate.getHours()))
                    msglist.push(overview.msgdata[i]);
            }
        }

        overview.overview_time_page.addData(msglist,true);
    });

    //类型标签选择
    $(".overview_type ul li").click(function () {
        $(this).find('span').toggleClass("active");
        if (this.id == "typelitimeall") {
            $(this).find('img').toggleClass("hide");
            if ($(this).find('.hide').first()[0].id == "allcheck")
                $(".overview_type ul .typetimeli span").removeClass("active");
            else
                $(".overview_type ul .typetimeli span").addClass("active");
        }
        if (this.id == "typeliInvert") {
            $(this).find('img').toggleClass("hide");
            $(".overview_type ul .typetimeli span").toggleClass("active");
        }
        $("#overview_type_body").html("");
        var slist = $(".overview_type ul .typetimeli span");
        overview.overview_type_page.removeAllData();
        for (var i = 0; i < slist.length; i++) {
            var isactive = $(slist[i]).hasClass("active");
            var attr = $(slist[i]).attr("data");
            if (isactive)
            {
                $(slist[i]).siblings("img").attr("src","../images/map_icon/"+attr+"active.png");
            }
            else
            {
                $(slist[i]).siblings("img").attr("src","../images/map_icon/"+attr+".png");
                continue;
            }

            switch (attr) {
                case "typewarning"://预警信号
                    break;
                case "typealert"://观测告警
                    overview.overview_type_page.addData(overview.msgdata,true);
                    break;
                case "typefeedback"://现场反馈
                    break;
                case "typeForecast"://预测
                    break;
            }
        }


    });

    $(".overview_body").on("click", "ul", function () {
        var id = $(this).find("#liid")[0].innerText;
        overview.sendMsgToMain(id);
        overview.removemsgdatabyid(id);
    });
    overview.classchanage = function (index, oldclass) {
        console.log(this);

    }

    $(".overview_top  .title_control").click(function () {
        $(this).toggleClass("active");
        $(".overview_head").toggle(500);
        $(".overview_body").toggle(500);
        $(".overview_page").toggle(500);
    });

    /**
     **表格左右翻页
     */
    overview.overviewtopheadturn = function (siblings, index) {
        for (var i = 0; i < siblings.length; i++) {
            if (i >= (index - 1) * overview.topcolcount && index * overview.topcolcount > i) {
                $(siblings[i]).removeClass("hide");
            }
            else
                $(siblings[i]).addClass("hide");
        }
    }

    $(".overview_head .headleft").click(function (ex) {
        var fistli = $(this).parent().find(".divul ul li:first-child");
        var index = parseInt(fistli.attr("index"));
        index = index - 1;
        if (index < 1) {
            return;
        }

        overview.overviewtopheadturn(fistli.siblings(), index);
        var bodyul = $(this).parent().siblings(".overview_body").find("ul");
        for (var i = 0; i < bodyul.length; i++) {
            var sibings = $(bodyul[i]).find("li:first-child").siblings();
            overview.overviewtopheadturn(sibings, index);
        }

        fistli.attr("index", index);

    });
    $(".overview_head .headright").click(function (ex) {
        var fistli = $(this).parent().find(".divul ul li:first-child");
        var index = parseInt(fistli.attr("index"));
        index = index + 1;
        var siblings = fistli.siblings();
        var pagecount = parseInt(siblings.length / overview.topcolcount) + 1;
        if (index > pagecount) {
            return;
        }

        overview.overviewtopheadturn(fistli.siblings(), index);
        var bodyul = $(this).parent().siblings(".overview_body").find("ul");
        for (var i = 0; i < bodyul.length; i++) {
            var sibings = $(bodyul[i]).find("li:first-child").siblings();
            overview.overviewtopheadturn(sibings, index);
        }

        fistli.attr("index", index);
    });


    //设置msglayer图层样式
    overview.msgStyleFunction = function (feature) {
        var type = feature.get("type");
        var tfill = new ol.style.Fill();
        var grade = feature.get("level");
        var color = 'rgba(255, 0, 0, 1)';
        switch (grade) {
            case "4":
                color = 'rgba(255, 0, 0, 1)';
                break;
            case "3":
                color = 'rgba(253, 116, 0, 1)';
                break;
            case "2":
                color = 'rgba(253, 204, 3, 1)';
                break;
            case "1":
                color = 'rgba(0, 0, 254, 1)';
                break;
        }
        tfill.setColor(color);
        var tstroke = new ol.style.Stroke({
            color: 'rgba(255, 255, 0, 0)',
            width: 0
        });
        var radius = 4, points = 4;

        var style = new ol.style.Style({
            image: new ol.style.RegularShape({
                radius1: radius,
                radius2: radius,
                points: points,
                fill: tfill,
                stroke: tstroke,
                angle: 0.785
            }),
            fill: new ol.style.Fill({
                color: [255, 0, 0, 0.8]
            }),
            stroke: new ol.style.Stroke({
                color: [255, 255, 0, 1],
                width: 1
            })
        });

        return style;
    };
    overview.view = null;
    overview.extentFeatrue = null;
    //定义基本图层
    var format = 'image/jpeg';
    var tiled = new ol.layer.Tile({
        source: new ol.source.TileWMS({
            url: mapurl,
            params: {
                'FORMAT': format,
                'VERSION': '1.1.1',
                tiled: true,
                LAYERS: layername,
            }
        })
    });

    //添加图层都地图中
    overview.view = new ol.View({
        projection: 'EPSG:4326',
        center: center,
        zoom: zoom,
    });
    overview.overMap = new ol.Map({
        controls: [],
        //interactions: [],
        //     interactions: ol.interaction.defaults().extend([new app.Drag(this)]),
        layers: [
            tiled
        ],
        target: 'kt_overMap',
        view: overview.view
    });


    //添加消息图层
    overview.msFeatrues = new ol.Collection();
    var msglayer = new ol.layer.Vector({
        source: new ol.source.Vector({
            features: overview.msFeatrues
        }),
        style: overview.msgStyleFunction
    });

    overview.overMap.addLayer(msglayer);


    //监控点
    overview.trackFeatrues = new ol.Collection();
    var tracklayer = new ol.layer.Vector({
        source: new ol.source.Vector({
            features: overview.trackFeatrues
        }),
        style: new ol.style.Style({
            image: new ol.style.Circle({
                fill: new ol.style.Fill({
                    color: 'rgba(0,255,0,0.5)'
                }),
                radius: 3,
                stroke: new ol.style.Stroke({
                    color: 'rgba(0,255,0,0.8)',
                    width: 1
                })
            })
        })
    });

    overview.overMap.addLayer(tracklayer);


    //鹰眼图地图初始显示范围
    var inintextent = [115.6282, 24.0508, 116.5137, 24.1630];
    var size = overview.overMap.getSize();
    var options = {
        size: size
    }
    //overview.view.fit(inintextent, options);


    overview.overMap.on('click', function (evt) {
        //receivemessages();
        var map = evt.map;
        var feature = map.forEachFeatureAtPixel(evt.pixel, function (feature) {
            return feature;
        });

        if (feature) {
            var id = feature.get("id");
            overview.sendMsgToMain(id);
            overview.removemsgdatabyid(id);

        }
    });

    //主地图大小发生变化请求
    overview.ChangeExtent = function (extent) {
        var newExent = ol.geom.Polygon.fromExtent(extent);
        if (overview.extentFeatrue.getLength() == 0)
            return;
        var feature = overview.extentFeatrue.item(0);
        feature.setGeometry(newExent);
    };


    //添加消息，事件，预警到鹰眼图
    overview.addPointmsgToOvermap = function (msgs) {
        for (var i = 0; i < msgs.body.length; i++) {
            var id = msgs.body[i].dataId;
            var coordinate = [msgs.body[i].lon, msgs.body[i].lat];
            var pt1 = new ol.geom.Point(coordinate);
            var feature1 = new ol.Feature();
            feature1.setGeometry(pt1);
            feature1.set("type", msgs.type);
            feature1.set("id", id);
            feature1.set("level", msgs.level.toString());
            feature1.set("content", JSON.stringify(msgs.body[i]));
            var _msg = {
                id: id,
                coordinate: coordinate,
                level: msgs.level,
                content: JSON.stringify(msgs.body[i]),
                msgtype: overview.msgtype.alarm,
                dataTime: msgs.body[i].dataTime
            };
            if (!overview.findmsgdatabyid(id))
                overview.adddatatomsgarray(_msg);
            if (!overview.findfeaturebyid(id))
                overview.msFeatrues.push(feature1);
            var lay = overview.overMap.getOverlayById(id)
            if (lay != null) continue;
            var point_div = document.createElement('div');
            point_div.className = "overview_push_animation";
            point_div.id = id;
            var point_overlay = new ol.Overlay({
                id: id,
                element: point_div,
                positioning: 'center-center',
                position: coordinate
            });
            overview.overMap.addOverlay(point_overlay);
            $("#" + id).click(overview.overlapClick);
        }
        overview.overview_region_page.addData([],true);
    };

    //添加多边形数据到
    overview.addPolygonMsgToOvermap = function (data) {
        var dataArray = JSON.parse(data.body.jsonData);
        //for (var i = 0; i < dataArray.length; i++) {
        //    var fea = overview.findfeaturebyCoordinate([dataArray[i]]);
        //    if (fea)
        //        continue;
        var id = data.body.dataId;
        var poly = new ol.geom.Polygon(dataArray);
        var feature1 = new ol.Feature();
        feature1.setGeometry(poly);
        feature1.set("id", id);
        feature1.set("level", data.level);
        if (!overview.findfeaturebyid(id))
            overview.msFeatrues.push(feature1);

        var point = poly.getInteriorPoint().getCoordinates();
        var _msg = {
            id: id,
            coordinate: point,
            level: data.level,
            content: JSON.stringify(data),
            msgtype: overview.msgtype.alarm,
            dataTime: data.body.dataTime
        };

        if (!overview.findmsgdatabyid(id))
            overview.adddatatomsgarray(_msg);
        var lay = overview.overMap.getOverlayById(id)
        if (lay != null) return;
        var point_div = document.createElement('div');
        point_div.className = "overview_push_animation";
        point_div.id = id;

        var point_overlay = new ol.Overlay({
            id: id,
            element: point_div,
            positioning: 'center-center',
            position: point
        });
        overview.overMap.addOverlay(point_overlay);
        $("#" + id).click(overview.overlapClick);
        //}
    };
    // overlap鼠标点击
    overview.overlapClick = function (evt) {
        var id = evt.target.id;
        var lay = overview.overMap.getOverlayById(id)
        overview.overMap.removeOverlay(lay);

        var fea = overview.findfeaturebyid(id);
        if (fea) {
            var gtype = fea.getGeometry().getType();
            var coordinate;
            if (gtype == "Polygon")
                coordinate = fea.getGeometry().getInteriorPoint().getCoordinates();
            else
                coordinate = fea.getGeometry().getCoordinates();
            var content = fea.get("content");

            overview.sendMsgToMain(id)
        }
    };
    overview.findfeaturebyid = function (id) {
        var arrays = overview.msFeatrues.getArray();
        for (var i = 0; i < arrays.length; i++) {
            var fea = arrays[i];
            if (fea.get("id") == id) {
                return fea;
            }
        }
        return null;
    };
    overview.findfeaturebyCoordinate = function (coordinate) {
        var arrays = overview.msFeatrues.getArray();
        for (var i = 0; i < arrays.length; i++) {
            var geom = arrays[i].getGeometry();
            if (coordinate.toString() === geom.getCoordinates().toString())
                return arrays[i];
        }
        return null;
    }
    //通过id获取消息列表中的消息
    overview.findmsgdatabyid = function (id) {
        for (var i = 0; i < overview.msgdata.length; i++) {
            var msg = overview.msgdata[i];
            if (msg.id == id) {
                return msg;
            }
        }
        return null;
    };

    //向消息列表中添加消息
    overview.adddatatomsgarray = function (msg) {
        overview.msgdata.push(msg);
        overview.overview_region_page.addData([msg],false);
    };
        //通过id删除消息列表中数据
    overview.removemsgdatabyid = function (id) {
        for (var i = 0; i < overview.msgdata.length; i++) {
            var msg = overview.msgdata[i];
            if (msg.id == id) {
                overview.msgdata.splice(i, 1);
            }
        }
        overview.overview_region_page.removebyid(id,true)
        overview.msFeatrues.remove(overview.findfeaturebyid(id));

        var lay = overview.overMap.getOverlayById(id)
        overview.overMap.removeOverlay(lay);

    };

    //发送鹰眼图消息到一张图
    overview.sendMsgToMain = function (id) {
            var msgs = overview.findmsgdatabyid(id);
            if (!msgs)
                return
            gis.util.flyToDestination(msgs.coordinate[0], msgs.coordinate[1], sysConfig.flyToHight * 10);
    };
   //添加轨迹点
    overview.addtrackpoint=function(id,lon,lat){

        overview.removetrackpoint(id);
        var featrue1 = new ol.Feature();
        featrue1.set("id", id);

        if((!isNaN(lon)) && (!isNaN(lat)))
        {
            var pt1 = new ol.geom.Point([lon,lat]);
            featrue1.setGeometry(pt1);

            var lay = overview.overMap.getOverlayById(id)
            overview.overMap.removeOverlay(lay);

            var point_div = document.createElement('div');
            point_div.className = "overviewtrackanimation";
            point_div.id = id;
            var point_overlay = new ol.Overlay({
                id: id,
                element: point_div,
                positioning: 'center-center',
                position: [lon,lat]
            });
            overview.overMap.addOverlay(point_overlay);
        }

        overview.trackFeatrues.push(featrue1);

    }

   //删除轨迹点
    overview.removetrackpoint=function(id){

        var featrue1=overview.findtrackFeatruebyid(id);
        overview.trackFeatrues.remove(featrue1);
        var lay = overview.overMap.getOverlayById(id)
        overview.overMap.removeOverlay(lay);

    }

    //通过id获取消息列表中的消息
    overview.findtrackFeatruebyid = function (id) {
        var arrays = overview.trackFeatrues.getArray();
        for (var i = 0; i < arrays.length; i++) {
            var track = arrays[i];
            if (track.get("id") == id) {
                return track;
            }
        }
        return null;
    };



    return overview;
}));





