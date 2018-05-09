//index.js
//获取应用实例
const app = getApp()

import { userModel } from "../../models/userModel"
import Utils from "../../utils/utils"

Page({
  data: {
    userInfo: {}
  },

  phoneNum: "",

  onShareAppMessage: function(res) {
    return Utils.share
  },

  onLoad: function(options) {
    let userInfo = JSON.parse(options.userInfo)
    this.setData({
      userInfo: userInfo
    })
    this.phoneNum = userInfo.phoneNum
  },

  phoneChange: function(event) {
    this.phoneNum = event.detail.value
  },

  updateInfo: function(event) {
    let num = Number(this.phoneNum)
    if (!isNaN(num) && this.phoneNum.length == 11) {
      wx.showLoading({
        title: '更新中...',
        mask: true
      })
      userModel.updateUserInfo({phoneNum: this.phoneNum}).then(res => {
        wx.hideLoading()
        wx.showToast({
          title: '保存成功',
          icon: 'success',
          duration: 2000
        })

        let pages = getCurrentPages()
        let prevPage = pages[pages.length - 2]
        if (prevPage.route == "pages/profile/profile") {
          let userData = prevPage.data.userData
          userData.userInfo.phoneNum = num

          prevPage.setData({
            userData: userData
          })

        }

        setTimeout(function() {
          wx.navigateBack()
        }, 2000)

      }).catch(e => {
        wx.showToast({
          title: '更新失败，请稍后重试',
          icon: 'none',
          duration: 2000
        })
        wx.hideLoading()
      })

    }else {
      wx.showModal({
        title: '提示',
        content: '手机号码格式错误',
        showCancel: false
      })
    }


  }

})
