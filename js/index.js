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

  //新增功能
  //l——>header 隐藏显示
  setTimeout(() => {
    headerDisplayConcealment(80);
  }, 3000);
  $(".header-left-logo").on("click", function() {
    if ($(".GIS-header").width() <= 100) {
        headerDisplayConcealment("100%");
    } else {
        headerDisplayConcealment(80);
    }
  });
  function headerDisplayConcealment(width) {
    $(".GIS-header").stop();
    $(".GIS-header").animate({ width: width }, 1000);
    if (width > 100) {
      $(".middle-content").show();
    } else {
      $(".middle-content").hide();
    }
  }
  //<l——
});
