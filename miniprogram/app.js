"use strict";
App({
    globalData: {
        ready: false
    },
    onLaunch() {
        if (wx.cloud) {
            wx.cloud.init({
                traceUser: true
            });
        }
        this.globalData.ready = true;
    }
});
