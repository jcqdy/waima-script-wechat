//index.js
//获取应用实例

import { commonModel } from '../../models/commonModel'
import Utils from "../../utils/utils"

const app = getApp()

Page({
  data: {
    imageView: app.imageView.imageView,
    imgUrls: [],
    indicatorDots: true,
    autoplay: true,
    interval: 5000,
    duration: 1000,
    banner:[],
    scriptType:[],
    hotScript:[],
    newScript:[],
    searchFixed: false
  },

  onShareAppMessage: function(res) {
    return Utils.share
  },

  onLoad: function() {
    commonModel.fetchScriptStore().then(res => {
        res.data.data.newScript.map((obj, index) => {
            obj.scriptTypeString = obj.scriptType.join(' / ')
            obj.writerString = obj.writer.join(' / ')
        })
        this.setData({
            banner:res.data.data.banner,
            scriptType:res.data.data.scriptType,
            hotScript:res.data.data.hotScript,
            newScript:res.data.data.newScript
        })
        wx.stopPullDownRefresh()
    }).catch(e => {
        wx.stopPullDownRefresh()
    })
  },

  onPullDownRefresh: function() {
    this.onLoad()
  },

  /*goto*/
  gotoCategory: function() {
    wx.navigateTo({
      url: '../category/category?category='+JSON.stringify(this.data.scriptType) 
    })
  },

  gotoCategoryItem: function(event) {
    let index = event.currentTarget.dataset.index
    wx.navigateTo({
      url: '../category/category?category='+JSON.stringify(this.data.scriptType) +'&index=' + index
    })
  },

  gotoHotBook: function() {
    wx.navigateTo({
      url: '../bookList/bookList?type=hot'
    })
  },

  gotoNewBook: function() {
    wx.navigateTo({
      url: '../bookList/bookList?type=new'
    })
  },

  gotoOperationBook: function(event) {
    let item = event.currentTarget.dataset.item
    
    switch (item.gotoType) {
      case 1: //剧本列表
        wx.navigateTo({
          url: '../bookList/bookList?type=operation&opId=' + item.opId
        })
        break;

      case 2: //剧本
        Utils.gotoArticle(item.data)
        break;

      case 3: //H5
        wx.navigateTo({
          url: '../operationWeb/operationWeb?link=' + item.data
        }) 
        break;
    
      default:
        break;
    }
    
  },

  gotoSearch: function() {
    wx.navigateTo({
      url: "../search/search"
    })
  },

  gotoReadBook: function(event) {
    let data = event.currentTarget.dataset.data
    Utils.gotoArticle(data)
  }

})
