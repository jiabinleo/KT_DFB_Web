$(function() {
  $("#search-popout").load("modules/retrieval/retrievalPopout.html");
  // $("#map-popout").load("modules/mapPopout/mapinfoTemplate.html");
  $(".home-icon")
    .parent()
    .click(function() {
      backToDefaultView();
    });
  $(".map-icon")
    .parent()
    .click(function() {
      switchToAdministrativeDivisionsLayer();
      morphTo2D();
      $(this)
        .find("span")
        .addClass("active");
      $(this)
        .siblings()
        .find("span")
        .removeClass("active");
    });
  $(".satellite-map-icon")
    .parent()
    .click(function() {
      switchToImageLayer();
      morphTo3D();
      $(this)
        .find("span")
        .addClass("active");
      $(this)
        .siblings()
        .find("span")
        .removeClass("active");
    });

  //  新增功能
  //  header隐藏显示
  setTimeout(() => {
    headerDisplayConcealment(80);
  }, 5000);
  $(".header-left-logo").on("click", function() {
    $(".GIS-header").width() <= 100
      ? headerDisplayConcealment("100%")
      : headerDisplayConcealment(80);
  });
  headerDisplayConcealment = width => {
    $(".GIS-header")
      .stop()
      .animate({ width: width }, 1000);
    setTimeout(() => {
      parseInt(width) > 80
        ? $(".middle-content").show()
        : $(".middle-content").hide();
    }, 500);
  };
  //根据id增加区域范围
  var cc = ["basedata_JXIROdAGw6nEecRnI6A8EnDhgp1pTbaF"];
  addCircleShape(cc, 113.971398, 22.565625, 10000, "rgba(1,1,0,0.3)");
  //根据id清除区域范围
  setTimeout(() => {
    delCircleShape(cc);
  }, 5000);
});
