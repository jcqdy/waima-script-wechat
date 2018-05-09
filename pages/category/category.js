//index.js
//获取应用实例
const app = getApp()

import { commonModel } from '../../models/commonModel'
import Utils from '../../utils/utils'

Page({
  data: {
    imageView: app.imageView.imageView,
    items: [],
    title: "",
    category:[],
    selectedId: null
  },

  sp:0,
  num:30,
  loading: false,
  hasMore: true,

  onShareAppMessage: function(res) {
    return Utils.share
  },

  onLoad: function(options){
    wx.setNavigationBarTitle({
        title: "剧本分类"
    })
    let category = JSON.parse(options.category)
    category.map(obj => {
        obj['scrollId'] = 'type' + obj.typeId
    })
    let index = options.index || 0
    index = Number(index)
    this.setData({
      category: category,
      selectedId: category[index]["typeId"],
      currentScrollId: 'type' + category[index]["typeId"]
    })
    this.doRequest(category[index]["typeId"])
  },

  switchType: function(event) {
    let id = event.currentTarget.dataset.typeid
    if (id == this.data.selectedId || this.laoding) {
        return
    }

    this.resetPageStatus()

    wx.pageScrollTo({
        scrollTop: 0,
        duration: 0
    })

    this.setData({
        selectedId: id,
        items: []
    })
    this.doRequest()
  },

  resetPageStatus: function() {
    this.sp = 0
    this.hasMore = true
  },

  resetLoadingStatus: function() {
      wx.stopPullDownRefresh()
      this.loading = false
  },

  assembleData: function(res) {
        let list = res.data.data.items.scriptList
        if (list.length <= 0) {
            this.hasMore = false
            return
        }
        list.map((obj, index) => {
            obj.scriptTypeString = obj.scriptType.join(' / ')
            obj.writerString = obj.writer.join(' / ')
        })
        this.sp = res.data.data.sp
        this.setData({
            items: this.data.items.concat(list)
        })
  },

  doRequest: function(typeId) {
      if (this.loading == true) {
          wx.stopPullDownRefresh()
          return
      }
      this.loading = true
    commonModel.fetchScriptList({
        typeId: this.data.selectedId,
        sp: this.sp,
        num: this.num
    }).then(res => {

        this.assembleData(res)
        this.resetLoadingStatus()

    }).catch(e => {
        this.resetLoadingStatus()
    }) 
  },

  onPullDownRefresh: function() {
    this.resetPageStatus()
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
  }

})
