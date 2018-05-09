"use strict"

class JwxAPIs {

    static sJwxAPIs = null

    // 网络状态
    getNetworkType = "getNetworkType"
    onNetworkStatusChange = "onNetworkStatusChange"

    // 用户登录
    login = "login"
    getUserInfo = "getUserInfo"

    // 打开设置
    openSetting = "openSetting"

    // 定位
    getLocation = "getLocation"

    // 照片处理
    previewImage = "previewImage"
    downloadFile = "downloadFile"
    saveImageToPhotosAlbum = "saveImageToPhotosAlbum"
    removeSavedFile = "removeSavedFile"
    getImageInfo = "getImageInfo"

    // 照片文件选择上传下载
    getImageInfo = "getImageInfo"
    chooseImage = "chooseImage"

    // 拨打电话
    makePhoneCall = "makePhoneCall"

    // 保存联系人
    addPhoneContact = "addPhoneContact"

    // 定位
    authorize = "authorize"

    // 弹框
    showModal = "showModal"
    showLoading = "showLoading"
    hideLoading = "hideLoading"
    showToast = "showToast"

    // 路由导航
    navigateTo = "navigateTo"
    redirectTo = "redirectTo"
    navigateBack = "navigateBack"

    setNavigationBarTitle = "setNavigationBarTitle"

    // 多选器
    showActionSheet = "showActionSheet"

    // 缓存处理
    setStorageSync = "setStorageSync"
    getStorageSync = "getStorageSync"
    setStorage = "setStorage"
    getStorage = "getStorage"
    removeStorage = "removeStorage"


    static sharedInstance() {
        if (JwxAPIs.sJwxAPIs == null) {
            JwxAPIs.sJwxAPIs = new JwxAPIs()
        }
        return JwxAPIs.sJwxAPIs
    }

    constructor() {

    }

    hookFunc = (newFunc, oldFunc) => {
        newFunc()
        oldFunc()
    }

    apiPromise(method, param) {
        return new Promise((resolve, reject) => {
            var obj = Object.assign({
                success: resolve,
                fail: reject
            }, param || {})
            wx[method](obj)
        })
    }

    api(methodName, param) {
        return this.apiPromise(methodName, param)
    }

    apiSync(methodName, param) {
        return wx[methodName](param || {})
    }
}

module.exports = {
    Jwx: JwxAPIs.sharedInstance()
}