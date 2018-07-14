/**
 * Created by admin on 2017/12/5.
 * 地图标绘js
 */
(function (root, factory) {
    root.mappolt = factory();
}(window, function () {
    //return;
    var mappolt = {};
    mappolt.map=null;
    mappolt.plotDraw=null;
    mappolt.plotEdit=null;
    mappolt.drawOverlay=null;
    mappolt.drawStyle=null;
    mappolt.target="poltcanvas";
    mappolt.doubleinterval=10;//双线之间的距离 px
    mappolt.curentDrawType="";
    mappolt.textOverlay=null;//点文本框输入
    mappolt.curentFeature=null;//当前绘制完成的feature
    mappolt.measuredraw=null;//测量绘制
    mappolt.measureshow=false;//是否显示标绘测量
    mappolt.measuresketch=null;//测量绘制的图形

    mappolt.imagesrc=""; //点图标的路径
    mappolt.stylewidth={
        linewidth:3,
        textwidth:25,
    };

    //标绘类型
    mappolt.Teypes={
        //大头针
        pointpin:"pointpin",
        //气泡
        pointbubble:"pointbubble",
      //点带文字
        pointtext:"pointtext",

        //普通折线线
        brokenline:"brokenline",

        //普通折虚线
        brokendashline:"brokendashline",
        //曲线
        curveline:"curveline",

        //曲虚线
        curvedashline:"curvedashline",
        //双折线
        doublebrokenline:"doublebrokenline",
        //双曲线
        doublecurveline:"doublecurveline",
         //  圆
        circle:"circle",
        //多边形
        generalpolygon:"generalpolygon",

        //曲线多边形
        curvepolygon:"curvepolygon",
        //文字
        textlable:"textlable",
        //长度测量
        lengthmeasure:"lengthmeasure",
        //面积
        areameasure:"areameasure",
        //展示测量
        showmeasure:"showmeasure",
        //清除测量
        clearmeasure:"clearmeasure",

        //选择工具
        graphselect:"graphselect",
    }

    loadCSS("../js/map/css/polt.css");
    mappolt.id="poltdiv";

    //初始化布局
    mappolt.initui=function() {

        var  tooltip="data-toggle='tooltip' data-placement='right' title=";

        var cont = "<div class='header'>";
        cont += " <div class='header-name'>标绘、测量工具<span  id='graphselect' class='spantool cgraphselect' "+tooltip+"'选择标绘'></span></div>";
        cont += " <div class='polt-close'>";
        cont += " <img src='../images/common/btn-close.png'>";
        cont += "</div>";
        cont += "</div>";
        $("#" + mappolt.id + "").append(cont);//头

        cont = "<div class='polt_body'>";
        cont += "  </div>";
        $("#" + mappolt.id + "").append(cont);

        cont = "<div class='polttype'>";
        cont +="<div class='divtooltype'>"
        cont += "<span  id='pointtype'  class='spantooltype'></span>";
        cont +="</div>"
        cont +="<div class='divspantool'>"
        cont += "<span id='" + mappolt.Teypes.pointpin + "' class='spantool' "+tooltip+"'画点样式' url='../images/polt/pointmap.png'></span>";
        cont += "<span  id='" + mappolt.Teypes.pointbubble + "' class='spantool' "+tooltip+"'画点样式' url='../images/polt/bubblemap.png'></span>";
        cont +="</div>";
        cont += "</div>";
        $("#" + mappolt.id + " .polt_body").append(cont);//点

        cont = "<div class='polttype'>";
        cont +="<div class='divtooltype'>"
        cont += "<span id='linetype' class='spantooltype'></span>";
        cont +="</div>"
        cont +="<div class='divspantool'>"
        cont += "<span id='" + mappolt.Teypes.brokenline + "' class='spantool' "+tooltip+"'画折线'></span>";
        cont += "<span  id='" + mappolt.Teypes.brokendashline + "' class='spantool' "+tooltip+"'画折虚线'></span>";
        cont += "<span  id='" + mappolt.Teypes.curveline + "' class='spantool' "+tooltip+"'画弧线'></span>";
        cont += "<span  id='" + mappolt.Teypes.curvedashline + "' class='spantool' "+tooltip+"'画弧线虚线样式'></span>";
        cont += "<span  id='" + mappolt.Teypes.doublebrokenline + "' class='spantool' "+tooltip+"'画双折线'></span>";
        cont += "<span  id='" + mappolt.Teypes.doublecurveline + "' class='spantool' "+tooltip+"'画双弧线'></span>";
        cont += "</div>";
        cont += " </div>";
        $("#" + mappolt.id + " .polt_body").append(cont);//线

        cont = "<div class='polttype'>";
        cont +="<div class='divtooltype'>"
        cont += " <span id='polygontype' class='spantooltype '></span>";
        cont +="</div>"
        cont +="<div class='divspantool '>"
        cont += "<span  id='" + mappolt.Teypes.circle + "' class='spantool' "+tooltip+"'画圆'></span>";
        cont += "<span  id='" + mappolt.Teypes.generalpolygon + "' class='spantool' "+tooltip+"'画多边形'></span>";
        cont += "<span  id='" + mappolt.Teypes.curvepolygon + "' class='spantool'  "+tooltip+"'画弧线多边形'></span>";
        cont += " </div>";
        cont += " </div>";
        $("#" + mappolt.id + " .polt_body").append(cont);//面




        cont= " <div class='polttype'>";
        cont+="<div class='divtooltype  '>";
        cont += " <span id='polttexttyype' class='spantooltype' ></span>";
        cont+="</div>";
        cont+="<div class='divspantool'>";
        cont += " <input type='text' id='polttext' value='我的标绘' />";
        cont += " <span  id='"+mappolt.Teypes.textlable+"' class='spantool' "+tooltip+"'画文字标绘'></span>";
        cont += " </div>";
        cont += " </div>";
        $("#" + mappolt.id + " .polt_body").append(cont);//文字


        cont = "<div class='polttype'>";
        cont +="<div class='divtooltype lastdivtooltype'>"
        cont += " <span id='measuretype' class='spantooltype ' "+tooltip+"'测量工具'  ></span>";
        cont +="</div>"
        cont +="<div class='divspantool '>"
        cont += "<span  id='"+mappolt.Teypes.lengthmeasure+"' class='spantool' "+tooltip+"'长度测量'   ></span>";
        cont += "<span   id='"+mappolt.Teypes.areameasure+"' class='spantool' "+tooltip+"'面积测量' ></span>";
        cont += "<span   id='"+mappolt.Teypes.showmeasure+"' "+tooltip+"'显示标绘测量' ></span>";
        cont += "<span  id='"+mappolt.Teypes.clearmeasure+"'  class='spantool' "+tooltip+"'清除测量结果' ></span>";
        cont += " </div>";
        cont += " </div>";
        $("#" + mappolt.id + " .polt_body").append(cont);//测量工具


        cont = " <div class='poltarg'>";
        cont+="<div>";
        cont += " <span id=''>高度</span>";
        cont+="</div>";
        cont+="<div>";
        cont += "<input type='text' id='poltheight' value='1000' />";
        cont += " <span id=''>米</span>";
        cont += " <span class='spaninterval' >宽度</span>";
        cont += " <input type='text' id='poltwidth'   onkeyup='this.value=this.value.replace(/\D/g,'')' value='3' />";
        cont += " <span id='poltwidthspan'>PX</span>";
        cont += " </div>";
        cont += " </div>";
        $("#" + mappolt.id + " .polt_body").append(cont);//高，宽

        cont = " <div class='poltarg'>";
        cont+="<div>";
        cont += " <span id=''>透明度</span>";
        cont += " </div>";
        cont+="<div>";
        cont += " <input type='text' id='poltopacity' value='100' />";
        cont += " <span id='' >% </span>";
        cont += " <span class='spaninterval' >颜色</span>";
        cont += "<input type='text' id='poltcolor' value='#3A578E' readonly='readonly' class='minicolors-input' >";
        cont += " </div>";
        cont += " </div>";
        $("#" + mappolt.id + " .polt_body").append(cont);//颜色透明度

        cont = " <div class='poltarg'>";
        cont+="<div>";
        cont += " <span id=''>字体</span>";
        cont += " </div>";
        cont+="<div>";
        cont += " <select id='points-font' >";
        cont += "     <option value='Microsoft YaHei' selected='selected'>微软雅黑</option>";
        cont += "    <option value='SimHei'>黑体</option>";
        cont += "<option value='SimSun'>宋体</option>";
        cont += " <option value='NSimSun'>新宋体</option>";
        cont += " <option value='FangSong'>仿宋</option>";
        cont += " </select>";
        cont += " </div>";
        cont += " </div>";
        $("#" + mappolt.id + " .polt_body").append(cont);//字体

        cont = " <ul>";
        cont += " <button type='button' id='btn_poltdelete' class='poltbtn poltdelet'>删除</button>";
        cont += " <button type='button' id='btn_poltcancel' class='poltbtn poltcancel'>取消</button>";
        cont += "  <button type='button' id='btn_poltconfirm' class='poltbtn  poltconfirm'>确认</button>";
        cont += "  </ul>";
        $("#" + mappolt.id + " .polt_body").append(cont);//button

    }
    mappolt.initui();

    $(".poltarg input").blur(function(){

        if(this.id=="poltcolor" || this.id=="polttext")return;
        var shows = $(this).val();
        var regp = /\D/g;
        if(shows && shows.match(regp)){
            $(this).val("")
            $(this).attr("placeholder","请输入数字")
            $(this).focus();
        }
        if(this.id=="poltwidth")
        {
            //根据不同绘制类型设置宽度文本框的值
            if( mappolt.curentDrawType==P.PlotTypes.MARKER)
            {
                mappolt.stylewidth.textwidth= $(this).val()
            }
            else
            {
                mappolt.stylewidth.linewidth= $(this).val()
            }
        }
    });

    //颜色选择工具
    $("#poltcolor").minicolors({
        control: 'hue',
        inline: $(this).attr('data-inline') === 'true',
        letterCase:  'lowercase',
        position:  'bottom left',
        change: function(hex, opacity) {
            var log;
            try {
                log = hex ? hex : 'transparent';
                if( opacity ) log += ', ' + opacity;
                console.log(log);
            } catch(e) {}
        },
        theme: 'default'
    });

    /*画图工具操作*/
    $(".plotdraw ul li").click(function(){
        $(this).addClass("active").siblings().removeClass("active");

        if($(this).hasClass("draw_plot")){
            $("#"+mappolt.id).toggleClass("hide");
           var ishide= $("#"+mappolt.id).hasClass("hide");
            if(ishide)
            {
                $("#"+mappolt.target).addClass("hide");
            }
            else
            {
                gis.util.clearpolt();
                $("#"+mappolt.target).removeClass("hide");
                mappolt.initpolt();
            }
        }else{
            gis.util.clearpolt();
            mappolt.clearall();
            mappolt.hide();
        }
    });

    $(".spantool").click(function(){
        mappolt.plotDraw.deactivate();
        var sid=this.id;
        $(this).toggleClass("c"+sid);
        $(".spantool").each(function(index,evt){
            if(evt.id!=sid)
            {
                $(this).removeClass("c"+evt.id);
            }

        });
       if(!$(this).hasClass("c"+sid))
           return;
        var id= this.id;
        mappolt.currentType=id;
        mappolt.imagesrc="";
        //取消绘制工具
        mappolt.initmeasureInteraction(false);
        switch (id)
        {
            case mappolt.Teypes.pointpin:
                mappolt.imagesrc=$(this).attr('url');
                mappolt.activate(P.PlotTypes.MARKER);
                break;
            case mappolt.Teypes.pointbubble:
                mappolt.imagesrc=$(this).attr('url');
                mappolt.activate(P.PlotTypes.MARKER);
                break;
            case mappolt.Teypes.brokenline:
                mappolt.activate(P.PlotTypes.POLYLINE);
                break;
            case mappolt.Teypes.brokendashline:
                mappolt.activate(P.PlotTypes.POLYLINE);
                break;
            case mappolt.Teypes.curveline:
                mappolt.activate(P.PlotTypes.CURVE);
                break;
            case mappolt.Teypes.curvedashline:
                mappolt.activate(P.PlotTypes.CURVE);
                break;
            case mappolt.Teypes.doublebrokenline:
                mappolt.activate(P.PlotTypes.DOUBLEPOLYLINE);
                break;
            case mappolt.Teypes.doublecurveline:
                mappolt.activate(P.PlotTypes.DOUBLE_CURVE);
                break;
            case mappolt.Teypes.generalpolygon:
                mappolt.activate(P.PlotTypes.POLYGON);
                break;
            case mappolt.Teypes.curvepolygon:
                mappolt.activate(P.PlotTypes.CLOSED_CURVE);
                break;
            case mappolt.Teypes.circle:
                mappolt.activate(P.PlotTypes.CIRCLE);
                break;
            case mappolt.Teypes.textlable:
                mappolt.activate(P.PlotTypes.MARKER);
                break;
            case mappolt.Teypes.lengthmeasure:
                mappolt.initmeasureInteraction("LineString");
                break;
            case mappolt.Teypes.areameasure:
                mappolt.initmeasureInteraction("Polygon");
                break;
            case mappolt.Teypes.clearmeasure:
                mappolt.clearmeasure();
                break
            case mappolt.Teypes.graphselect:
                mappolt.removeshowmeasure();
                break;

        }

    });

    //显示测量结果
    $("#showmeasure").click(function (e) {
        var sid = this.id;
        $(this).toggleClass("c" + sid);
        if ($(this).hasClass("c" + sid)) {
            mappolt.measureshow = true;
            mappolt.drawOverlay.getSource().forEachFeature(function (feature) {
                mappolt.addpoltmeasure(feature);
            });

        }
        else {
            mappolt.removeshowmeasure();
        }
    });
    //点击确认按钮把图形加载到cesium中
    $("#btn_poltconfirm").click(function(){

        mappolt.drawOverlay.getSource().forEachFeature(function (feature) {
            var geotype=feature.getGeometry().getType();
           var height= feature.get("height");
            var color= feature.get("color");
            var width=  feature.get("width");
            var cesiumDash=  feature.get("cesiumDash");
            var imagesrc=  feature.get("imagesrc");
            var option={
                color:color,
                width:width,
                cesiumDash:cesiumDash,
                imagesrc:imagesrc
            }
            var coods= feature.getGeometry().getCoordinates();
              if(coods==null||coods.length==0)return;
             if(geotype=="LineString")
            {
                for(var i=0;i<coods.length;i++)
                {
                    coods[i][2]=height;
                }
                var tcoods= gis.util.multiDimArr2SingeArr(coods);
                option.coods=tcoods;
                gis.util.addPolyline(option);
            }
            else if(geotype=="MultiLineString"){  //双线
                for(var i=0;i<coods.length;i++)
                {
                    for(var j=0;j<coods[i].length;j++)
                        coods[i][j][2]=height;
                    var tcoods= gis.util.multiDimArr2SingeArr(coods[i]);
                    option.coods=tcoods;
                    gis.util.addPolyline(option);
                }
            }
            else if(geotype=="Point")//点
             {
                 option.x=coods[0];
                 option.y=coods[1];
                 option.z=height;
                 var text= feature.get("text");
                 var sub=feature.get("stylesub");
                 mappolt.curentFeature.set("stylesub", mappolt.Teypes.pointtext);
                if(sub==mappolt.Teypes.pointtext)//当点包含文本内容时
                {
                    var font= feature.get("font");
                    option.text=text;
                    option.font=font;
                    gis.util.addpolttext(option);
                    gis.util.addpoltpoint(option);

                }
                 else {
                    if(text)//点类型只是文字
                    {
                        var font= feature.get("font");
                        option.text=text;
                        option.font=font;
                        gis.util.addpolttext(option);

                    }
                    else {//点类型没有文字
                        gis.util.addpoltpoint(option);
                    }
                }
             }
             else if(geotype=="Polygon")//面
             {
                 for(var j=0;j<coods[0].length;j++)
                     coods[0][j][2]=height;
                 var tcoods= gis.util.multiDimArr2SingeArr(coods);
                 option.coods=tcoods;
                 option.z=height;
                 gis.util.addpoltPolygon(option);

             }
        });
        mappolt.hide();
    });
    $("#btn_poltdelete").click(function(e){
        mappolt.plotDraw.deactivate();
        $(".spantool").each(function(index,evt){
                $(this).removeClass("c"+evt.id);
        });
        if(mappolt.drawOverlay && mappolt.plotEdit && mappolt.plotEdit.activePlot){
            mappolt.drawOverlay.getSource().removeFeature(mappolt.plotEdit.activePlot);
            var guid = mappolt.plotEdit.activePlot.get("guid");
            mappolt.removemeasuerbyid(guid);
            mappolt.plotEdit.deactivate();
        }
    })
    $("#btn_poltcancel").click(function(){
        mappolt.hide();
    })
    $(".polt-close").click(function(){
        mappolt.hide();
    });
    //输入框失去焦点，赋值文本到点上
    mappolt.overlaytextblur=function(evt)
    {
        mappolt.map.removeOverlay(mappolt.textOverlay);
        var text = $(this).val();
        if (text == "")
            return;
        var color=ColortoRgbArray($("#poltcolor").val());
        color[3]=parseFloat($("#poltopacity").val())/100;
        var  width=2;
        width=parseFloat($("#poltwidth").val());
        mappolt.curentFeature.set("stylesub", mappolt.Teypes.pointtext);
        mappolt.curentFeature.set("text", text);
        var style = mappolt.curentFeature.getStyle();
        var fontname = $("#points-font").val();
        var font = width + "px " + fontname;
        var textstyle = new ol.style.Text({
            font: font,
            fill: new ol.style.Fill({
                color: color
            }),
            text: text,
            offsetY: 12
        })
        style.setText(textstyle);
        mappolt.curentFeature.set("font", font);
        mappolt.curentFeature.setStyle(style);

    }
    //设置feature的样式
    mappolt.styleFunction=function(feature)
    {
        var type = feature.get("type");
       var styleresult= mappolt.getstylebyType(type);
        feature.set("color",styleresult.color);
        feature.set("width",styleresult.width);
        feature.set("cesiumDash",styleresult.cesiumDash);
        feature.set("imagesrc",mappolt.imagesrc);
        feature.set("text",styleresult.text);
        feature.set("font",styleresult.font);
        feature.setStyle(styleresult.style);
        return  feature ;
    }
    //标绘样式设置
    mappolt.getstylebyType=function(type,feature)
    {
        //根据不同绘制类型设置宽度文本框的值
        if( mappolt.curentDrawType==P.PlotTypes.MARKER)
        {
            $("#poltwidth").val(mappolt.stylewidth.textwidth);
        }
        else
        {
            $("#poltwidth").val(mappolt.stylewidth.linewidth);
        }

        var color=ColortoRgbArray($("#poltcolor").val());
        color[3]=parseFloat($("#poltopacity").val())/100;
        var  width=2;
        width=parseFloat($("#poltwidth").val());

         var  lineDash=undefined;
        var cesiumDash=undefined;
        var image=null;
        var textstyle=null;
        var styleresult={};
        switch (type)
        {
            case mappolt.Teypes.pointpin:
                image= new ol.style.Icon(({
                    src: mappolt.imagesrc,
                }));
                break;
            case mappolt.Teypes.pointbubble:
                image= new ol.style.Icon(({
                    src: mappolt.imagesrc,
                }));
                break;
            case mappolt.Teypes.brokendashline:
                //lineDash=[1,13];
                //cesiumDash="11110000";
                //lineDash=[1,5];
                //cesiumDash="1100110011001100";
                lineDash=[1,1,10,10];
                cesiumDash="1111111000111111";
                break;

            case mappolt.Teypes.curvedashline:
                lineDash=[1,1,10,10];
                cesiumDash="1111111000111111";
                break;


            case mappolt.Teypes.textlable:
            {
                var fontname=$("#points-font").val();
                var text=$("#polttext").val();
                var font=width+"px " +fontname;
                 image = new ol.style.Circle({radius: 0});
                 textstyle=new ol.style.Text({
                    font: font,
                    fill: new ol.style.Fill({
                        color: color
                    }),
                    text:text,
                     offsetY:12
                })
                styleresult.text=text;
                styleresult.font=font;
            }

        }

        var style = new ol.style.Style({
            image:image,
            fill: new ol.style.Fill({
                color: color
            }),
            stroke: new ol.style.Stroke({
                color: color,
                width: width,
                lineDash:lineDash
            }),
            text:textstyle
        });
        styleresult.style=style;
        styleresult.cesiumDash=cesiumDash;
        styleresult.color=color;
        styleresult.width=width;
        return styleresult;
    }

    //隐藏标绘工具
    mappolt.hide=function(){
        if(mappolt.plotDraw!=null)
        mappolt.plotDraw.deactivate();
        $(".spantool").each(function(index,evt){
            $(this).removeClass("c"+evt.id);
        });
        $("#"+mappolt.target).addClass("hide");
        $("#"+mappolt.id).addClass("hide");
        $("#graphselect").addClass("cgraphselect");
    }
    //初始化
    mappolt.initpolt=function(){
      if(mappolt.map!=null)
      {
          mappolt.setmapextent();
          return;
      }
        mappolt.map = new ol.Map({
            target:  mappolt.target,
            controls:[],
            layers: [
                //tiled,
            ],
            view: new ol.View({
                center:sysConfig.overviewCenter,
                projection:'EPSG:4326',
                zoom: sysConfig.overviewZoom
            })
        });

        mappolt.setmapextent();
        mappolt.map.on('moveend',function(e){
            gis.util.setExtent(mappolt.map.getView().calculateExtent(mappolt.map.getSize()));
        })
        mappolt.map.on("pointerdrag", function (e) {
            gis.util.setExtent(mappolt.map.getView().calculateExtent(mappolt.map.getSize()));
        } );
        mappolt.map.on('click', function(e){
            if(mappolt.plotDraw.isDrawing()){
                return;
            }
            if( mappolt.currentType!="graphselect")
                 return;
            var feature = mappolt.map.forEachFeatureAtPixel(e.pixel, function (feature, layer) {
                return feature;
            },{
                hitTolerance:3,
            });
            if(feature){
                // 开始编辑
                mappolt.plotEdit.activate(feature);
            }else{
                // 结束编辑
                mappolt.plotEdit.deactivate();
            }
        });
        // 初始化标绘绘制工具，添加绘制结束事件响应
        mappolt.plotDraw = new P.PlotDraw(mappolt.map);
        mappolt.plotDraw.on(P.Event.PlotDrawEvent.DRAW_END, mappolt.onDrawEnd, false, this);

        // 初始化标绘编辑工具
        mappolt.plotEdit = new P.PlotEdit(mappolt.map);


        // 绘制好的标绘符号，添加到FeatureOverlay显示。
        mappolt.drawOverlay = new ol.layer.Vector({
            source: new ol.source.Vector(),
        });
        mappolt.map.addLayer(mappolt.drawOverlay);


        mappolt.measuresource = new ol.source.Vector();

        mappolt.measurevector = new ol.layer.Vector({
            source: mappolt.measuresource,
            style: new ol.style.Style({
                fill: new ol.style.Fill({
                    color: 'rgba(255, 255, 255, 0.4)'
                }),
                stroke: new ol.style.Stroke({
                    color: 'rgba(255, 0, 0, 1)',
                    //lineDash: [10, 10],
                    width: 2
                }),
                image: new ol.style.Circle({
                    radius: 5,
                    fill: new ol.style.Fill({
                        color:  'rgba(200, 0, 0, 0.8)',
                    })
                })
            })
        });
        mappolt.map.addLayer(mappolt.measurevector)
    }
    //初始化textoverlay
    mappolt.initoverlay=function(){
        var overlaytextiput = document.createElement("input");
        overlaytextiput.type="text";
        overlaytextiput.id="overlaytextiput";

        mappolt.textOverlay = new ol.Overlay({
            id: "overlaytextiput",
            element: overlaytextiput,
            positioning: 'top-center',
            offset: [0, 12],
        });

    }

    //初始化测量工具
    mappolt.initmeasureInteraction =function(drawtype)
    {
        mappolt.map.un('pointermove', mappolt.measurepointerMoveHandler);
        mappolt.map.removeInteraction(mappolt.measuredraw);

        if (mappolt.helpTooltipElement) {
            mappolt.helpTooltipElement.parentNode.removeChild(mappolt.helpTooltipElement);
            mappolt.map.removeOverlay(mappolt.helpTooltipOverlay);
            mappolt.helpTooltipElement=null;
        }
        if(drawtype==false)
        return;


        mappolt.measuredraw = new ol.interaction.Draw({
            source: mappolt.measuresource,
            type: drawtype,
            style: new ol.style.Style({
                fill: new ol.style.Fill({
                    color: 'rgba(255, 255, 255, 0.2)'
                }),
                stroke: new ol.style.Stroke({
                    color: 'rgba(255, 0, 0, 0.7)',
                    lineDash: [10, 10],
                    width: 2
                }),
                image: new ol.style.Circle({
                    radius: 5,
                    stroke: new ol.style.Stroke({
                        color: 'rgba(200, 0, 0, 0.7)'
                    }),
                    fill: new ol.style.Fill({
                        color: 'rgba(200, 0, 0, 0.4)'
                    })
                })
            })
        });
        mappolt.map.addInteraction(mappolt.measuredraw);
        //  createMeasureTooltip;

        mappolt.helpTooltipElement = document.createElement('div');
        mappolt.helpTooltipElement.className = 'tooltipOverlay hidden';
        mappolt.helpTooltipOverlay = new ol.Overlay({
            element: mappolt.helpTooltipElement,
            offset: [15, 0],
            positioning: 'center-left'
        });
        mappolt.createMeasureTooltip();
        mappolt.helpTooltipOverlay.setProperties({type:"measure"});
        mappolt.map.addOverlay(mappolt.helpTooltipOverlay);
        var listener;
        mappolt.measuredraw.on('drawstart',
            function(evt) {
                // set sketch
                mappolt.measuresketch = evt.feature;

                /** @type {ol.Coordinate|undefined} */
                var tooltipCoord = evt.coordinate;

                listener = mappolt.measuresketch.getGeometry().on('change', function(evt) {
                    var geom = evt.target;
                    var output;
                    if (geom instanceof ol.geom.Polygon) {
                        output = mappolt.formatArea(geom);
                        tooltipCoord = geom.getInteriorPoint().getCoordinates();
                    } else if (geom instanceof ol.geom.LineString) {
                        output = mappolt.formatLength(geom);
                        tooltipCoord = geom.getLastCoordinate();
                    }
                    mappolt.measureTooltipElement.innerHTML = output;
                    mappolt.measureTooltipOverlay.setPosition(tooltipCoord);
                });
            }, this);
        mappolt.measuredraw.on('drawend',
            function() {
                mappolt.measureTooltipElement.className = 'tooltipOverlay tooltip-static';
                mappolt.measureTooltipOverlay.setOffset([0, -7]);
                // unset sketch
                mappolt.measuresketch = null;
                // unset tooltip so that a new one can be created
                mappolt.measureTooltipElement = null;
                mappolt.createMeasureTooltip();
                ol.Observable.unByKey(listener);
            }, this);
        mappolt.map.on('pointermove', mappolt.measurepointerMoveHandler);
    }

    //mappolt.continuePolygonMsg = 'Click to continue drawing the polygon';
    mappolt.continueLineMsg = '点击确定位置,双击结束';
    mappolt.measurepointerMoveHandler = function(evt) {
        if (evt.dragging) {
            return;
        }
        /** @type {string} */
        var helpMsg = '单击确定起点位置';

        if (mappolt.measuresketch) {
            helpMsg =mappolt.continueLineMsg;
            //var geom = (sketch.getGeometry());
            //if (geom instanceof ol.geom.Polygon) {
            //    helpMsg = continuePolygonMsg;
            //} else if (geom instanceof ol.geom.LineString) {
            //    helpMsg = continueLineMsg;
            //}
        }

        mappolt.helpTooltipElement.innerHTML = helpMsg;
        mappolt.helpTooltipOverlay.setPosition(evt.coordinate);

        mappolt.helpTooltipElement.innerHTML = helpMsg;
        mappolt.helpTooltipElement.classList.remove('hidden');
    };
    /**
     * Creates a new createMeasureTooltip
     */
    mappolt.createMeasureTooltip=function(id) {
        if(id==null)
            id=gis.util.generateUUID();
        mappolt.measureTooltipElement=null;
        mappolt.measureTooltipElement = document.createElement('div');
        mappolt.measureTooltipElement.className = 'tooltipOverlay tooltipmeasureOverlay';
        mappolt.measureTooltipOverlay = new ol.Overlay({
            id:id,
            element: mappolt.measureTooltipElement,
            offset: [0, -15],
            positioning: 'bottom-center'
        });
        mappolt.measureTooltipOverlay.setProperties({type:"measure"});
        mappolt.map.addOverlay(mappolt.measureTooltipOverlay);
        return mappolt.measureTooltipOverlay;
    }

    //长度
    mappolt.formatLength = function(line) {
        var length = ol.Sphere.getLength(line,{
            projection:mappolt.map.getView().getProjection()
        });
        var output;
        if (length > 100) {
            output = (Math.round(length / 1000 * 100) / 100) +
                ' ' + 'km';
        } else {
            output = (Math.round(length * 100) / 100) +
                ' ' + 'm';
        }
        return output;
    };

    //标绘中添加测量
    mappolt.addpoltmeasure=function(feature){
        var guid = feature.get("guid");
        var overlay = mappolt.map.getOverlayById(guid);
        if (overlay) return;
        var geotype = feature.getGeometry().getType();
        var geom = feature.getGeometry();
        var coods = feature.getGeometry().getCoordinates();
        if (coods == null || coods.length == 0)return;
        var output, tooltipCoord;
        overlay = mappolt.createMeasureTooltip(guid);
        if (geotype == "LineString") {
            output = mappolt.formatLength(geom);
            tooltipCoord = geom.getLastCoordinate();
        }
        else if (geotype == "MultiLineString") {  //双线
            var tgeom = new ol.geom.LineString(coods[0]);
            output = mappolt.formatLength(tgeom);
            tooltipCoord = tgeom.getLastCoordinate();
        }
        else if (geotype == "Polygon")//面
        {
            output = mappolt.formatArea(geom);
            tooltipCoord = geom.getInteriorPoint().getCoordinates();
        }
        else
            return;

        mappolt.measureTooltipElement.className = 'tooltipOverlay tooltip-static';
        mappolt.measureTooltipElement.innerHTML = output;
        overlay.setOffset([0, -7]);
        overlay.setPosition(tooltipCoord);
    }
   //清除测量数据以及提示
    mappolt.clearmeasure=function(){
        mappolt.removeshowmeasure();
        mappolt.map.removeOverlay(mappolt.helpTooltipOverlay);
        mappolt.map.removeOverlay(mappolt.measureTooltipOverlay);
        mappolt.measuresource.clear();
       var lays= mappolt.map.getOverlays();
        var arry=[];
        lays.forEach(function(value,index,array){
            var type=value.get("type");
            if(type=="measure")
            {
                arry.push(value);
            }
        });
        for(var i=0;i<arry.length;i++)
            mappolt.map.removeOverlay(arry[i]);
    }
    //清除显示标绘测量
     mappolt.removeshowmeasure=function(){
         $("#showmeasure").removeClass("cshowmeasure");
         mappolt.measureshow = false;
         mappolt.drawOverlay.getSource().forEachFeature(function (feature) {
             var guid = feature.get("guid");
             var guid = feature.get("guid");
             mappolt.removemeasuerbyid(guid);
         });
     }
     //通过id删除测量类型
    mappolt.removemeasuerbyid=function(id)
    {
        var overlay = mappolt.map.getOverlayById(id);
        mappolt.map.removeOverlay(overlay);
    }

    /**
     * 面积
     * @param {ol.geom.Polygon} polygon The polygon.
     * @return {string} Formatted area.
     */
    mappolt.formatArea = function(polygon) {
        var area = ol.Sphere.getArea(polygon,{
            projection:mappolt.map.getView().getProjection()
        });
        var output;
        if (area > 10000) {
            output = (Math.round(area / 1000000 * 100) / 100) +
                ' ' + 'km<sup>2</sup>';
        } else {
            output = (Math.round(area * 100) / 100) +
                ' ' + 'm<sup>2</sup>';
        }
        return output;
    };
    //设置openlayer的地图范围
    mappolt.setmapextent=function(){
        var extent=gis.util.getCurrentCameraViewRectangle();
       var textent= [extent.west/Math.PI*180, extent.south/Math.PI*180, extent.east/Math.PI*180, extent.north/Math.PI*180];
        mappolt.map.getView().fit(textent,{
            size:mappolt.map.getSize()
        })
    }
    // 绘制结束后，添加到FeatureOverlay显示。
    mappolt.onDrawEnd=function(event){
        var feature = event.feature;
        feature.set("type", mappolt.currentType);
        feature.set("guid", gis.util.generateUUID());
        mappolt.styleFunction(feature);

        var height=parseFloat($("#poltheight").val());
        if(isNaN(height))
        {
            height=1000;
        }
        feature.set("height",height);
        mappolt.drawOverlay.getSource().addFeature(feature);
        if(mappolt.measureshow)
            mappolt.addpoltmeasure(feature);
        if((mappolt.curentDrawType==P.PlotTypes.MARKER) &&  (mappolt.currentType!=mappolt.Teypes.textlable)) //设置点的文本输入框
        {
            mappolt.initoverlay();
            mappolt.curentFeature=feature;
            var coods= feature.getGeometry().getCoordinates();
            mappolt.textOverlay.setPosition(coods);
            mappolt.map.addOverlay(mappolt.textOverlay);
            $("#overlaytextiput").val("");
            $("#overlaytextiput").focus();
            $("#overlaytextiput").blur(mappolt.overlaytextblur);
        }
        mappolt.activate(mappolt.curentDrawType);
        // 开始编辑
        //mappolt.plotEdit.activate(feature);

    }
    // 指定标绘类型，开始绘制。
    mappolt.activate=function(type){
        mappolt.curentDrawType=type;
        mappolt.plotEdit.deactivate();
      var style= mappolt.getstylebyType(mappolt.currentType);
        mappolt.plotDraw.activate(type,style.style);
    };
    //清除所有图形
    mappolt.clearall=function(){
        mappolt.clearmeasure();
        if(mappolt.drawOverlay==null)return;
        mappolt.plotEdit.deactivate();
        mappolt.drawOverlay.getSource().clear();
    }
   return mappolt;
}))
//获取poltmap对象
function getopenlayerpoltmap()
{
    return mappolt;
}

ColortoRgbArray = function(sHex){
    var reg = /^#([0-9a-fA-f]{3}|[0-9a-fA-f]{6})$/;
    var sColor = sHex.toLowerCase();
    if(sColor && reg.test(sColor)){
        if(sColor.length === 4){
            var sColorNew = "#";
            for(var i=1; i<4; i+=1){
                sColorNew += sColor.slice(i,i+1).concat(sColor.slice(i,i+1));
            }
            sColor = sColorNew;
        }
        //处理六位的颜色值
        var sColorChange = [];
        for(var i=1; i<7; i+=2){
            sColorChange.push(parseInt("0x"+sColor.slice(i,i+2)));
        }
        return sColorChange;
    }else{
        return [0,0,0];
    }
};

