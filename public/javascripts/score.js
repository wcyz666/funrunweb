/**
 * Created by lenovo on 2015/5/1.
 */


window.onload = function(){
    $("table tr:eq(1)").addClass("active");
    var username = $('#username').text();
    $("tr:contains(" + username +")").addClass("success");
};
