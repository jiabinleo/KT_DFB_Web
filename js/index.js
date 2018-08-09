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
  //——>header 隐藏显示
  setTimeout(() => {
    $(".GIS-header").animate({ width: 80 }, 1000);
    $(".middle-content").hide();
  }, 3000);
  $(".header-left-logo").on("click", function() {
    $(".GIS-header").stop();
    if ($(".GIS-header").width() <= 100) {
      $(".GIS-header").animate({ width: "100%" }, 1000);
      $(".middle-content").show();
    } else {
      $(".GIS-header").animate({ width: 80 }, 1000);
      $(".middle-content").hide();
    }
  });
  //<——
  
});
