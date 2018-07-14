//基本数据
var baseData = {
    querypara: {},//查询点位数据的参数
    curentpara: {
        selectsubclassList: [],
        hasRequest: [],
    },//当前展示的参数

    init: function () {
        baseData.exchangeContent();
        addtest();
    },
//    点击切换三个界面
    exchangeContent: function () {
        $("#popout-base-data .modals-tab li").click(function () {
            $(this).find("span").addClass("modals-tab-active");
            $(this).siblings().find("span").removeClass("modals-tab-active");
            var id = $(this)[0].id;
            switch (id) {
                case "danger-points":
                    disasterscene.riskPointShow();
                    break;
                case "base-data-place":
                    //调用disasterscene里面的方法
                    disasterscene.placePointShow();
                    break;
                case "base-data-video":
                    disasterscene.videoPointShow();
                    break;
            }
        })
    },
    //查询基础点位数据
    querybasedata: function () {
        baseData.querypara = JSON.parse(JSON.stringify(baseData.curentpara));

        //判断是否取消显示
        for (var i = 0; i <baseData.querypara.hasRequest.length; i++) {
            var index=baseData.curentpara.selectsubclassList.indexOf(baseData.querypara.hasRequest[i]);
            if(index==-1)
            {
                baseData.curentpara.hasRequest.remove(baseData.querypara.hasRequest[i]);
                gis.util.markerLayer.removeMarkerByType(baseData.querypara.hasRequest[i]);
            }
        }
        //没有被查询过的类型才去查询
        for (var i = 0; i < baseData.curentpara.hasRequest.length; i++) {
            baseData.querypara.selectsubclassList.remove(baseData.curentpara.hasRequest[i]);
        }
        baseData.querypara.subclassList = baseData.querypara.selectsubclassList.join(",");
        if(baseData.querypara.subclassList=="")
            return;
        $.ajax({
            url: sysConfig.header + "/pointCache/point/getCountInformationPointByParam",
            type: "GET",
            dataType: "json",
            data: baseData.querypara,
            success: function (data) {
                if (data.success == true) {
                    baseData.curentpara.hasRequest = baseData.curentpara.hasRequest.concat(baseData.querypara.selectsubclassList);
                    if (data.data.length > 0) {
                        baseData.adddatatomap(data.data);
                    }
                }
            },
            error: function (data) {
            }
        })
    },
    adddatatomap: function (data) {
        var imgUrl = "";
        var clickcallback;
        for (var i = 0; i < data.length; i++) {
            if (data[i].type == "place") {
                clickcallback = baseData.placePointOnClick;
            }
            else if (data[i].type == "risk_point") {
                clickcallback = baseData.riskPointOnClick;
            }
            for (var j=0;j< data[i].countBasicDataNumVoList.length;j++) {
                if(data[i].countBasicDataNumVoList[j].informationPointList.length==0)
                    continue;
                imgUrl = sysConfig.img + "/" + data[i].countBasicDataNumVoList[j].basicDataCode + "_1.png";
                var markerOption = {
                    lonField: "longitude",
                    latField: "latitude",
                    img: imgUrl,
                    data: data[i].countBasicDataNumVoList[j].informationPointList,
                    type: data[i].countBasicDataNumVoList[j].basicDataCode,
                    onClick: clickcallback
                };
                gis.util.addMakerBatch(markerOption);
            }

        }
    },
    riskPointOnClick: function (e, obj) {
        console.log(e);
        console.log("riskpoint");
    },
    placePointOnClick: function (e, obj) {
        console.log(e);
        console.log("placePointOnClick");
    },

}
/*灾害场景查询*/
var flag = false;
var disasterscene = ({
    allriskpointTypeList: [],
    allplacepointTypeList: [],
    allvideopointTypeList: [],
    init: function () {
        disasterscene.loadDisaterItem();
        $("#popout-base-data .closeX").click(function () {
            $("#popout-base-data").hide();

        })
        //拖动div
        divMove.init($("#popout-base-data"));
    },
    loadDisaterItem: function () {
        $.ajax({
            url: sysConfig.header + "/sysBasicData/scene/getAllScene",
            dataType: "JSON",
            type: "get",
            success: function (obj) {
                if (obj.success == true) {
                    var datas = obj.data;
                    var datas_L = datas.length;
                    for (var i = 0; i < datas_L; i++) {
                        if (i == 0) {
                            //   $(".disaster .disaster-item ul").append("<li class='active'attr_id='"+obj.data[0].sceneId+"' onclick='disasterscene.getpointType(this)'><div align='center'><img class='disaster-img' src='../images/observation/radar.png' /></div>"+obj.data[i].name+"</li>");
                            $.ajax({
                                url: sysConfig.header + "/sysBasicData/scene/getBusinessById?id=" + obj.data[0].sceneId,
                                dataType: "JSON",
                                type: "get",
                                beforeSend: function () {
                                    $(".data-loading").show();
                                },
                                success: function (obj) {
                                    if (obj.success == true) {

                                        //创建对象添加到数组里
                                        var dataChooseAll = {
                                            id: '',
                                            name: '全选',
                                        };
                                        disasterscene.allriskpointTypeList = [dataChooseAll];
                                        disasterscene.allplacepointTypeList = [dataChooseAll];
                                        disasterscene.allvideopointTypeList = [dataChooseAll];
                                        var datacount = obj.data.length;
                                        //根据Type将后台数据分成场所，危险点，视频三类添加到新建的数组里面
                                        for (var z = 0; z < datacount; z++) {
                                            if (obj.data[z].type == "risk_point") {
                                                disasterscene.allriskpointTypeList.push(obj.data[z]);
                                                //给数组对象加一个flag字段，根据字段判断是否处于全选状态
                                                disasterscene.allriskpointTypeList.falg = false;
                                                disasterscene.allriskpointTypeList.type = "risk_point";

                                            }
                                            else if (obj.data[z].type == "place") {
                                                disasterscene.allplacepointTypeList.push(obj.data[z]);
                                                disasterscene.allplacepointTypeList.falg = false;
                                                disasterscene.allplacepointTypeList.type = "place";
                                            }
                                            else if (obj.data[z].type == "video") {
                                                disasterscene.allvideopointTypeList.push(obj.data[z]);
                                                disasterscene.allvideopointTypeList.falg = false;
                                                disasterscene.allvideopointTypeList.type = "video";
                                            }
                                        }
                                        disasterscene.riskPointShow();
                                    }
                                }
                            });
                        } else {
                            //  $(".disaster .disaster-item ul").append("<li attr_id='"+obj.data[i].sceneId+"' onclick='disasterscene.getpointType(this)'><div align='center'><img class='disaster-img' src='../images/observation/radar.png' /></div>"+obj.data[i].name+"</li>");
                        }
                    }
                } else {
                    //    warning.show(obj.messages,"info");
                }
            }
        });
    },
    //危险点的数据展示
    riskPointShow: function () {
        var riskArr = disasterscene.allriskpointTypeList;
        var riskpoint_L = riskArr.length;
        disasterscene.contentShow(riskpoint_L, riskArr)
    },
    //场所数据展示
    placePointShow: function () {
        var placepoint_L = disasterscene.allplacepointTypeList.length;
        var placeArr = disasterscene.allplacepointTypeList;
        disasterscene.contentShow(placepoint_L, placeArr);
    },
    //视频数据展示
    videoPointShow: function () {
        var videoArr = disasterscene.allvideopointTypeList;
        var videopoint_L = videoArr.length;
        disasterscene.contentShow(videopoint_L, videoArr);
    },
    //内容展示
    contentShow: function (point_L, arrData) {
        var pagesiz = 18;
        if (point_L > 0) {
            var riskpagecount = Math.ceil(point_L / pagesiz);
            var riskdataList = '';
            var pageindex = 0;
            $(".next-page").click(function () {
                if (pageindex < riskpagecount - 1) {
                    riskdataList = '';
                    pageindex = pageindex + 1;
                    var start = pageindex * pagesiz;
                    var end = (pageindex + 1) * pagesiz > point_L ? point_L : (pageindex + 1) * pagesiz;
                    var para = {};
                    para.start = start;
                    para.end = end;
                    para.pageindex = pageindex;
                    para.riskpagecount = riskpagecount;
                    disasterscene.adddatatolist(para, arrData);
                }
            });
            $(".last-page").click(function () {
                if (pageindex > 0) {
                    riskdataList = '';
                    pageindex = pageindex - 1;
                    var start = pageindex * pagesiz;
                    var end = (pageindex + 1) * pagesiz;
                    var para = {};
                    para.start = start;
                    para.end = end;
                    para.pageindex = pageindex;
                    para.riskpagecount = riskpagecount;
                    disasterscene.adddatatolist(para, arrData);
                }
            });
            var opag = point_L > pagesiz ? pagesiz : point_L;
            var para = {};
            para.start = 0;
            para.end = opag;
            para.pageindex = pageindex;
            para.riskpagecount = riskpagecount;
            disasterscene.adddatatolist(para, arrData);
            $(".data-loading").hide();

        }
    },
    //添加数据类型列表到
    adddatatolist: function (para, arrData) {
        var riskdataList = "";
        for (var y = para.start; y < para.end; y++) {
            var curentpng = "_0.png"
            if (arrData[y].select == true)
                curentpng = "_1.png";
            if (y == 0) {
                riskdataList += '<li class="float-l" type="' + arrData.type + '"  onclick="disasterscene.chooseAllpoint(this)">' +
                    '<span class="data-choose-all">' +
                    '<img class="choose-all" src="img/index/data-choose' + curentpng + '">全选' +
                    '</span>' +
                    '</li>';
            }
            else {
                riskdataList += '<li class="float-l" type="' + arrData.type + '" onclick="disasterscene.chooseSingePoint(this)">' +
                    '<span class="data-choose-self">' +
                    '<img class="choose-self" data-basicDataDerviceCode="' + arrData[y].basicDataDerviceCode + '" src="' + sysConfig.img + '/' + arrData[y].basicDataDerviceCode + curentpng + '" >' + arrData[y].name + '</span>' +
                    '</li>';
            }
        }
        $(".pageIndexACount").text(para.pageindex + 1 + '/' + para.riskpagecount);
        $(".data-detail-list").html(riskdataList);

    },

    getpointType: function (event) {

        var id = $(event).attr("attr_id");
        $.ajax({
            url: sysConfig.header + "/sysBasicData/scene/getBusinessById?id=" + id,
            dataType: "JSON",
            type: "get",
            success: function (obj) {
                if (obj.success == true) {
                    console.log(obj);

                }
            }
        });
    },
    //全选按钮操作事件
    chooseAllpoint: function (_this) {
        var un_active = $(_this).find('img').attr("src");
        var type = $(_this).attr("type");
        var arrData = null;
        switch (type) {
            case "risk_point":
                arrData = disasterscene.allriskpointTypeList;
                break;
            case "place":
                arrData = disasterscene.allplacepointTypeList;
                break;
            case "video":
                arrData = disasterscene.allvideopointTypeList;
                break;
        }
        if (un_active == 'img/index/data-choose_0.png') {
            $(_this).find('img').attr("src", "img/index/data-choose_1.png");
            arrData.falg = true;
            // 将其他危险点全变为选中状态，在地图上调用方法实现定位
            var siblings = $(_this).siblings();
            for (var i = 0; i < siblings.length; i++) {
                var name = $(siblings[i]).find(".choose-self").attr("data-basicdatadervicecode");
                $(siblings[i]).find(".choose-self").attr("src", sysConfig.img + '/' + name + '_1.png');
                if (baseData.curentpara.selectsubclassList.indexOf(name) == -1)
                    baseData.curentpara.selectsubclassList.push(name);
            }
        }
        else {
            $(_this).find('img').attr("src", "img/index/data-choose_0.png");
            arrData.falg = false;
            var siblings = $(_this).siblings();
            for (var i = 0; i < siblings.length; i++) {
                var name = $(siblings[i]).find(".choose-self").attr("data-basicdatadervicecode");
                $(siblings[i]).find(".choose-self").attr("src", sysConfig.img + '/' + name + '_0.png');
                baseData.curentpara.selectsubclassList.remove(name);
            }
        }

        for (var y = 0; y < arrData.length; y++) {
            arrData[y].select= arrData.falg;
        }
        baseData.querybasedata();
    },
    //单个类型列表被单击
    chooseSingePoint: function (_this) {
        var un_active = $(_this).find('.choose-self').attr("src");
        var name = $(_this).find(".choose-self").attr("data-basicdatadervicecode");
        var isselect=false;
        if (un_active.indexOf("_0.png") > -1) {
            $(_this).find(".choose-self").attr("src", sysConfig.img + '/' + name + '_1.png');
            isselect=true;
            if (baseData.curentpara.selectsubclassList.indexOf(name) == -1)
                baseData.curentpara.selectsubclassList.push(name);
        }
        else {
            $(_this).find(".choose-self").attr("src", sysConfig.img + '/' + name + '_0.png');
            baseData.curentpara.selectsubclassList.remove(name);
            isselect=false;
        }
        var type = $(_this).attr("type");
        var arrData = null;
        switch (type) {
            case "risk_point":
                arrData = disasterscene.allriskpointTypeList;
                break;
            case "place":
                arrData = disasterscene.allplacepointTypeList;
                break;
            case "video":
                arrData = disasterscene.allvideopointTypeList;
                break;
        }
        for (var y = 0; y < arrData.length; y++) {
            if(arrData[y].basicDataDerviceCode==name)
            {
                arrData[y].select=isselect;
            }
        }
        baseData.querybasedata();
    }
});

baseData.init();
var plottingPop = {
    init: function () {
        var tag = false,ox = 0,left = 0,bgleft = 0;
        $('.opcity-progress-btn').mousedown(function(e) {
            ox = e.pageX - left;
            tag = true;
        });
        $(document).mouseup(function() {
            tag = false;
        });
        $('.opcity-progress').mousemove(function(e) {//鼠标移动
            if (tag) {
                left = e.pageX - ox;
                if (left <= 0) {
                    left = 0;
                }else if (left > 60) {
                    left = 60;
                }
                // debugger
                $('.opcity-progress-btn').css('left', left);
                $('.opcity-progress-bar').width(left);
                $('.opcity-val').val(parseInt((left/60)*100));
            }
        });
        $('.opcity-progress-bg').click(function(e) {//鼠标点击
            if (!tag) {
                bgleft = $('.opcity-progress-bg').offset().left;
                left = e.pageX - bgleft;
                if (left <= 0) {
                    left = 0;
                }else if (left > 60) {
                    left = 60;
                }
                $('.opcity-progress-btn').css('left', left);
                $('.opcity-progress-bar').animate({width:left},60);
                $('.opcity-val').val(parseInt((left/60)*100));
            }
        });
        
    }
};
plottingPop.init();