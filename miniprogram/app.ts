const CLOUD_ENV_ID = "cloud1-0g3vpd264b6a9222";

App({
  globalData: {
    ready: false
  },
  onLaunch() {
    if (wx.cloud) {
      wx.cloud.init({
        env: CLOUD_ENV_ID,
        traceUser: true
      });
    }

    this.globalData.ready = true;
  }
});
