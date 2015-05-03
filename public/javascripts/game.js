/**
 * Created by lenovo on 2015/5/2.
 */
var myLib = (function(){

    var qrid = "qrcode";
    var curURL = window.location.href;

    return {
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
        getList : function(){
            var list = JSON.parse(window.localStorage.getItem("playlist")) || {};
            return list[roomNum] || {};
        },
        removeList : function(){
            var list = JSON.parse(window.localStorage.getItem("playlist")) || {};
            delete(list[roomNum]);
            window.localStorage.setItem("playlist", JSON.stringify(list));
        },
        saveList : function(list){
            var originList = JSON.parse(window.localStorage.getItem("playlist")) || {};
            originList[roomNum] = list;
            window.localStorage.setItem("playlist", JSON.stringify(originList));
        },
        removeItem : function (id){
            var list = this.getList();
            delete(list[id]);
            this.saveList(list);
        },
        saveItem : function (id, title){
            var list = this.getList();
            list[id] = title;
            this.saveList(list);
        },
        ajax : function(opt) {
            opt = opt || {};
            var xhr = (window.XMLHttpRequest)
                    ? new XMLHttpRequest()
                    : new ActiveXObject("Microsoft.XMLHTTP"),
                async = opt.async !== false,
                success = opt.success || null,
                error = opt.error || function(){alert('AJAX Error: ' + this.status)};

            xhr.open(opt.method || 'GET', opt.url || '', async);

            if (opt.method == 'POST')
                xhr.setRequestHeader("Content-Type", "application/x-www-form-urlencoded");

            if (async)
                xhr.onreadystatechange = function(){
                    if (xhr.readyState == 4) {
                        var status = xhr.status, response = xhr.responseText;
                        if ((status >= 200 && status < 300) || status == 304 || status == 1223) {
                            success && success(response);
                        } else if (status >= 500)
                            error();
                    }
                };
            xhr.onerror = function(){error()};

            xhr.send(opt.data || null);
        },
        createQRcode : function(){
            myLib.el(qrid).src = "https://chart.googleapis.com/chart?cht=qr&chs=500x500&chl=" + encodeURIComponent(curURL);
        }
    };
})();

(function (){

    


    return {
        init : function () {
            myLib.createQRcode();
        }
    };
})().init();
