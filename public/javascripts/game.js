/**
 * Created by lenovo on 2015/5/2.
 */

var socket;
window.onload = function(){

    var myLib = (function(){

        var qrid = "qrcode",
            curURL = window.location.href,
            roomNum = /^.*\/(.*)$/.exec(window.location.href)[1],
            userName = $("#username").text();

        return {
            roomNum: roomNum,
            username: userName,
            el : function(id, rg){
                var range = rg || document;
                return range.getElementById(id);
            },
            qs : function(selector, rg){
                var range = rg || document;
                return range.querySelector(selector);
            },
            qsa : function(selector, rg){
                var range = rg || document;
                return range.querySelectorAll(selector);
            },
            createNode : function(tag, child, attrs){
                var outerTag = document.createElement(tag);
                var content;
                if (typeof child === "string"){
                    content = document.createTextNode(child);
                    outerTag.appendChild(content);
                }
                else {
                    if (child instanceof Array){
                        for (var _index in child) {
                            var index = parseInt(_index);
                            if (isNaN(_index)) continue;
                            content = child[index];
                            if (typeof content === "string") {
                                content = document.createTextNode(content);
                            }
                            else if (typeof content === "function")
                                continue;
                            outerTag.appendChild(content);
                        }
                    }
                    else{
                        outerTag.appendChild(child);
                    }
                }

                for (var key in attrs) {
                    outerTag.setAttribute(key, attrs[key]);
                }
                return outerTag;
            },
            createQRcode : function(){
                myLib.el(qrid).src = "https://chart.googleapis.com/chart?cht=qr&chs=500x500&chl=" + encodeURIComponent(curURL);
            },
            getCurrentUsers : function() {

            },
            createNewUser: function(user){
                var html = "";
                html += '<li role="presentation" class="active">';
                html += '<h3><span class="label label-default pull-left">' + user + '</span></h3>';
                html += '<button class="btn btn-success pull-right btn-sm" type="button">';
                html += '<span class="glyphicon glyphicon-plus" aria-hidden="true"></span> Friend </button></li>';
                return $(html);
            }
        };
    })();

    (function (){

        socket = io();
        socket.on("newClient", function(newUser){
            $("#players").append(myLib.createNewUser(newUser));
        });

        socket.emit("join", {
            room: myLib.roomNum,
            username: myLib.username
        });
        return {
            init : function () {
                myLib.createQRcode();
                myLib.el('exit').setAttribute("href", "/room/exit/" + myLib.roomNum);
            }
        };
    })().init();
}
