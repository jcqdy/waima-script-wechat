//index.js
//获取应用实例
const app = getApp()
import { commonModel } from "../../models/commonModel"
import Utils from "../../utils/utils"

Page({
  data: {
    link: null
  },

  onShareAppMessage: function(res) {
    return Utils.share
  },

  onLoad: function(options){
    this.setData({
      link: options.link
    })
  }

})
