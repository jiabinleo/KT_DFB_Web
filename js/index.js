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
});
