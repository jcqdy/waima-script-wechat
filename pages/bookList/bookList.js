//index.js
//获取应用实例
const app = getApp()

import { commonModel } from '../../models/commonModel'
import Utils from "../../utils/utils"

Page({
  data: {
    imageView: app.imageView.imageView,
    items: [],
    title: ""
  },

  sp:0,
  num:30,
  type:'hot',
  opId: '',
  loading: false,
  hasMore: true,

  onShareAppMessage: function(res) {
    return Utils.share
  },

  onLoad: function(res) {
    this.type = res.type
    let title = ""
    if (this.type == 'hot') {
        title = "热门剧本"
    }else if(this.type == 'operation') {
        this.opId = res.opId
        this.setData({
            backBook: true
        })
    }else {
        title = "新进剧本"
    }
    this.setData({
        title: title
    })
    wx.setNavigationBarTitle({
        title: title
    })

    this.doRequest()
  },

  resetLoadingStatus: function() {
      wx.stopPullDownRefresh()
      this.loading = false
  },

  assembleData: function(res) {
        if (res.data.data.items.length <= 0) {
            this.hasMore = false
            return
        }
        res.data.data.items.map((obj, index) => {
            obj.scriptTypeString = obj.scriptType.join(' / ')
            obj.writerString = obj.writer.join(' / ')
        })
        this.sp = res.data.data.sp
        this.setData({
            items: this.data.items.concat(res.data.data.items)
        })
  },

  doRequest: function() {
      if (this.loading == true) {
          wx.stopPullDownRefresh()
          return
      }
      this.loading = true
      Utils.showLoading("加载中...")
    if (this.type == 'hot') {
        commonModel.fetchHotScript({sp: this.sp, num: this.num}).then(res => {
            wx.hideLoading()
            this.assembleData(res)
            this.resetLoadingStatus()

        }).catch(e => {
            wx.hideLoading()
            this.resetLoadingStatus()
        }) 
    } else if(this.type == 'operation') {
        commonModel.fetchOperationScript({opId: this.opId, sp: this.sp, num: this.num}).then(res => {
            wx.hideLoading()

            this.opId = res.data.data.items.opId
            let title = res.data.data.items.title
            res.data.data.items = res.data.data.items.script
            this.assembleData(res)
            this.resetLoadingStatus()

            wx.setNavigationBarTitle({
                title: title
            })

            this.setData({
                title: title
            })

        }).catch(e => {
            Utils.showModal(e.data.message)
            wx.hideLoading()
            this.resetLoadingStatus()
        }) 
    }else {
        commonModel.fetchNewScript({sp: this.sp, num: this.num}).then(res => {
            wx.hideLoading()
            this.assembleData(res)
            this.resetLoadingStatus()

        }).catch(e => {
            wx.hideLoading()
            this.resetLoadingStatus()
        }) 
    }
  },

  onPullDownRefresh: function() {
    this.sp = 0
    this.hasMore = true
    this.setData({
        items: []
    }, this.doRequest)
  },

  onReachBottom: function() {
    if (this.hasMore) {
        this.doRequest()
    }
  },

  gotoReadBook: function(event) {
    let item = event.currentTarget.dataset.item
    Utils.gotoArticle(item)
  },

  backHome: function() {
    wx.switchTab({
        url: '../scriptLibrary/scriptLibrary'
    })
  }

})
