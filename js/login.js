/**
 * 登录
 */
$(document).ready(function() {
    $.support.cors = true;

    //$("#username").prop("disabled", true);
    $("#password").focus();

    var userName = getUrlParam("userName")
    if(userName){
        $("#username").val(userName);

        var param = {"username":userName,"password":""};
        param = JSON.stringify(param);
        window.localStorage.setItem("param",param);
    }else {
        if (window.localStorage.getItem("param") != null) {
            var param = window.localStorage.getItem("param");
            param = JSON.parse(param);
            $("#username").val(param.username);
            $("#password").val(param.password);
        }
    }

	$("#login_form input[type='text']").focus(function(){
        $(".error_message").hide();
	});
	$("#login").click(butSubmit);
});
function onkey(){
	if (event.keyCode == "13") {// keyCode=13是回车键
		 $('#login').click();
	}
}
function butSubmit() {
    $(".error_message").empty();
	var userName = $("#username").val();
	var passWord = $("#password").val();
	if(userName==null||userName==""||userName==undefined){
        $(".error_message").show().html("用户名不能为空");
        return;
	}
    if(passWord==null||passWord==""||passWord==undefined){
        $(".error_message").show().html("密码不能为空");
        return;
    }
    var param = {"username":userName,"password":passWord};
    param = JSON.stringify(param);
    window.localStorage.setItem("param",param);
	$.ajax({
        url : sysConfig.header+"/uaa/login",
        type : "post",
        data : {
            username:userName,
            password:passWord
        },
        async:true,
        success : function(obj) {
            //console.info(obj);
            if (obj.success == false) {
                $(".error_message").show().html(obj.msg);
            } else {
                testajx();
            }
        }
    })
}

//跳转到指定页面
function gotoPageAfterLogin(){
	//获取url参数
	var toPage = getUrlParam('toPage');
	//console.log(toPage);
 	if(null ==toPage){
  		toPage = 'index.html';
 	}
 	window.location.href = toPage;
}

function testajx(){
    $.ajax({
        url : sysConfig.header+"/user/user/getLoggedInUser",
        type: "get",
        dataType: "json",
        success: function(data){
          	gotoPageAfterLogin();
        },
        error:function (data) {
            gotoPageAfterLogin();
        }
    })
}