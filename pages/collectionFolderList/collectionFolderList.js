//index.js
//获取应用实例
const app = getApp()

import { userModel } from "../../models/userModel"
import { commonModel } from "../../models/commonModel"
import Utils from "../../utils/utils"

Page({
  data: {
    list: null
  },

  phoneNum: "",

  onShareAppMessage: function(res) {
    return Utils.share
  },

  onLoad: function() {
    wx.showLoading({
        title: '加载中',
    })
    commonModel.fetchCollectFolderList().then(res => {
        this.setData({
            list: res.data.data
        })

        app.globalData.collectFolders = res.data.data

        wx.hideLoading()
      }).catch(e => {
        wx.hideLoading()
      })
  },

  gotoCollction: function(event) {
      let item = event.currentTarget.dataset.item
      wx.navigateTo({
          url: "../markList/markList?item=" + JSON.stringify(item)
      })
  }, 

  onShow: function () {
    this.setData({
        list: app.globalData.collectFolders
    })
  },

  gotoRead: function() {
    wx.switchTab({
        url: '../scriptLibrary/scriptLibrary'
    })
  }

})
