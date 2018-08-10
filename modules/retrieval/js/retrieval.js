var retrieval = {
  mapinfoHtml: null,
  seletdata: [],
  poidata: [], //查询的点位信息
  init: function() {
    retrieval.GetGisDisasterdata();
    $(".retrive-btn").click(function() {
      // retrieval.getRetrievalData();
      retrieval.GetGisDisasterdata();
      $("#popout-retrieval").show();
      retrieval.GetGisAreaData();
      retrieval.getGovernance();
    });
    $("#popout-retrieval .closeX").click(function() {
      $("#popout-retrieval").hide();
    });
    $(".type-choose-box li").click(function() {
      $(this)
        .find("i")
        .addClass("active");
      $(this)
        .siblings()
        .find("i")
        .removeClass("active");
    });
    $("#disaster_select").bind("change", function() {
      retrieval.streetSelect($(this).val());
    });
    $("#querydatabtn").click(function() {
      $("#street_select")
        .find("option:selected")
        .val();
      var dtype = $(".type-choose-box .type-choose.active").attr("data");
      // var areaname = $("#disaster_select").find("option:selected").text();
      // var streetname = $("#street_select").find("option:selected").text();
      var areaname = $("#disaster_select")
        .find("option:selected")
        .val();
      var streetname = $("#street_select")
        .find("option:selected")
        .val();
      var data = {
        dtype: dtype,
        areaid: areaname == "全部" ? "" : areaname,
        streetid: streetname == "全部" ? "" : streetname
      };
      retrieval.GetGisDisasterdata(data);
      retrieval.getGovernance(data);
    });
    $("#addressQuerybtn").click(function() {
      $("#popout-retrieval").show();
      retrieval.GetGisAreaData();
      var adress = $("#adressVal").val();
      var data = {
        address: adress
      };
      retrieval.GetGisDisasterdata(data);
    });
    //点击列表显示对应地点
    $("#retri-data").on("click", ".row", function() {
      var lon = $(this).attr("lon");
      var lat = $(this).attr("lat");
      flyToDestination(lon, lat);
    });
    //定位
    $("#location_lat_lng").on("click", "span", function() {
      var lon = $("#longitute").val();
      var lat = $("#latitude").val();
      flyToDestination(lon, lat);
    });
    //框选区域
    $("#drawCircle").on("click", function() {
      drawPolygon(function() {
        //将所选区域几个点传给后台
        console.log(latLons);
      });
    });

    $("#clearDrawCircle").on("click", function() {
      latLons = "";
      clearDrawing();
    });
    var lonlat = [];
    gis.mouse.registerEvent(gis.mouse.eventType.RIGHT_CLICK, function(movement) {
      var lon = gis.mouse.getCurrentClickedPosition(movement).longitude;
      var lat = gis.mouse.getCurrentClickedPosition(movement).latitude;
      lonlat.push({ lon, lat });
      if (lonlat.length == 2) {
        var jl = retrieval
          .getFlatternDistance(
            lonlat[0].lon,
            lonlat[0].lat,
            lonlat[1].lon,
            lonlat[1].lat
          )
          .toFixed(0);
        if (jl == "NaN") {
          jl = "0";
        }
        $("#mess").html("两地相距 " + jl + " 米");
        $("#mess").fadeIn(10);
        // console.log(lonlat)
        setTimeout(() => {
          $("#mess").fadeOut(1000);
          lonlat = [];
        }, 3000);
        lonlat = [];
      }
    });
  },
  getFlatternDistance: function(lat1, lng1, lat2, lng2) {
    var f = (((lat1 + lat2) / 2) * Math.PI) / 180.0;
    var g = (((lat1 - lat2) / 2) * Math.PI) / 180.0;
    var l = (((lng1 - lng2) / 2) * Math.PI) / 180.0;

    var sg = Math.sin(g);
    var sl = Math.sin(l);
    var sf = Math.sin(f);

    var s, c, w, r, d, h1, h2;
    var a = 6378137.0;
    var fl = 1 / 298.257;

    sg = sg * sg;
    sl = sl * sl;
    sf = sf * sf;

    s = sg * (1 - sl) + (1 - sf) * sl;
    c = (1 - sg) * (1 - sl) + sf * sl;

    w = Math.atan(Math.sqrt(s / c));
    r = Math.sqrt(s * c) / w;
    d = 2 * w * a;
    h1 = (3 * r - 1) / 2 / c;
    h2 = (3 * r + 1) / 2 / s;

    return d * (1 + fl * (h1 * sf * (1 - sg) - h2 * (1 - sf) * sg));
  },
  GetGisAreaData: function() {
    $.ajax({
      type: "GET",
      url: sysConfig.header + "/dfbinterface/mobile/gisshow/GetGisAreaname", //后台接口地址
      dataType: "jsonp",
      jsonp: "callback",
      success: function(data) {
        var result = data.result;
        var selectconten = "<option value='全部'>全部</option>";
        for (var i = 0; i < result.length; i++) {
          selectconten +=
            "1<option value='" +
            result[i].id +
            "'>" +
            result[i].name +
            "</option>";
          retrieval.seletdata[result[i].id] = result[i].child;
          if (i == 0) {
            retrieval.streetSelect(result[i].id);
          }
        }
        $("#disaster_select").html(selectconten);
      }
    });
  },
  //展示显示街道办选择框
  streetSelect: function(id) {
    $("#street_select").html("<option value='全部'>全部</option>");
    var data = retrieval.seletdata[id];
    if (data == null) return;
    var selectconten = "<option value='全部'>全部</option>";
    for (var i = 0; i < data.length; i++) {
      selectconten +=
        "<option value='" + data[i].id + "'>" + data[i].name + "</option>";
    }
    $("#street_select").html(selectconten);
  },
  // 显示table数据列
  showQueryDatalist: function(data) {
    var len = data.result.length,
      datas = data.result;
    if (len < 10) {
      $("#retrieve-page").hide();
    }
    var tableData = "";
    var sty =
      "display:inline-block;width:180px;line-height:30px;overflow:hidden;text-overflow:ellipsis;white-space:nowrap;";
    for (var i = 0; i < len; i++) {
      tableData +=
        "<div lon=" +
        datas[i].lon +
        " lat=" +
        datas[i].lat +
        ' class="query-data-list data-list-tbody row" itemuuid="' +
        datas[i].uuid +
        '" >' +
        '<div class="col-xs-3"><span>' +
        datas[i].id +
        "</span></div>" +
        '<div class="col-xs-7"><span title=' +
        datas[i].areaname +
        datas[i].addressname +
        " style=" +
        sty +
        ">" +
        // datas[i].areaname +
        datas[i].addressname +
        "</span></div>" +
        '                    <div class="col-xs-2"><span>' +
        retrieval.ifInline(datas[i].managestate) +
        "</span></div>" +
        "                </div>";
    }

    $("#retri-data").html(tableData);
    retrieval.dataPagesBreak();
  },
  //是否在线
  ifInline: function(key) {
    switch (key) {
      case "1":
        return "已治理";
        break;
      case "2":
        return "未治理";
        break;
      case "3":
        return "治理中";
        break;
      default:
        return "未治理";
        break;
    }
  },
  //获取治理情况
  getGovernance: function(data) {
    $.ajax({
      type: "POST",
      url: sysConfig.header + "/dfbinterface/mobile/gisshow/Getypecount",
      dataType: "jsonp",
      data: data,
      jsonp: "callback",
      success: function(data) {
        if (data.success == "0") {
          $(".ungovern").html(data.result.suspending);
          $(".hasgovern").html(data.result.solved);
          $(".ingovern").html(data.result.handling);
        }
      }
    });
  },
  // 获取点位数据
  GetGisDisasterdata: function(data) {
    $.ajax({
      type: "GET",
      url: sysConfig.header + "/dfbinterface/mobile/gisshow/GetGisDisasterdata", //后台接口地址
      dataType: "jsonp",
      data: data,
      jsonp: "callback",
      success: function(data) {
        //  显示查询出来的数据列表
        retrieval.showQueryDatalist(data);
        var imgUrl = "img/led_green.png";
        var markerOption = {
          lonField: "lon",
          latField: "lat",
          img: imgUrl,
          data: data.result,
          type: "basedata",
          imgWidth: 40, //图片宽度
          imgHeight: 40, //图片高度
          onClick: retrieval.pointOnClick
        };
        gis.util.addMakerBatch(markerOption);
      }
    });
  },
  //点击地图上的图标弹出弹框
  pointOnClick: function(e, obj) {
    if (retrieval.mapinfoHtml != null) {
      // console.log("点击地图图标出弹框");
      sessionStorage.setItem("uuid", obj.primitive.dataObj.uuid);
      var detail =
        "<div id='" +
        obj.id +
        "' class='popout-div'>" +
        retrieval.mapinfoHtml +
        "</div>";
      var $ele = null,
        $ele = $(detail);
      $ele.appendTo("body");
      $("#map-popout").html($ele);
      $("#map-popout").show();
      console.log(obj.primitive.dataObj.lat);
      console.log(obj.primitive.dataObj.lon);
      // gis.util.addHTMLToMap($ele, obj.primitive.dataObj.lat, obj.primitive.dataObj.lon);

      //    调请求数据的接口
      retrieval.getSingleDisasterData(obj.primitive.dataObj.uuid);
      retrieval.tabsFlipover();
    } else {
      getTemplateHtml("modules/retrieval/mapinfoTemplate.html", function(
        content
      ) {
        retrieval.mapinfoHtml = content;
        retrieval.pointOnClick(e, obj);
      });
    }
  },
  //分页初始化
  dataPagesBreak: function() {
    //根据屏幕高度设置每页显示数目
    var show_per_page = 0;
    // console.log($(window).height())
    if ($(window).height() >= 800) {
      show_per_page = 10;
    } else if ($(window).height() >= 700 && $(window).height() < 800) {
      show_per_page = 8;
    } else if ($(window).height() >= 600 && $(window).height() < 700) {
      show_per_page = 6;
    } else if ($(window).height() >= 450 && $(window).height() < 600) {
      show_per_page = 3;
    }
    if ($(window).height() < 450) {
      show_per_page = 2;
    }
    //每页显示的数目
    // var show_per_page = 10;
    //获取话题数据的数量
    var number_of_items = $("#retri-data")
      .children()
      .size();
    //计算页数
    var number_of_pages = Math.ceil(number_of_items / show_per_page);
    //设置隐藏域默认值
    $("#current_page").val(0);
    $("#show_per_page").val(show_per_page);
    //生成分页->上一页
    var page_info =
      '<li><a class="previous_link" href="javascript:retrieval.previousPage();">«</a></li>';
    var current_link = 0;
    //生成分页->页数
    while (number_of_pages > current_link) {
      if (current_link == 5) {
        break;
      }
      page_info +=
        '<li><a class="page_link" href="javascript:retrieval.go_to_page(' +
        current_link +
        ')" longdesc="' +
        current_link +
        '">' +
        (current_link + 1) +
        "</a></li>";
      current_link++;
    }
    //生成分页->下一页
    page_info +=
      '<li><a class="next_link" href="javascript:retrieval.nextPage();">»</a></li>';
    //加载分页
    $(".pagination").html(page_info);

    //激活第一页，使得显示第一页
    $("#retrieve-page li")
      .eq(1)
      .addClass("active");
    //隐藏该对象下面的所有子元素
    $("#retri-data")
      .children()
      .css("display", "none");
    //显示第n（show_per_page）元素
    $("#retri-data")
      .children()
      .slice(0, show_per_page)
      .css("display", "block");
  },
  //    跳转某一页
  go_to_page: function(page_num) {
    $(".page_link[longdesc=" + page_num + "]")
      .parent()
      .addClass("active")
      .siblings(".active")
      .removeClass("active");
    //获取隐藏域中页数大小（每页多少条数据）
    var show_per_page = parseInt($("#show_per_page").val());
    //获取总数据的数量
    var number_of_items = $("#retri-data")
      .children()
      .size();
    //得到元素从哪里开始的片数（点击页 * 页大小）如点击第5页，5条/页。则开始为25
    start_from = page_num * show_per_page;

    //得到结束片的元素数量，如果开始为25，5条/页，则结束为30
    end_on = start_from + show_per_page;
    //隐藏所有子div元素的内容,显示具体片数据，如显示25~30
    $("#retri-data")
      .children()
      .css("display", "none")
      .slice(start_from, end_on)
      .css("display", "block");
    //每页显示的数目
    var show_per_page = 10;

    //计算页数
    var number_of_pages = Math.ceil(number_of_items / show_per_page);
    //在页数区域内则做页偏移
    if (page_num >= 2 && page_num <= number_of_pages - 3) {
      //生成分页->上一页
      var page_info =
        '<li><a class="previous_link" href="javascript:retrieval.previousPage();">«</a></li>';
      var p = page_num;
      var i = page_num - 2;
      var j = page_num + 2;
      //生成分页->前2页
      while (page_num > i) {
        page_info +=
          '<li><a class="page_link" href="javascript:retrieval.go_to_page(' +
          i +
          ')" longdesc="' +
          i +
          '">' +
          (i + 1) +
          "</a></li>";
        i++;
      }
      //生成分页->当前页
      page_info +=
        '<li><a class="page_link" href="javascript:retrieval.go_to_page(' +
        page_num +
        ')" longdesc="' +
        page_num +
        '">' +
        (page_num + 1) +
        "</a></li>";
      //生成分页->后2页
      while (p < j) {
        if (p == number_of_pages) {
          break;
        }
        page_info +=
          '<li><a class="page_link" href="javascript:retrieval.go_to_page(' +
          (p + 1) +
          ')" longdesc="' +
          (p + 1) +
          '">' +
          (p + 2) +
          "</a></li>";
        p++;
      }
      //生成分页->下一页
      page_info +=
        '<li><a class="next_link" href="javascript:retrieval.nextPage();">»</a></li>';
      //加载分页
      $(".pagination").html(page_info);
      $(".page_link[longdesc=" + page_num + "]")
        .parent()
        .addClass("active")
        .siblings(".active")
        .removeClass("active");
    } else {
      //否则不偏移
      //激活某一页，使得显示某一页
      $(".page_link[longdesc=" + page_num + "]")
        .parent()
        .addClass("active")
        .siblings(".active")
        .removeClass("active");
    }
    //更新隐藏域中当前页
    $("#current_page").val(page_num);
  },
  //    上一页
  previousPage: function() {
    //当前页-1
    new_page = parseInt($("#current_page").val()) - 1;
    if (new_page >= 0) retrieval.go_to_page(new_page);
  },
  //下一页
  nextPage: function() {
    //当前页+1
    new_page = parseInt($("#current_page").val()) + 1;
    if (
      new_page <
      $("#retrieve-page li")
        .eq(-2)
        .text()
    )
      retrieval.go_to_page(new_page);
  },
  //    地图上的点位点击弹出弹框获取数据填充
  getSingleDisasterData: function(uuid) {
    var data = {
      uuid: uuid
    };
    $.ajax({
      type: "GET",
      url: sysConfig.header + "/dfbinterface/mobile/gisshow/GetSingleDisaster", //后台接口地址
      dataType: "jsonp",
      data: data,
      jsonp: "callback",
      success: function(data) {
        // console.log(data)
      }
    });
  },
  //地图上点击图标弹出弹框对应的tab左右点击事件
  tabsFlipover: function() {
    var sumWidth = 0;
    $(".tabs-content-list").each(function() {
      sumWidth += $(this).width();
    });
    var m = Math.ceil(sumWidth / 344);
    var n = 0;
    $(".tabsiconr").click(function() {
      if (n < m) {
        n++;
        $(".tabs-content>ul").css("margin-left", n * -344 + "px");
      }
    });
    $(".tabsiconl").click(function() {
      if (n > 0 && n <= m) {
        n--;
        $(".tabs-content>ul").css("margin-left", n * 344 + "px");
      }
    });
  }
};
function callback(data) {
  // ;
}
retrieval.init();
$.fn.extend({
  drag: function() {
    this.on("mousedown", function(e) {
      $(this).css("position", "absolute");
      var disX = e.clientX - $(this).position().left,
        disY = e.clientY - $(this).position().top,
        $self = $(this);
      $(document).on("mousemove", function(e) {
        $self.css("left", e.clientX - disX);
        $self.css("top", e.clientY - disY);
      });
      $(document).on("mouseup", function() {
        $(document).off();
      });
    });
  }
});
//l// $(".popout-content").drag();