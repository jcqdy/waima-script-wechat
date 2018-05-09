//app.js

import { Jwx } from '/utils/JwxAPIs.js'
import { Lan } from '/localize/Localize.js'
import Utils from "./utils/utils"
import { userModel } from "./models/userModel"

App({
  onLaunch: function () {

    // 登录
    var wxLogin = () => {
        wx.showLoading({
            title: Lan.loading
        })

        Jwx.api(Jwx.login).then(res => {
            return userModel.login({code: res.code})
        }).then(res => {
            wx.hideLoading()
            let userInfo = Object.assign({}, res.data.data)
            this.globalData.userInfo = userInfo
            getSetting()
        }).catch(e => {
            wx.hideLoading()
            Utils.showModal("网络请求失败，请检查后重试", false, () => {
                wxLogin()
            })
        })
    }

    wxLogin()

    var getSetting = () => {
        wx.getSetting({
            success: res => {
                wx.getUserInfo({
                    success: res => {
                    // 可以将 res 发送给后台解码出 unionId
                        const { version, platform, screenWidth, screenHeight, windowWidth, windowHeight } = wx.getSystemInfoSync()
                        this.globalData.userInfo = Object.assign(this.globalData.userInfo, res.userInfo)
                        this.globalData.appVersion = version
                        this.globalData.platform = platform
                        this.globalData.screenWidth = screenWidth
                        this.globalData.screenHeight = screenHeight
                        this.globalData.windowWidth = windowWidth
                        this.globalData.windowHeight = windowHeight

                        //更新用户信息
                        userModel.updateUserInfo(this.globalData.userInfo).then(res => {
                    
                        }).catch(e => {
    
                        })
            
                        // 由于 getUserInfo 是网络请求，可能会在 Page.onLoad 之后才返回
                        // 所以此处加入 callback 以防止这种情况
                        if (this.userInfoReadyCallback) {
                            this.userInfoReadyCallback(this.globalData.userInfo)
                        }

                        if (this.userInfoReadyCallbackForShelf) {
                            this.userInfoReadyCallbackForShelf(this.globalData.userInfo)
                        }

                        if (this.userInfoReadyCallbackForArticle) {
                            this.userInfoReadyCallbackForArticle(this.globalData.userInfo)
                        }

                    }
                })
            }
        })
    }
    
  },

  globalData: {
    userInfo: null,
    appName:"waima-script",
    appVersion: "1.0",
    platform: null,
    screenWidth: 0,
    screenHeight: 0,
    windowWidth: 0,
    windowHeight: 0,
    collectFolders:[]
  },

  imageView:{
    "imageView": "?imageView2/2/w/156/"
  }

})