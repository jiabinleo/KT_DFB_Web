var solidLineIDMap =[];
var dashedLineIDMap = [];
/**
 * 插件相关工具方法
 */
(function (root, factory) {
    root.util = factory();
}(gis, function () {
    var util = {};
    var viewer = gis.viewer;
    var scene = viewer.scene;
    /**
     * canvas图形*****************************************
     */
    util.canvasMap = {};
    /**
     * 实心圆
     */
    util.canvasMap.DOT = function () {
        var canvas = document.createElement('canvas');
        canvas.width = 51;
        canvas.height = 51;
        var context = canvas.getContext('2d');
        context.beginPath();
        context.arc(26, 26, 25, 0, Math.PI * 2, true);
        context.closePath();
        context.fillStyle = 'rgb(255, 255, 255)';
        context.fill();

        return canvas;
    }();

    /**
     * 生成 UUID 字符串
     * @param length UUID长度，默认32位
     * @returns {string} 指定长度UUID字符串
     */
    util.generateUUID = function (length) {
        var str = "";
        var arr = ['0', '1', '2', '3', '4', '5', '6', '7', '8', '9', 'a', 'b', 'c', 'd', 'e', 'f', 'g', 'h', 'i', 'j', 'k', 'l', 'm', 'n', 'o', 'p', 'q', 'r', 's', 't', 'u', 'v', 'w', 'x', 'y', 'z', 'A', 'B', 'C', 'D', 'E', 'F', 'G', 'H', 'I', 'J', 'K', 'L', 'M', 'N', 'O', 'P', 'Q', 'R', 'S', 'T', 'U', 'V', 'W', 'X', 'Y', 'Z'];
        var range = 32;
        if (length !== undefined) {
            range = length;
        }

        for (var i = 0; i < range; i++) {
            var pos = Math.round(Math.random() * (arr.length - 1));
            str += arr[pos];
        }
        return str;
    };

    //隐藏元素
    util.hideEle = function ($ele) {
        $.ele.css("display", "none");
    };

    //显示元素
    util.showEle = function ($ele) {
        $.ele.css("display", "block");
    };

    /**
     *
     * @param multiDimArr - 多维数组
     * @param breakDownCount - 降维维数，不传默认降至一维
     */
    util.multiDimArr2SingeArr = function (multiDimArr, breakDownCount) {
        if (!multiDimArr instanceof Array) {
            throw  new Error("array is needed!");
        }

        var singleDimArr = [];
        breakDownCount = breakDownCount || Number.MAX_VALUE;

        breakDownArr(multiDimArr, singleDimArr, breakDownCount);

        return singleDimArr;
    };

    function breakDownArr(target, des, breakDownCount) {
        breakDownCount--;
        for (var i = 0; i < target.length; i++) {
            var obj = target[i];

            if (breakDownCount !== 0 && obj instanceof Array) {
                breakDownArr(obj, des);
            } else {
                des.push(obj);
            }
        }
    }
    // ***************************** begin of marker namespace *********************************************************
    /**
     * MARKER图层管理命名空间
     *
     */
    util.markerLayer = {};
    /**
     * 类型图层映射
     */
    util.markerLayer.layerMap = {};
    /**
     * 根据类型获取对应图层
     * @param type 类型
     * @return {*}
     */
    util.markerLayer.getLayer = function (type) {
        var layer = util.markerLayer.layerMap[type];

        if (!layer) {
            layer = util.markerLayer.layerMap[type] = scene.primitives.add(new Cesium.BillboardCollection());
        }

        return layer;
    };



    /**
     * 根据类型移除图层
     * @param type 类型
     */
    util.markerLayer.removeMarkerByType = function (type) {
        var layer = util.markerLayer.layerMap[type];

        if (!layer) {
            return;
        }

        scene.primitives.remove(layer);
        delete util.markerLayer.layerMap[type];
    };
    /**
     * 移除MARKER
     * @param marker
     */
    util.markerLayer.removeMarker = function (marker) {
        var type = marker.data.type;
        var layer = util.markerLayer.layerMap[type];

        if (!layer) {
            return;
        }

        layer.remove(marker);
    };
    /**
     * 清除所有MARKER图层,f
     *
     */
    util.markerLayer.removeAll = function () {
        var layerMap = util.markerLayer.layerMap;

        for (var key in layerMap) {
            scene.primitives.remove(layerMap[key]);
        }

        util.markerLayer.layerMap = {};
    };
    /**
     * 清除地图上所有绘制的点线面
     */

    util.clearAll=function()
    {
        util.markerLayer.removeAll();
        scene.primitives.removeAll()
    };

    //****************************** end of marker namespace ***********************************************************

    // 扩展图标原型，增加删除方法
    Cesium.Billboard.prototype.delete = function () {
        if (this.data && this.data.type) {
            util.markerLayer.removeMarker(this);
        }
    };

    //注册标记左单击事件
    gis.mouse.registerEvent(gis.mouse.eventType.LEFT_CLICK, function (e) {
        var picked = gis.viewer.scene.pick(e.position);
        if(picked==undefined)return;
        if (picked && picked.primitive && picked.primitive.onClick) {
            picked.primitive.onClick(e, picked);
        }
        //DataSource entity点击事件
        if(picked.id && picked.id instanceof Cesium.Entity && picked.id.onClick )
        {
            picked.primitive.dataObj=picked.id.dataObj;
            picked.id.onClick(e, picked);
        }
    });

    //注册标记右单击事件
    gis.mouse.registerEvent(gis.mouse.eventType.LEFT_CLICK, function (e) {
        var picked = gis.viewer.scene.pick(e.position);
        if (picked && picked.primitive && picked.primitive.rightClick) {
            picked.primitive.rightClick();
        }
    });


    /**
     * 批量标点（加高度）
     * @param {Array}  data:数据数组
     * @param {String} lonField:数据经度字段名（可不传->默认：longitude）
     * @param {String} latField:数据纬度字段名（可不传->默认：latitude）
     * @param {String} img:图片地址（可不传->默认：白色圆点）
     * @param {String} imgWidth:数据图片宽度（可不传->默认：16）
     * @param {String} imgHeight:数据图片高度（可不传->默认:16）
     * @param {String} type:数据类型，用作图层管理（可不传->默认:marker）
     * @param {Function} onClick:鼠标左单击回调（可不传->默认:空函数）
     * @param {Function} rightClick:鼠标右单击回调（可不传->默认:空函数）
     */
    util.addMakerBatch = function (option) {
        //console.log("我进来了");
        var opt = $.extend({}, util.addMakerBatch.DEFAULT_OPTS, option);
        var datas = opt.data;
        var type = opt.type;
        var layer = util.markerLayer.getLayer(type);
        var altitudeQueryNeededList = [];
        var altitudeQueryNeededDataList = [];

        for (var i = 0; i < datas.length; i++) {
            var data = datas[i];
            var lon = data[opt.lonField];
            var lat = data[opt.latField];

            if (!isNaN(lon) && !isNaN(lat)) {
                if (-180 <= lon && lon <= 180 && -90 <= lat && lat <= 90) {
                    altitudeQueryNeededList.push(Cesium.Cartographic.fromDegrees(lon, lat));
                    altitudeQueryNeededDataList.push(data);
                }
            }
        }

        // var promise = Cesium.sampleTerrain(gis.viewer.terrainProvider, gis.terrainMaxLevel, altitudeQueryNeededList);
        // Cesium.when(promise, function (updatedPositions) {
            // debugger
            for (var i = 0; i < altitudeQueryNeededDataList.length; i++) {
                var data = altitudeQueryNeededDataList[i];
                var imgUrl = ""
                switch (data.managestate) {
                    case "1":
                        imgUrl ="img/led_green.png"
                        break;
                    case "2":
                        imgUrl ="img/led_red.png"
                        break;
                    case "3":
                        imgUrl ="img/led_orange.png"
                        break;
                    default:
                        imgUrl ="img/led_red.png"
                        break;
                }
                var marker = layer.add({
                    id: type + "_" + util.generateUUID(),
                    position: Cesium.Cartesian3.fromDegrees(
                        altitudeQueryNeededDataList[i][opt.lonField],
                        altitudeQueryNeededDataList[i][opt.latField]),
                    image: imgUrl,
                    height: opt.imgHeight,
                    heightReference:Cesium.HeightReference.CLAMP_TO_GROUND,
                    width: opt.imgWidth
                });

                marker.dataObj = data;
                marker.onClick = opt.onClick;
                marker.rightClick = opt.rightClick;
            }
        // });
    };

    util.addMakerBatch.DEFAULT_OPTS = {
        lonField: "longitude",
        latField: "latitude",
        img: util.canvasMap.DOT,
        imgWidth: 16,
        imgHeight: 16,
        data: [],
        type: "marker",
        onClick: function () {
        },
        rightClick: function () {
        }
    };

    /**
     * 图片文字型标记
     * 参数列表参见默认参数
     * @param {Object} option -
     *
     */
    util.addMarker = function (option) {
        var opt = $.extend({}, util.addMarker.DEFAULT_OPTS, option);
        var marker = viewer.entities.add({
            id: opt.id === undefined ? "marker_" + util.generateUUID() : opt.id,
            name: opt.name,
            position: Cesium.Cartesian3.fromDegrees(opt.lon, opt.lat, opt.alt),
            // 图标
            billboard: {
                image: opt.imgUrl,
                color: opt.imgColor,
                width: opt.imgWidth,
                height: opt.imgHeight,
                heightReference: Cesium.HeightReference.RELATIVE_TO_GROUND,
                scaleByDistance: new Cesium.NearFarScalar(1.5e2, 2.0, 1.5e7, 0.5)
            },
            // 文字标签
            label: {
                text: opt.text,
                font: opt.font,
                fillColor: opt.textColor,
                verticalOrigin: Cesium.VerticalOrigin.TOP, // 垂直方向以底部来计算标签的位置
                horizontalOrigin: Cesium.HorizontalOrigin.LEFT,
                pixelOffset: new Cesium.Cartesian2(12, 0),
                distanceDisplayCondition: new Cesium.DistanceDisplayCondition(0,
                    100000000)
            }
        });
        return marker;
    };

    /**
     * 文字型标记
     * 参数列表参见默认参数
     * 不贴地
     * @param {Object} option -
     *
     */
    util.addText = function (option) {
        var opts = $.extend({}, util.addText.DEFAULT_OPTS, option);
        //var labelCollection = new Cesium.LabelCollection();
       var layer= util.getLabelLayer("addTextLayer");
        //gis.viewer.scene.primitives.add(labelCollection);
        var label={
            position:Cesium.Cartesian3.fromDegrees(opts.longitude,opts.latitude),
            fillColor:opts.textColor,
            text:opts.text,
            font: '10pt 微软雅黑',
            verticalOrigin: Cesium.VerticalOrigin.TOP, // 垂直方向以底部来计算标签的位置
            horizontalOrigin: Cesium.HorizontalOrigin.LEFT,
            pixelOffset: new Cesium.Cartesian2(10, 0),
            distanceDisplayCondition: new Cesium.DistanceDisplayCondition(0,
                100000000)
        }

        layer.add(label);
        //opts.uids.push(label);
        return opts.uids;
    }

    //图片文字型标记默认参数
    util.addText.DEFAULT_OPTS = {
        uids:[],
        longitude: 0,
        latitude: 0,
        text: "",
        textColor: Cesium.Color.RED
    }

    util.removeText = function (labelCollection) {
        //for (var i = 0; i < labelCollection.length; i++) {
        //    var obj = labelCollection[i];
        //    gis.viewer.scene.primitives.remove(obj);
        //}

        util.markerLayer.removeMarkerByType("addTextLayer")

    }


//图片文字型标记默认参数
    util.addMarker.DEFAULT_OPTS = {
        id: undefined,
        name: "marker",
        lon: 0,
        lat: 0,
        alt: 0,
        imgUrl: undefined,
        imgWidth: 12,
        imgHeight: 12,
        imgColor: undefined,
        text: "",
        textColor: Cesium.Color.RED,
        font: "10pt microsoft yahei"
    };

//关闭默认鼠标事件
    util.toggleDefaultMouseHandlerOFF = function () {
        scene.screenSpaceCameraController.enableRotate = false;
        scene.screenSpaceCameraController.enableTranslate = false;
        scene.screenSpaceCameraController.enableZoom = false;
        scene.screenSpaceCameraController.enableTilt = false;
        scene.screenSpaceCameraController.enableLook = false;
    };

//开启默认鼠标事件
    util.toggleDefaultMouseHandlerON = function () {
        scene.screenSpaceCameraController.enableRotate = true;
        scene.screenSpaceCameraController.enableTranslate = true;
        scene.screenSpaceCameraController.enableZoom = true;
        scene.screenSpaceCameraController.enableTilt = true;
        scene.screenSpaceCameraController.enableLook = true;
    };

    /**
     * 添加多边形
     * @param {Array} coordinates - 坐标点集合 [lon,lat,lon,lat...]
     * @param {String|Number} id
     */
    util.addPolygonShape = function (coordinates, id) {
        return viewer.entities.add({
            id: id,
            polygon: {
                hierarchy: Cesium.Cartesian3.fromDegreesArray(coordinates),
                material: Cesium.Color.BLUE.withAlpha(0.5),
                outline: true,
                outlineColor: Cesium.Color.BLACK.withAlpha(1),
                fill: true
            }
        });
    };

    /**
     * 添加圆形
     * @param {Object} 参见util.addCircleShape.DEFAULT_OPTS
     */
    util.addCircleShape = function (option) {
        var opt = $.extend({}, util.addCircleShape.DEFAULT_OPTS, option);
        return viewer.entities.add({
            id: opt.id || "circle_" + util.generateUUID(),
            position: Cesium.Cartesian3.fromDegrees(opt.lon, opt.lat),
            ellipse: (function () {
                if (opt.isClampToGround) {
                    return {
                        semiMinorAxis: opt.radius,
                        semiMajorAxis: opt.radius,
                        material: Cesium.Color.fromCssColorString(opt.fillColor).withAlpha(opt.fillOpacity)
                    }
                } else {
                    return {
                        semiMinorAxis: opt.radius,
                        semiMajorAxis: opt.radius,
                        material: Cesium.Color.fromCssColorString(opt.fillColor).withAlpha(opt.fillOpacity),
                        height: 0,
                        outline: opt.outline,
                        outlineColor: Cesium.Color.fromCssColorString(opt.outlineColor).withAlpha(opt.outlineOpacity),
                        outlineWidth: opt.outlineWidth
                    }
                }

            }())
        });
    };


    util.addCircleShape.DEFAULT_OPTS = {
        id: undefined,                          //id
        lon: 0,                                 //经度
        lat: 0,                                 //纬度
        radius: 0,                              //半径
        fillOpacity: 1,                         //填充透明度（0~1）
        fillColor: "#0000ff",                   //填充色，必须是CSS字符串("#ffffff")
        isClampToGround: false,                 //是否贴地，贴地无边线！！
        outline: true,                          //是否有边线
        outlineOpacity: 1,                      //边线透明度
        outlineColor: "#000000",                //边线颜色
        outlineWidth: 1                         //边线宽度
    };

    /**
     * 按对象删除
     * @param entity
     */
    util.deleteEntity = function (entity) {
        viewer.entities.remove(entity);
    };

    /**
     * 按ID删除
     * @param id
     */
    util.deleteEntityById = function (id) {
        var entity = viewer.entities.getById(id);
        viewer.entities.remove(entity)
    };

    /**
     * 批量按ID删除
     * @param ids
     */
    util.deleteEntityByIdBatch = function (ids) {
        for(var i = 0; i < ids.length ; i++){
            var entity = viewer.entities.getById(ids[i]);
            viewer.entities.remove(entity);
        }
    };

    /**
     * 删除贴地线
     * @param ids
     */
    util.delSolidLine = function(ids) {
        for(var i = 0; i < ids.length ; i++){
            gis.viewer.entities.remove(solidLineIDMap[ids[i]]);
        }
    };

    /**
     * 删除贴地线
     * @param ids
     */
    util.delDashedLine = function(ids) {
        for(var i = 0; i < ids.length ; i++){
            gis.viewer.entities.remove(dashedLineIDMap[ids[i]]);
        }
    };

    /**
     * 圆形贴图
     * @param {String | Number} id - 字符串或者数字
     * @param {Number} lon - longitude 圆心经度
     * @param {Number} lat - latitude 圆心纬度
     * @param {Number} radius - Number in meter 半径（单位米）
     * @param {String} picUrl - String  图片路径字符串
     * @return Cesium.Primitive
     */
    util.addImageByCircle = function (id, lon, lat, radius, picUrl) {
        var circle = new Cesium.GeometryInstance({
            id: id,
            geometry: new Cesium.CircleGeometry({
                center: Cesium.Cartesian3.fromDegrees(lon, lat),
                radius: radius
            })
        });

        return addImageToGeometry(circle, picUrl);
    };

    /**
     * 矩形贴图
     * @param {String | Number} id - 字符串或者数字
     * @param {Number} west - 西
     * @param {Number} south - 南
     * @param {Number} east - 东
     * @param {Number} north - 北
     * @param {String} picUrl - String  图片路径字符串
     */
    util.addImageByRectangle = function (id, west, south, east, north, picUrl) {
        var rectangle = new Cesium.GeometryInstance({
            id: id,
            geometry: new Cesium.RectangleGeometry({
                rectangle: Cesium.Rectangle.fromDegrees(west, south, east, north),
                vertexFormat: Cesium.EllipsoidSurfaceAppearance.VERTEX_FORMAT
            })
        });

        return addImageToGeometry(rectangle, picUrl);
    };

    /**
     * 基础贴图方法
     * @param {Cesium.GeometryInstance} geometryInstance - Cesium.GeometryInstance
     * @param {String} picUrl - String  图片路径字符串
     */
    function addImageToGeometry(geometryInstance, picUrl) {
        return viewer.scene.primitives.add(new Cesium.Primitive({
            geometryInstances: geometryInstance,
            allowPicking: false,
            appearance: new Cesium.EllipsoidSurfaceAppearance({
                material: new Cesium.Material({
                    translucent: true,
                    fabric: {
                        type: 'Image',
                        uniforms: {
                            image: picUrl
                        }
                    }
                })
            })
        }));
    }

    /**
     * 删除贴图
     * @param {Object} imagePrimitive
     */
    util.deleteImage = function (imagePrimitive) {
        scene.primitives.remove(imagePrimitive);
    };

    /**
     * 测距
     * @param {Number} lon1st - 第一点经度
     * @param {Number} lat1st - 第一点维度
     * @param {Number} lon2nd - 第二点经度
     * @param {Number} lat2nd - 第二点维度
     */
    util.distance = function (lon1st, lat1st, lon2nd, lat2nd) {
        var first = Cesium.Cartesian3.fromDegrees(lon1st, lat1st, 0);
        var second = Cesium.Cartesian3.fromDegrees(lon2nd, lat2nd, 0);
        return Cesium.Cartesian3.distance(first, second);
    };

    /**
     * 获取当前可视范围边界
     */
    util.getCurrentCameraViewRectangle = function () {
        var ellipsoid = scene.globe.ellipsoid;

        if (scene.mode == Cesium.SceneMode.SCENE3D) {
            return camera.computeViewRectangle();
        } else {
            var c2 = new Cesium.Cartesian2(0, 0);
            var leftTop = camera.pickEllipsoid(c2, ellipsoid);
            c2 = new Cesium.Cartesian2(scene.canvas.width, scene.canvas.height);
            var rightDown = camera.pickEllipsoid(c2, ellipsoid);

            if (leftTop != null && rightDown != null) { //ignore jslint
                leftTop = ellipsoid.cartesianToCartographic(leftTop);
                rightDown = ellipsoid.cartesianToCartographic(rightDown);
                return new Cesium.Rectangle(leftTop.longitude, rightDown.latitude, rightDown.longitude, leftTop.latitude);
            } else {
                //The sky is visible in 3D
                return null;
            }
        }

    };

    /**
     * 直角坐标转经纬度
     * @param cartesian
     */
    util.cartesianToDegrees = function (cartesian) {
        var cartographic = Cesium.Cartographic.fromCartesian(cartesian);
        cartographic.longitude = Cesium.Math.toDegrees(cartographic.longitude);
        cartographic.latitude = Cesium.Math.toDegrees(cartographic.latitude);
        cartographic.x = cartographic.longitude;
        cartographic.y = cartographic.latitude;
        return cartographic;
    };


    /**
     * 直角坐标转经纬度
     * @param cartesian
     */
    util.cartesianArrayToDegreeArray = function (cartesianArray) {
        var arr = [];
        for (var i = 0; i < cartesianArray.length; i++) {
            arr.push(util.cartesianToDegrees(cartesianArray[i]));
        }
        return arr;
    };

    /**
     * 绘图插件*******************************************************************************
     */
    $.getScript(gis.jsUrlPrefix + "drawler/DrawHelper.js", function () {
        //绘图插件
        var drawHelper = new DrawHelper(viewer);
        //绘制图形缓存
        var primitiveGrahpics = [];
        //绘制图形坐标点
        util.polygonPositions = [];
        //多边形
        util.drawPolygon = function (callback) {
            drawHelper.startDrawingPolygon({
                callback: function (positions) {
                    // console.debug("positions", positions)
                    polygonPositions = positions;
                    var clonedArr = $.extend([], positions);
                    clonedArr.pop();
                    clonedArr.pop();
                    clonedArr.push(clonedArr[0]);

                    if (callback) {
                        callback(clonedArr);
                    }

                    var polygon = new DrawHelper.PolygonPrimitive({
                        positions: positions,
                        material: Cesium.Material.fromType("Color", {
                            color: new Cesium.Color(0.6, 0.6, 0, 0.4),
                            //rimColor: new Cesium.Color(0, 0, 0, 0.4),
                            //width: 0.3
                        })
                    });

                    scene.primitives.add(polygon);
                    polygon.setEditable();
                    primitiveGrahpics.push(polygon);
                    polygon.addListener('onEdited', function (event) {
                        polygonPositions = event.positions;

                        var clonedArr = $.extend([], positions);
                        clonedArr.pop();
                        clonedArr.pop();
                        clonedArr.push(clonedArr[0]);

                        if (callback) {
                            callback(clonedArr);
                        }
                    });
                }
            });
        };

        //圆
        util.drawCircle = function () {
            drawHelper.startDrawingCircle({
                callback: function (center, radius) {
                    var circle = new DrawHelper.CirclePrimitive({
                        center: center,
                        radius: radius,
                        // material: Cesium.Material.fromType(Cesium.Material.RimLightingType)
                        material: Cesium.Material.fromType(Cesium.Material.RimLightingType,
                            {
                                color: new Cesium.Color(255, 255, 0.0, 1),
                                rimColor: new Cesium.Color(255, 255, 1.0, 0.4),
                                width: 0.3
                            })
                    });

                    scene.primitives.add(circle);
                    circle.setEditable();
                    primitiveGrahpics.push(circle);
                }
            });
        };

        /**
         * 折线
         * */
        util.drawLine = function () {
            drawHelper.startDrawingPolyline({
                callback: function (positions) {
                    var polyline = new DrawHelper.PolylinePrimitive({
                        positions: positions,
                        width: 2,
                        material: new Cesium.Material({
                            fabric: {
                                type: "Color",
                                uniforms: {
                                    color: Cesium.Color.RED
                                }
                            }
                        }),
                        geodesic: true
                    });

                    scene.primitives.add(polyline);
                    //			polyline.setEditable();
                    primitiveGrahpics.push(polyline);

                    /*polyline.addListener('onEdited', function(event) {

                     });*/
                }
            });
        };

        //清除所有图形
        util.clearAllDrawed = function () {
            drawHelper.disableAllEditMode();
            for (var i = 0; i < primitiveGrahpics.length; i++) {
                scene.primitives.remove(primitiveGrahpics[i]);
            }

            primitiveGrahpics = [];
        };

        util.clearDrawed = function (drawHelperPrimitive) {
            scene.primitives.remove(drawHelperPrimitive);
            var index = primitiveGrahpics.indexOf(drawHelperPrimitive);
            if (index != -1) {
                primitiveGrahpics.splice(index, 1);
            }
        }
    });

    /**
     * 左键点击获取当前点
     * @param callback
     */
    util.getPoint = function (callback) {
        gis.mouse.registerTempEvent(gis.mouse.eventType.LEFT_CLICK, function (e) {
            var pos = gis.mouse.getCurrentClickedPosition(e);
            var point = {
                longitude: pos.longitude,
                latitude: pos.latitude
            };

            callback(point);
        });
    };


    /**
     * 移动镜头到指定地点
     * @param lon 经度
     * @param lat 纬度
     */
    util.flyToDestination = function (lon, lat, height) {
        viewer.camera.flyTo({
            destination: Cesium.Cartesian3.fromDegrees(lon, lat, height || 10000),
            duration: 1
        });
    };

    /**
     * 回到默认视野
     */
    util.backToDefaultView = function () {
        viewer.camera.flyTo({
            destination: gis.defaultCameraView,
            duration: 1
        });
    };

    /**
     * 切换至2D模式
     */
    util.morphTo2D = function () {
        viewer.scene.morphTo2D(0);
    };

    /**
     * 切换至3D模式
     */
    util.morphTo3D = function () {
        viewer.scene.morphTo3D(0);
    };

    /**
     * 切换至影像图层
     */
    util.switchToImageLayer = function () {
        viewer.imageryLayers.raiseToTop(gis.imageLayer);
    };

    /**
     * 切换至行政区划图层
     */
    util.switchToAdministrativeDivisionsLayer = function () {
        viewer.imageryLayers.raiseToTop(gis.epLayer);
    };

    util.listenerMap = {};
    /**
     * 添加DOM元素到地图
     * @param ele DOM元素或者jQuery元素
     * @param lon 经度
     * @param lat 纬度
     * @param height 离地高度（米）
     */
    util.addHTMLToMap = function ($ele, lon, lat, height) {
        var listener = function () {
            var eleWidth = $ele.width();
            var eleHeight = $ele.height();
            var eleAtl = $ele.data("height");
            var position = Cesium.Cartesian3.fromDegrees(lon, lat, eleAtl);
            var canvasPosition = viewer.scene.cartesianToCanvasCoordinates(position);
            if (Cesium.defined(canvasPosition)) {
                $ele.css("top", canvasPosition.y - eleHeight - 15);
                $ele.css("left", canvasPosition.x - eleWidth + (eleWidth * 0.25));
            }
        };
        listener();
        util.listening();
        $ele.css("position", "absolute");
        var listenerId = "addHTMLToMap_" + util.generateUUID();
        $ele.data("listener", listenerId);

        util.queryAltitude(lon, lat, function (alt) {
            var h = height === undefined ? alt : (alt + height);
            $ele.data("height", h);
            viewer.scene.preRender.addEventListener(listener);
        });

        util.listenerMap[listenerId] = listener;
    };
    /**
     * 创建DOM元素到地图的边框
     */
    util.createHTMLframe = function (eleHtml, title) {
        var frameTitle = title ? title : "详情";
        var bubble = '' +
            '<div class="frame_div">' +
            '<div class="frame_top">' +
            '<li class="frame_title">' + frameTitle + '</li>' +
            '<i class="close_i"></i>' +
            '</div>' +
            '<div class="frame_content">' + eleHtml + '</div>' +
            '</div>';
        return bubble;
    };
    util.listening = function () {
        //监听详情关闭
        $(".frame_div").on("click", ".close_i", function () {
            // $(this).parents(".frame_div").remove();
            util.removeHTMLFromMap($(this).parents(".frame_div"));
        })
        //监听详情关闭
        $(".frame_div1").on("click", function () {
            // $(this).parents(".frame_div").remove();
            util.removeHTMLFromMap($(this));
        })
        //监听详情关闭
        $(".popout-div").on("click", ".closeX", function () {
            // $(this).parents(".frame_div").remove();
            util.removeHTMLFromMap($(this).parents(".popout-div"));
        })
    };
    //清除地图上所有的详情弹框
    util.removeAllHtmlFrame=function()
    {
        util.removeHTMLFromMap($(".frame_div"));
    };
    util.createAnimationHTMLframe=function (eleHtml,title) {

        var  bubble = '' +
            '<div class="frame_div1">' +eleHtml+
            '</div>';
        return bubble;

    }
    util.addAnimationHTMLToMap = function (ele, lon, lat, title, height) {
        var $ele = null,
            bubble = util.createAnimationHTMLframe(ele, title);
        if (ele instanceof $) {
            $ele = bubble;
        } else {
            $ele = $(bubble);
        }

        $ele.appendTo("body");
        util.listening();
        $ele.css("position", "absolute");
        var listenerId = "addHTMLToMap_" + util.generateUUID();
        $ele.data("listener", listenerId);
        var listener = function () {
            var eleWidth = $ele.width();
            var eleHeight = $ele.height();
            var eleAtl = $ele.data("height");
            var position = Cesium.Cartesian3.fromDegrees(lon, lat, eleAtl);
            var canvasPosition = viewer.scene.cartesianToCanvasCoordinates(position);
            if (Cesium.defined(canvasPosition)) {
                $ele.css("top", canvasPosition.y );
                $ele.css("left", canvasPosition.x );
            }
        };
        util.queryAltitude(lon, lat, function (alt) {
            var h = height === undefined ? alt : (alt + height);
            $ele.data("height", h);
            viewer.scene.preRender.addEventListener(listener);
        });
        util.listenerMap[listenerId] = listener;
    };



    /**
     * 添加DOM元素到地图(自动站)
     * @param ele DOM元素或者jQuery元素
     * @param lon 经度
     * @param lat 纬度
     * @param height 离地高度（米）
     */
    util.addHTMLToMapForAutoStation = function (ele, lon, lat, title, height) {
        var $ele = null,
            bubble = util.createHTMLframeForAutoStation(ele);
        if (ele instanceof $) {
            $ele = bubble;
        } else {
            $ele = $(bubble);
        }

        $ele.appendTo("body");
        util.listening();
        $ele.css("position", "absolute");
        var listenerId = "addHTMLToMap_" + util.generateUUID();
        $ele.data("listener", listenerId);

        var listener = function () {
            var eleWidth = $ele.width();
            var eleHeight = $ele.height();
            var eleAtl = $ele.data("height");
            var position = Cesium.Cartesian3.fromDegrees(lon, lat, eleAtl);
            var canvasPosition = viewer.scene.cartesianToCanvasCoordinates(position);
            if (Cesium.defined(canvasPosition)) {
                $ele.css("top", canvasPosition.y - eleHeight + 10);
                $ele.css("left", canvasPosition.x - eleWidth + (eleWidth * 0.25));
            }
        };

        util.queryAltitude(lon, lat, function (alt) {
            var h = height === undefined ? alt : (alt + height);
            $ele.data("height", h);
            viewer.scene.preRender.addEventListener(listener);
        });

        util.listenerMap[listenerId] = listener;
    };

    /**
     * 创建DOM元素到地图的边框
     */
    util.createHTMLframeForAutoStation = function (eleHtml) {
        var bubble = '';
        bubble += '<div class="frame_auto_station"><ul class="frame_auto_station_ul clearfix">'+ eleHtml +'</ul></div>';
        return bubble;
    };
    util.listeningForAutoStation = function () {
        //监听详情关闭
        $(".frame_div").on("click", ".close_i", function () {
            // $(this).parents(".frame_div").remove();
            util.removeHTMLFromMap($(this).parents(".frame_div"));
        })
    };


    /**
     *  移除地图上的HTML元素和相关事件
     * @param ele
     */
    util.removeHTMLFromMap = function (ele) {
        var $ele = null;

        if (ele instanceof $) {
            $ele = ele;
        } else {
            $ele = $(ele);
        }

        var listenerId = ele.data("listener");

        $ele.remove();
        viewer.scene.preRender.removeEventListener(util.listenerMap[listenerId]);
        delete util.listenerMap[listenerId];
    };


    /**
     * 查询指定经纬度海拔高度
     * @param lon 经度
     * @param lat 纬度
     * @param callback 回调
     */
    util.queryAltitude = function (lon, lat, callback) {
        var promise = Cesium.sampleTerrain(viewer.terrainProvider, gis.terrainMaxLevel, [Cesium.Cartographic.fromDegrees(lon, lat)]);
        Cesium.when(promise, function (updatedPositions) {
                var altitude = updatedPositions[0].height;
                if (callback) {
                    callback(altitude || 0);
                }
            }
        );
    };

    /**
     * 添加圆柱体
     * @param option
     * @returns {*}
     */
    util.addCylinder = function (option) {
        var opt = $.extend({}, util.addCylinder.DEFAULT_OPTS, option);

        util.queryAltitude(opt.lon, opt.lat, function (alt) {
            gis.viewer.entities.add({
                id: opt.id === undefined ? "cylinder_" + util.generateUUID() : opt.id,
                position: Cesium.Cartesian3.fromDegrees(opt.lon, opt.lat, alt + (opt.val * opt.exaggeration) / 2),
                cylinder: {
                    length: opt.val * opt.exaggeration,
                    topRadius: opt.radius,
                    bottomRadius: opt.radius,
                    material: Cesium.Color.fromCssColorString(opt.color).withAlpha(0.8)
                },
                label: {
                    text: opt.text,
                    horizontalOrigin: Cesium.HorizontalOrigin.LEFT,
                    verticalOrigin: Cesium.VerticalOrigin.BOTTOM
                }
            });
        });

        return opt.id;
    };

    /**
     * @type {{id: number, exaggeration: number, lon: number, lat: number, color: string, val: number}}
     */
    util.addCylinder.DEFAULT_OPTS = {
        id: undefined,
        exaggeration: 100,
        radius: 500,
        lon: 0,
        lat: 0,
        color: "#ff0000",
        val: 0,
        text: ""
    };

    /**
     * 批量添加圆柱体
     * @param datas
     * @returns {Array}
     */
    util.addCylinderBatch = function (datas) {
        var ids = [];

        for (var i = 0; i < datas.length; i++) {
            var obj = datas[i];
            ids.push(util.addCylinder(obj));
        }

        return ids;
    };

    /**
     * 贴地线（近似）
     * @param option 参见util.addGoundClampedLine.DEFAULT_OPTS
     * @param callback
     *
     */
    util.addGoundClampedLine = function (option, callback) {
        var opt = $.extend({}, util.addGoundClampedLine.DEFAULT_OPTS, option);
        var ellipsoid = viewer.scene.globe.ellipsoid;
        var positions = Cesium.Cartesian3.fromDegreesArray(opt.positions);

        var flatPositions = Cesium.PolylinePipeline.generateArc({
            positions: positions,
            granularity: 0.000001
        });

        var cartographicArray = [];
        for (var i = 0; i < flatPositions.length; i += 3) {
            var cartesian = Cesium.Cartesian3.unpack(flatPositions, i);
            cartographicArray.push(ellipsoid.cartesianToCartographic(cartesian));
        }

        Cesium.sampleTerrain(viewer.terrainProvider, gis.terrainMaxLevel, cartographicArray)
            .then(function (raisedPositionsCartograhpic) {

                for (var i = 0; i < raisedPositionsCartograhpic.length; i++) {
                    var pos = raisedPositionsCartograhpic[i];

                    if (pos.height === undefined) {
                        pos.height = 0;
                    }
                }

                var raisedPositions = ellipsoid.cartographicArrayToCartesianArray(raisedPositionsCartograhpic);

                var e = new Cesium.Primitive({
                    geometryInstances: new Cesium.GeometryInstance({
                        geometry: new Cesium.PolylineGeometry({
                            positions: raisedPositions,
                            width: opt.width
                        })
                    }),
                    appearance: new Cesium.PolylineMaterialAppearance({
                        material: Cesium.Material.fromType('Color', {
                            color: Cesium.Color.fromCssColorString(opt.color).withAlpha(opt.opacity)
                        })
                    })
                });

                if (callback) {
                    callback(e);
                }
            });
    };

    util.addGoundClampedLine.DEFAULT_OPTS = {
        id: undefined,
        positions: [],
        color: "#ff0000",
        opacity: 1,
        width: 5
    };

    /**
     * 创建路径对象
     * @param option 参见 Path.DEFAULT_OPTS
     * @returns {Path}
     */
    util.addPath = function (option) {
        return new Path(option);
    };

    function Path(option) {
        var instance = this;
        instance.pathLineCollection = [];
        instance.pathPointCollection = viewer.scene.primitives.add(new Cesium.BillboardCollection({
            scene: viewer.scene
        }));
        instance.deleted = false;
        var opts = instance.opts = $.extend({}, Path.DEFAULT_OPTS, option);

        util.addGoundClampedLine(opts, function (goundClampedLinePrimitive) {
            if (!instance.deleted) {
                viewer.scene.primitives.add(goundClampedLinePrimitive);
                instance.pathLineCollection.push(goundClampedLinePrimitive);
            }
        });

        for (var i = 0; i < opts.positions.length; i += 2) {
            (function () {
                var lon = opts.positions[i];
                var lat = opts.positions[i + 1];
                instance.drawPoint(lon, lat, opts.midwayPointPicWidth, opts.midwayPointPicHeight);
            }());
        }

        instance.onClickLatest = function (e) {
            var picked = viewer.scene.pick(e.position);
            if(picked && picked.primitive){
                if(picked.primitive == instance.latestPointEntity){
                    picked.primitive.dataObj = opts.data;
                    picked.primitive.dataObj.lon=instance.latestPointEntity.lon;
                    picked.primitive.dataObj.lat=instance.latestPointEntity.lat;
                    instance.latestPointEntity.onClickLatest(picked.primitive.dataObj);
                }
            }
        };

        gis.mouse.registerEvent(gis.mouse.eventType.LEFT_CLICK,instance.onClickLatest);
    }

    util.PathPicVerticalOrigin = {
        BASELINE: 2,            //文字基线
        BOTTOM: 1,              //底边
        TOP: -1,                //顶边
        CENTER: 0               //中点
    };

    Path.DEFAULT_OPTS = {
        positions: [],              //路径点[x,y,x,y]
        color: "#ff0000",           //路径线色
        opacity: 1,                 //透明度
        width: 5,                   //宽度（像素）
        imgWidth: 16,                //图片宽度
        imgHeight: 16,               //图片高度
        startPointPic: undefined,   //起始点图片
        startPointPicVerticalOrigin: util.PathPicVerticalOrigin.CENTER, //起始点垂直方向起始点
        endPointPic: undefined,     //最新点/终点图片
        endPointPicVerticalOrigin: util.PathPicVerticalOrigin.CENTER,   //终点垂直方向起始点
        midwayPointPic: undefined,  //中途点图片
        midwayPointPicVerticalOrigin: util.PathPicVerticalOrigin.CENTER,//中途点垂直方向起始点
        midwayPointPicWidth: 12,
        midwayPointPicHeight: 12,
        showMidwayPoint: true,       //是否显示中途点
        data:{},                       //存放对象
        onClickLatest: function () {}
    };

    /**
     * 新增点
     * @param lon   经度
     * @param lat   纬度
     * @param lastPointWidth 上一点宽度
     * @param lastPointHeight 上一点高度
     */
    Path.prototype.addPoint = function (lon, lat, lastPointWidth, lastPointHeight) {
        var instance = this;
        var opts = $.extend({}, instance.opts);
        instance.opts.positions.push(lon);
        instance.opts.positions.push(lat);
        var positionSize = instance.opts.positions.length;
        if (positionSize >= 4) {
            var lastLon = instance.opts.positions[positionSize - 4];
            var lastLat = instance.opts.positions[positionSize - 3];
            opts.positions = [lastLon, lastLat, lon, lat];
            instance.drawLine(opts);
        }

        instance.drawPoint(lon, lat, lastPointWidth, lastPointHeight);
    };

    Path.prototype.drawLine = function (option) {
        var instance = this;
        util.addGoundClampedLine(option, function (goundClampedLinePrimitive) {
            if (!instance.deleted) {
                viewer.scene.primitives.add(goundClampedLinePrimitive);
                instance.pathLineCollection.push(goundClampedLinePrimitive);
            }
        });
    };

    Path.prototype.drawPoint = function (lon, lat, lastPointWidth, lastPointHeight) {
        var instance = this;

        if (instance.pathPointCollection.length > 1) {
            if (instance.opts.showMidwayPoint) {
                instance.latestPointEntity.image = instance.opts.midwayPointPic || util.canvasMap.DOT;
                instance.latestPointEntity.width = lastPointWidth || instance.opts.midwayPointPicWidth || instance.opts.imgWidth;
                instance.latestPointEntity.height = lastPointHeight || instance.opts.midwayPointPicHeight || instance.opts.imgHeight;
                instance.latestPointEntity.verticalOrigin = instance.opts.midwayPointPicVerticalOrigin;
                delete instance.latestPointEntity.onClickLatest;
            } else {
                instance.pathPointCollection.remove(instance.latestPointEntity);
            }
        }

        var bc = viewer.scene.primitives.add(new Cesium.BillboardCollection({
            scene: viewer.scene
        }));

        var dot = bc.add({
            image: (function () {
                if (instance.pathPointCollection.length === 0) {
                    return instance.opts.startPointPic || util.canvasMap.DOT;
                } else {
                    return instance.opts.endPointPic || util.canvasMap.DOT;
                }
            }()),
            position: Cesium.Cartesian3.fromDegrees(lon, lat),
            width: instance.opts.imgWidth,
            height: instance.opts.imgHeight,
            heightReference:Cesium.HeightReference.CLAMP_TO_GROUND,
            pixelOffset : new Cesium.Cartesian2(0, -5),
            eyeOffset : new Cesium.Cartesian3(0,10,0),
            verticalOrigin: (function () {
                if (instance.pathPointCollection.length === 0) {
                    return instance.opts.startPointPicVerticalOrigin;
                } else {
                    return instance.opts.endPointPicVerticalOrigin;
                }
            }())
            // ,
            // heightReference: Cesium.HeightReference.CLAMP_TO_GROUND
        });

        instance.latestPointEntity = dot;
        instance.latestPointEntity.lon=lon;
        instance.latestPointEntity.lat=lat;
        instance.latestPointEntity.onClickLatest = instance.opts.onClickLatest;

        var oldCollection = instance.pathPointCollection;
        for (var i = 0; i < oldCollection.length; i++) {
            bc.add(oldCollection.get(i));
        }

        viewer.scene.primitives.remove(oldCollection);
        instance.pathPointCollection = bc;

        util.queryAltitude(lon, lat, function (height) {
            if (!instance.deleted) {
                dot.position = Cesium.Cartesian3.fromDegrees(lon, lat, height + 5);
            }
        });
    };

    /**
     * 删除路径
     */
    Path.prototype.delete = function () {
        var instance = this;
        instance.deleted = true;
        viewer.scene.primitives.remove(instance.pathPointCollection);

        for (var i = 0; i < instance.pathLineCollection.length; i++) {
            var line = instance.pathLineCollection[i];
            viewer.scene.primitives.remove(line);
        }

        instance.pathLineCollection = [];

        gis.mouse.unRegisterEvent(gis.mouse.eventType.LEFT_CLICK,instance.onClickLatest);
    };

    /**
     * 计算外接矩形
     * @param points
     */
    util.getBoundingRectangle = function (points) {
        var west = Number.POSITIVE_INFINITY;
        var east = Number.NEGATIVE_INFINITY;
        var south = Number.POSITIVE_INFINITY;
        var north = Number.NEGATIVE_INFINITY;

        for (var i = 0; i < points.length; i++) {
            var p = points[i];

            if (p instanceof Cesium.Cartesian3) {
                west = Math.min(p.x, west);
                east = Math.max(p.x, east);
                south = Math.min(p.y, south);
                north = Math.max(p.y, north);
            } else {
                if (p.longitude === undefined) {
                    throw new Error("数据格式不正确");
                }

                west = Math.min(p.longitude, west);
                east = Math.max(p.longitude, east);
                south = Math.min(p.latitude, south);
                north = Math.max(p.latitude, north);

            }
        }

        return {
            west: west,
            east: east,
            south: south,
            north: north
        }
    };

    /**
     * 多边形面积计算
     * @param points [[lon,lat]...]
     * @param isPlaneMode 是否是平面计算方式（球面 false/平面 true）
     * @return
     */
    util.getPolygonArea = function (points, isPlaneMode) {

        var psLength = points.length;
        if (psLength > 2) {

            if (points[0][0] === points[psLength - 1][0] && points[0][1] === points[psLength - 1][1]) {
                psLength -= 1;
            }

            var mtotalArea = 0;

            if (!isPlaneMode)//经纬度坐标下的球面多边形
            {
                var LowX = 0.0;
                var LowY = 0.0;
                var MiddleX = 0.0;
                var MiddleY = 0.0;
                var HighX = 0.0;
                var HighY = 0.0;

                var AM = 0.0;
                var BM = 0.0;
                var CM = 0.0;

                var AL = 0.0;
                var BL = 0.0;
                var CL = 0.0;

                var AH = 0.0;
                var BH = 0.0;
                var CH = 0.0;

                var CoefficientL = 0.0;
                var CoefficientH = 0.0;

                var ALtangent = 0.0;
                var BLtangent = 0.0;
                var CLtangent = 0.0;

                var AHtangent = 0.0;
                var BHtangent = 0.0;
                var CHtangent = 0.0;

                var ANormalLine = 0.0;
                var BNormalLine = 0.0;
                var CNormalLine = 0.0;

                var OrientationValue = 0.0;

                var AngleCos = 0.0;

                var Sum1 = 0.0;
                var Sum2 = 0.0;
                var Count2 = 0;
                var Count1 = 0;

                var Sum = 0.0;
                var Radius = 6378000;

                for (var i = 0; i < psLength; i++) {
                    if (i == 0) {
                        LowX = points[psLength - 1][0] * Math.PI / 180;
                        LowY = points[psLength - 1][1] * Math.PI / 180;
                        MiddleX = points[0][0] * Math.PI / 180;
                        MiddleY = points[0][1] * Math.PI / 180;
                        HighX = points[1][0] * Math.PI / 180;
                        HighY = points[1][1] * Math.PI / 180;
                    } else if (i == psLength - 1) {
                        LowX = points[psLength - 2][0] * Math.PI / 180;
                        LowY = points[psLength - 2][1] * Math.PI / 180;
                        MiddleX = points[psLength - 1][0] * Math.PI / 180;
                        MiddleY = points[psLength - 1][1] * Math.PI / 180;
                        HighX = points[0][0] * Math.PI / 180;
                        HighY = points[0][1] * Math.PI / 180;
                    } else {
                        LowX = points[i - 1][0] * Math.PI / 180;
                        LowY = points[i - 1][1] * Math.PI / 180;
                        MiddleX = points[i][0] * Math.PI / 180;
                        MiddleY = points[i][1] * Math.PI / 180;
                        HighX = points[i + 1][0] * Math.PI / 180;
                        HighY = points[i + 1][1] * Math.PI / 180;
                    }

                    AM = Math.cos(MiddleY) * Math.cos(MiddleX);
                    BM = Math.cos(MiddleY) * Math.sin(MiddleX);
                    CM = Math.sin(MiddleY);
                    AL = Math.cos(LowY) * Math.cos(LowX);
                    BL = Math.cos(LowY) * Math.sin(LowX);
                    CL = Math.sin(LowY);
                    AH = Math.cos(HighY) * Math.cos(HighX);
                    BH = Math.cos(HighY) * Math.sin(HighX);
                    CH = Math.sin(HighY);


                    CoefficientL = (AM * AM + BM * BM + CM * CM) / (AM * AL + BM * BL + CM * CL);
                    CoefficientH = (AM * AM + BM * BM + CM * CM) / (AM * AH + BM * BH + CM * CH);

                    ALtangent = CoefficientL * AL - AM;
                    BLtangent = CoefficientL * BL - BM;
                    CLtangent = CoefficientL * CL - CM;
                    AHtangent = CoefficientH * AH - AM;
                    BHtangent = CoefficientH * BH - BM;
                    CHtangent = CoefficientH * CH - CM;


                    AngleCos = (AHtangent * ALtangent + BHtangent * BLtangent + CHtangent * CLtangent) / (Math.sqrt(AHtangent * AHtangent + BHtangent * BHtangent + CHtangent * CHtangent) * Math.sqrt(ALtangent * ALtangent + BLtangent * BLtangent + CLtangent * CLtangent));

                    AngleCos = Math.acos(AngleCos);

                    ANormalLine = BHtangent * CLtangent - CHtangent * BLtangent;
                    BNormalLine = 0 - (AHtangent * CLtangent - CHtangent * ALtangent);
                    CNormalLine = AHtangent * BLtangent - BHtangent * ALtangent;

                    if (AM != 0)
                        OrientationValue = ANormalLine / AM;
                    else if (BM != 0)
                        OrientationValue = BNormalLine / BM;
                    else
                        OrientationValue = CNormalLine / CM;

                    if (OrientationValue > 0) {
                        Sum1 += AngleCos;
                        Count1++;

                    } else {
                        Sum2 += AngleCos;
                        Count2++;
                        //Sum +=2*Math.PI-AngleCos;
                    }

                }

                if (Sum1 > Sum2) {
                    Sum = Sum1 + (2 * Math.PI * Count2 - Sum2);
                } else {
                    Sum = (2 * Math.PI * Count1 - Sum1) + Sum2;
                }

                //平方米
                mtotalArea = (Sum - (psLength - 2) * Math.PI) * Radius * Radius;
            } else { //非经纬度坐标下的平面多边形

                var i, j;
                //double j;
                var p1x, p1y;
                var p2x, p2y;
                for (i = psLength - 1, j = 0; j < psLength; i = j, j++) {

                    p1x = points[i][0];
                    p1y = points[i][1];

                    p2x = points[j][0];
                    p2y = points[j][1];

                    mtotalArea += p1x * p2y - p2x * p1y;
                }
                mtotalArea /= 2.0;
            }
            return mtotalArea;
        }
        return 0;
    };


    /**
     * 根据四个角生成地形高度格网
     * @param east
     * @param south
     * @param west
     * @param north
     * @param xInterval
     * @param yInterval
     * @param callback
     */
    util.makeHeightGrid = function (west, south, east, north, xInterval, yInterval, callback) {
        var xCount = Math.ceil((east - west) / xInterval);
        var yCount = Math.ceil((north - south) / yInterval);
        var coordArr = [];
        // var promise = Cesium.sampleTerrain(viewer.terrainProvider, gis.terrainMaxLevel, coordArr);
        var heightGrid = [];

        for (var y = 0; y < yCount; y++) {
            var lat = north - y * yInterval - yInterval / 2;
            for (var x = 0; x < xCount; x++) {
                var lon = west + x * xInterval + xInterval / 2;
                coordArr.push(Cesium.Cartographic.fromDegrees(lon, lat));
            }
        }

        south = north - yInterval * yCount;
        east = west + xInterval * xCount;

        Cesium.sampleTerrain(viewer.terrainProvider, gis.terrainMaxLevel, coordArr)
            .then(function (updatedPositions) {
                    var low = 99999;
                    var lowPos = undefined;
                    var high = -99999;
                    var highPos = undefined;

                    for (var y = 0; y < yCount; y++) {
                        heightGrid[y] = [];
                        for (var x = 0; x < xCount; x++) {
                            var pos = updatedPositions[y * xCount + x];
                            var height = pos.height = Math.round(pos.height).toFixed(0);
                            heightGrid[y].push(height);

                            var tempLow = low;
                            low = Math.min(low, height);
                            if (tempLow !== low) {
                                // lowPos = $.extend({}, pos);
                                lowPos = pos;
                            }

                            var tempHigh = high;
                            high = Math.max(high, height);
                            if (tempHigh !== high) {
                                // highPos = $.extend({}, pos);
                                highPos = pos;
                            }
                        }
                    }

                    callback({
                        grid: heightGrid,
                        east: east,
                        south: south,
                        west: west,
                        north: north,
                        xInterval: xInterval,
                        yInterval: yInterval,
                        xCount: xCount,
                        yCount: yCount,
                        low: {
                            longitude: Cesium.Math.toDegrees(lowPos.longitude),
                            latitude: Cesium.Math.toDegrees(lowPos.latitude),
                            height: lowPos.height
                        },
                        high: {
                            longitude: Cesium.Math.toDegrees(highPos.longitude),
                            latitude: Cesium.Math.toDegrees(highPos.latitude),
                            height: highPos.height
                        }
                    });
                }
            );

    };

    /**
     * 替换当前贴图图层的url,让切换更自然
     * @param layerObj  当前贴图图层对象
     * @param imageUrl  需要替换的图片url
     */
    util.replaceImageUrl = function(layerObj,imageUrl){
        layerObj.appearance.material.uniforms.image = imageUrl;
    };
    /**
     * 画实线（贴地）
     * @param options
     * @param data [lon1,lat1,lon2,lat2] 线经纬度集合
     * @param width Number 实线宽度
     */
    util.solidLineBatch = function(options){
        var opts = $.extend({}, util.solidLineBatch.DEFAULT_OPTS, options);
        var datas = opts.data;
        for(var i = 0; i < datas.length; i++){
            var ele = datas[i];
            if (ele.length == 4) {
                var uid = new Date().getTime() + Math.random();
                solidLineIDMap[uid] = gis.viewer.entities.add({
                    name: 'Blue dashed line',
                    polyline: {
                        positions: Cesium.Cartesian3.fromDegreesArray(ele),
                        width: opts.Width,
                        cornerType: Cesium.CornerType.BEVELED,
                        material: Cesium.Color.RED,
                        outline: true,
                        outlineColor: Cesium.Color.BLUE
                    }
                });
                opts.uids.push(uid);
            }
        }
    };

    util.solidLineBatch.DEFAULT_OPTS = {
        uids: [],
        data: [],
        Width: 4
    };

    /**
     * 画续线（不贴地）
     * @param options
     * @param data [lon1,lat1,lon2,lat2] 线经纬度集合
     * @param width Number 虚线宽度
     */
    util.dashedLineBatch = function(options){
        var opts = $.extend({}, util.dashedLineBatch.DEFAULT_OPTS, options);
        var datas = opts.data;
        for(var i = 0; i < datas.length; i++){
            var ele = datas[i];
            if (ele.length == 4) {
                var uid = new Date().getTime() + Math.random();
                dashedLineIDMap[uid] = gis.viewer.entities.add({
                    name: 'Blue dashed line',
                    polyline: {
                        positions: Cesium.Cartesian3.fromDegreesArray(ele),
                        width: opts.Width,
                        material: new Cesium.PolylineDashMaterialProperty({
                            color: Cesium.Color.RED
                        })
                    }
                });
                opts.uids.push(uid)
            }
        }
    };

    util.dashedLineBatch.DEFAULT_OPTS = {
        uids: [],
        data: [],
        Width: 4
    };

    /**
     * 批量标点（加高度）
     * @param {Array}  data:数据数组
     * @param {String} lonField:数据经度字段名（可不传->默认：longitude）
     * @param {String} latField:数据纬度字段名（可不传->默认：latitude）
     * @param {String} img:图片地址（可不传->默认：白色圆点）
     * @param {String} imgWidth:数据图片宽度（可不传->默认：16）
     * @param {String} imgHeight:数据图片高度（可不传->默认:16）
     * @param {String} type:数据类型，用作图层管理（可不传->默认:marker）
     * @param {Function} onClick:鼠标左单击回调（可不传->默认:空函数）
     * @param {Function} rightClick:鼠标右单击回调（可不传->默认:空函数）
     */
    util.addMakerBatchForTyphoon = function (option) {
        var opt = $.extend({}, util.addMakerBatchForTyphoon.DEFAULT_OPTS, option);
        var datas = opt.data;
        var type = opt.type;
        var layer = util.markerLayer.getLayer(type);
        var altitudeQueryNeededList = [];
        var altitudeQueryNeededDataList = [];

        for (var i = 0; i < datas.length; i++) {
            var data = datas[i];
            var lon = data[opt.lonField];
            var lat = data[opt.latField];

            if (!isNaN(lon) && !isNaN(lat)) {
                if (-180 <= lon && lon <= 180 && -90 <= lat && lat <= 90) {
                 //   altitudeQueryNeededList.push(Cesium.Cartographic.fromDegrees(lon, lat));
                    altitudeQueryNeededDataList.push(data);
                }
            }
        }

        //var promise = Cesium.sampleTerrain(gis.viewer.terrainProvider, gis.terrainMaxLevel, altitudeQueryNeededList);

        //Cesium.when(promise, function (updatedPositions) {
            for (var i = 0; i < altitudeQueryNeededDataList.length; i++) {
                var data = altitudeQueryNeededDataList[i];
                var marker = layer.add({
                    id: type + "_" + util.generateUUID(),
                    position: Cesium.Cartesian3.fromDegrees(
                        altitudeQueryNeededDataList[i][opt.lonField],
                        altitudeQueryNeededDataList[i][opt.latField]),
                    image: altitudeQueryNeededDataList[i].img,
                    height: opt.imgHeight,
                    width: opt.imgWidth
                });

                marker.dataObj = data;
                marker.onClick = opt.onClick;
                marker.rightClick = opt.rightClick;
            }
        //});
    };

    util.addMakerBatchForTyphoon.DEFAULT_OPTS = {
        lonField: "longitude",
        latField: "latitude",
        //img: util.canvasMap.DOT,
        imgWidth: 16,
        imgHeight: 16,
        data: [],
        type: "marker",
        onClick: function () {
        },
        rightClick: function () {
        }
    };

    /**
     * 添加台风范围半径图
     * @param option
     * @returns {*}
     */
    util.addCircleShape2 = function(option) {
        var opt = $.extend({}, util.addCircleShape2.DEFAULT_OPTS, option);
        console.log(opt.ids);
        var uid = new Date().getTime() + Math.random();
        var circleGrahpic = gis.viewer.entities.add({
            id: uid,
            position: Cesium.Cartesian3.fromDegrees(opt.lon,opt.lat),
            ellipse: {
                semiMinorAxis: opt.radius,
                semiMajorAxis: opt.radius,
                material: Cesium.Color.fromCssColorString(opt.color),
                outline: true,
                outlineColor: Cesium.Color.BLACK,
                outlineWidth: 2
            }
        });
        opt.ids.push(uid);
        return circleGrahpic;
    };
    util.addCircleShape2.DEFAULT_OPTS = {
        ids:[],
        lon:0,
        lat:0,
        radius:0,
        color:"#0069ef"
    };
    /**
     * 删除台风范围半径图(根据台风对象)
     * @param ids
     */
    util.delCircleShape = function(ids) {
        for (var i = 0; i < ids.length; i++) {
            var entity = gis.viewer.entities.getById(ids[i]);
            gis.viewer.entities.remove(entity);
        }
    };
    /**
     * 设置地图范围
     * @param ids
     */
    util.setExtent=function (extent) {
        gis.viewer.camera.setView({
            destination : Cesium.Rectangle.fromDegrees(extent[0], extent[1], extent[2], extent[3])
        })
    };

    /**
     * 根据类型获取对应 polyline图层
     * @param type 类型
     * @return {*}
     */
    util.getPolylineLayer=function(type){

        var layer = util.markerLayer.layerMap[type];
        if (!layer) {
            layer = util.markerLayer.layerMap[type] = scene.primitives.add(new Cesium.PolylineCollection());
        }

        return layer;

    };

    util.getLabelLayer= function (type) {
        var layer = util.markerLayer.layerMap[type];
        if (!layer) {
            layer = util.markerLayer.layerMap[type] = scene.primitives.add(new Cesium.LabelCollection());
        }

        return layer;
    }


    util.poltlayername={
        polyline:"poltpolylinelayer",
        point:"poltpointlayer",//线图层
        polygon:util.PolgonLayer=[],//面图层
        lable:"poltlablelayer",


    };

    util.addpoltpoint=function(option) {
        var layer = util.markerLayer.getLayer(util.poltlayername.point);
      layer.add({
            position: Cesium.Cartesian3.fromDegrees(
                option.x,
                option.y,
                option.z),
            image: option.imagesrc,
        });
    }
    //把添加的标绘绘制到cesium中
    util.addPolyline=function(option) {
        var layer = util.getPolylineLayer(util.poltlayername.polyline);
        var material = null
        var color= new Cesium.Color(option.color[0] / 255, option.color[1] / 255, option.color[2] / 255, option.color[3]);
        if (option.cesiumDash == undefined) {
            material = Cesium.Material.fromType('Color', {
                color: color
            })
        }
        else {
            material = Cesium.Material.fromType('PolylineDash', {
                color: color,
                dashPattern:parseInt(option.cesiumDash,2)
            })

        }
        layer.add({
            positions : Cesium.Cartesian3.fromDegreesArrayHeights(option.coods),
            width : option.width,
            material:material
        });
    }

    //添加多边形
    util.addpoltPolygon = function (option) {

        var color= new Cesium.Color(option.color[0] / 255, option.color[1] / 255, option.color[2] / 255, option.color[3]);
        var pimitive=new Cesium.Primitive({
            geometryInstances : new Cesium.GeometryInstance({
                geometry : new Cesium.PolygonGeometry({
                    polygonHierarchy :  new Cesium.PolygonHierarchy(Cesium.Cartesian3.fromDegreesArrayHeights(option.coods)),
                    height: option.z,
                    vertexFormat : Cesium.PerInstanceColorAppearance.VERTEX_FORMAT
                }),
                attributes : {
                    color : Cesium.ColorGeometryInstanceAttribute.fromColor(color)
                }
            }),
            appearance : new Cesium.PerInstanceColorAppearance({
                flat : true,
            })
        });
        scene.primitives.add(pimitive);
        util.poltlayername.polygon.push(pimitive)

    }

    util.addpolttext=function(option){
        var color= new Cesium.Color(option.color[0] / 255, option.color[1] / 255, option.color[2] / 255, option.color[3]);
        var layer = util.getLabelLayer(util.poltlayername.lable);
        layer.add({
            position:Cesium.Cartesian3.fromDegrees(option.x,option.y,option.z),
            fillColor:color ,
            text:option.text,
            font: option.font,
            verticalOrigin: Cesium.VerticalOrigin.CENTER , // 垂直方向以底部来计算标签的位置
            horizontalOrigin: Cesium.HorizontalOrigin.CENTER,
            pixelOffset : new Cesium.Cartesian2(0, 12)
        });
    }

    util.clearpolt=function(){
        util.markerLayer.removeMarkerByType(util.poltlayername.lable);
        util.markerLayer.removeMarkerByType(util.poltlayername.polyline);
        util.markerLayer.removeMarkerByType(util.poltlayername.point);
        for(var i=0;i<util.poltlayername.polygon.length;i++)
        {
            scene.primitives.remove(util.poltlayername.polygon[i])
        }
        util.poltlayername.polygon=[];

    }

    util.clusterLayer={};
    util.clusterLayer.layerMap = {};
    util.clusterLayer.getLayer = function (type) {
        var layer = util.clusterLayer.layerMap[type];
        if (!layer) {
            layer = util.clusterLayer.layerMap[type] = new Cesium.CustomDataSource(type);
           var dataSourcePromise= viewer.dataSources.add(layer);
            dataSourcePromise.then(function(dataSource) {
                var pixelRange = 15;
                var minimumClusterSize = 3;
                var enabled = true;
                dataSource.clustering.enabled = enabled;
                dataSource.clustering.pixelRange = pixelRange;
                dataSource.clustering.minimumClusterSize = minimumClusterSize;
                var removeListener;
                var pinBuilder = new Cesium.PinBuilder();
                // var pin50 = pinBuilder.fromText('50+', Cesium.Color.RED, 48).toDataURL();
                // var pin40 = pinBuilder.fromText('40+', Cesium.Color.ORANGE, 48).toDataURL();
                // var pin30 = pinBuilder.fromText('30+', Cesium.Color.YELLOW, 48).toDataURL();
                // var pin20 = pinBuilder.fromText('20+', Cesium.Color.GREEN, 48).toDataURL();
                // var pin10 = pinBuilder.fromText('10+', Cesium.Color.BLUE, 48).toDataURL();
                var singleDigitPins = new Array(1000);
                for (var i = 0; i < singleDigitPins.length; ++i) {
                    singleDigitPins[i] = pinBuilder.fromText('' + (i + 2), Cesium.Color.VIOLET, 48).toDataURL();
                }
                function customStyle() {
                    if (Cesium.defined(removeListener)) {
                        removeListener();
                        removeListener = undefined;
                    } else {
                        removeListener = dataSource.clustering.clusterEvent.addEventListener(function(clusteredEntities, cluster) {
                            cluster.label.show = false;
                            cluster.billboard.show = true;
                            cluster.billboard.id = cluster.label.id;
                            cluster.billboard.verticalOrigin = Cesium.VerticalOrigin.BOTTOM;

                            // if (clusteredEntities.length >= 50) {
                            //     cluster.billboard.image = pin50;
                            // } else if (clusteredEntities.length >= 40) {
                            //     cluster.billboard.image = pin40;
                            // } else if (clusteredEntities.length >= 30) {
                            //     cluster.billboard.image = pin30;
                            // } else if (clusteredEntities.length >= 20) {
                            //     cluster.billboard.image = pin20;
                            // } else if (clusteredEntities.length >= 10) {
                            //     cluster.billboard.image = pin10;
                            // } else {
                                cluster.billboard.image = singleDigitPins[clusteredEntities.length - 2];
                            // }
                        });
                    }
                    // force a re-cluster with the new styling
                    var pixelRange = dataSource.clustering.pixelRange;
                    dataSource.clustering.pixelRange = 0;
                    dataSource.clustering.pixelRange = pixelRange;
                }
                // start with custom style
                customStyle();

                var handler = new Cesium.ScreenSpaceEventHandler(viewer.scene.canvas);
                handler.setInputAction(function(movement) {
                    var pickedLabel = viewer.scene.pick(movement.position);
                    if (Cesium.defined(pickedLabel)) {
                        var ids = pickedLabel.id;
                        if (Cesium.isArray(ids)) {
                            for (var i = 0; i < ids.length; ++i) {
                                ids[i].billboard.color = Cesium.Color.RED;
                            }
                        }
                    }
                }, Cesium.ScreenSpaceEventType.LEFT_CLICK);
            });
        }
        return layer;
    };

    util.addclusterPoints = function (option) {
        var opt = $.extend({}, util.addMakerBatch.DEFAULT_OPTS, option);
        var datas = opt.data;
        var type = opt.type;
        var layer = util.clusterLayer.getLayer(type);
        var altitudeQueryNeededDataList = [];

        for (var i = 0; i < datas.length; i++) {
            var data = datas[i];
            var lon = data[opt.lonField];
            var lat = data[opt.latField];

            if (!isNaN(lon) && !isNaN(lat)) {
                if (-180 <= lon && lon <= 180 && -90 <= lat && lat <= 90) {
                    altitudeQueryNeededDataList.push(data);
                }
            }
        }
        for (var i = 0; i < altitudeQueryNeededDataList.length; i++) {
            var data = altitudeQueryNeededDataList[i];
            marker=layer.entities.add({
                id: type + "_" + util.generateUUID(),
                position: Cesium.Cartesian3.fromDegrees(
                    altitudeQueryNeededDataList[i][opt.lonField],
                    altitudeQueryNeededDataList[i][opt.latField]),
                billboard:
                    {
                        image: opt.img,
                        height: opt.imgHeight,
                        heightReference:Cesium.HeightReference.CLAMP_TO_GROUND,
                        width: opt.imgWidth,
                        // dataObj:data,
                        // onClick:opt.onClick

                }
            });
            marker.dataObj = data;
             marker.onClick = opt.onClick;
             marker.rightClick = opt.rightClick;
        }

    };

    return util;

}));
