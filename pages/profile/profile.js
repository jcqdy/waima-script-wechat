//index.js
//获取应用实例
const app = getApp()

import { userModel } from "../../models/userModel"
import { commonModel } from "../../models/commonModel"
import Utils from "../../utils/utils"

Page({
  data: {
    userInfo: {},
    hasUserInfo: false,
    canIUse: wx.canIUse('button.open-type.getUserInfo'),
    userData: {}
  },

  onShareAppMessage: function(res) {
    return Utils.share
  },

  //事件处理函数
  bindViewTap: function() {
    wx.navigateTo({
      url: '../editProfile/editProfile?userInfo=' + JSON.stringify(this.data.userData.userInfo)
    })
  },

  onPullDownRefresh: function() {
    this.onLoad()
  },

  onShow: function() {
    if (app.globalData.userInfo) {
      
        userModel.fetchUserInfo().then(res => {
            this.setData({
                userData: res.data.data
            })
            wx.stopPullDownRefresh()
        }).catch(e => {
            wx.stopPullDownRefresh()
        })

        this.setData({
            userInfo: app.globalData.userInfo,
            hasUserInfo: true
        })

    }
  },

  onLoad: function () {

    if (app.globalData.userInfo) {
      
        userModel.fetchUserInfo().then(res => {
            this.setData({
                userData: res.data.data
            })
            wx.stopPullDownRefresh()
        }).catch(e => {
            wx.stopPullDownRefresh()
        })

        this.setData({
            userInfo: app.globalData.userInfo,
            hasUserInfo: true
        })

    }else {

        app.userInfoReadyCallback = userInfo => {

            userModel.fetchUserInfo().then(res => {
                this.setData({
                userData: res.data.data
                })
                wx.stopPullDownRefresh()
            }).catch(e => {
                wx.stopPullDownRefresh()
            })

            this.setData({
                userInfo: userInfo,
                hasUserInfo: true
            })
        }
    }

    

  },

  /*事件*/
  gotoNoteList: () => {
    wx.navigateTo({
        url: '../noteBookList/noteBookList'
    })
  },

  gotoCollection: () => {
    wx.navigateTo({
        url: '../collectionFolderList/collectionFolderList'
    })
  }

})
