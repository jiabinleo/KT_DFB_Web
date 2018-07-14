$(function(){
    $("#search-popout").load("modules/retrieval/retrievalPopout.html");
    // $("#map-popout").load("modules/mapPopout/mapinfoTemplate.html");
    $(".home-icon").parent().click(function () {
        backToDefaultView()
    });
    $(".map-icon").parent().click(function () {
        switchToAdministrativeDivisionsLayer();
        morphTo2D();
        $(this).find("span").addClass("active");
        $(this).siblings().find("span").removeClass("active");
    });
    $(".satellite-map-icon").parent().click(function () {
        switchToImageLayer();
        morphTo3D();
        $(this).find("span").addClass("active");
        $(this).siblings().find("span").removeClass("active");
    });
});

