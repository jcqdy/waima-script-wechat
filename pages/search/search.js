//index.js
//获取应用实例
const app = getApp()

import { commonModel } from '../../models/commonModel'
import Utils from "../../utils/utils"

Page({
  data: {
    items: [],
    title: "",
    noData: false
  },

  sp:0,
  num:30,
  type:'hot',
  loading: false,
  hasMore: true,
  keywordsArr: [],

  onShareAppMessage: function(res) {
    return Utils.share
  },

  search: function(event) {
    let tempArr = event.detail.value.split(" ")
    let keywordsArr = []
    tempArr.map((obj, index) => {
        if (obj.length > 0) {
            keywordsArr.push(obj)
        }
    })

    if(keywordsArr.length <= 0) {
        return
    }

    this.sp = 0
    this.hasMore = true
    this.keywordsArr = keywordsArr

    this.setData({
        items:[]
    }, this.doRequest())
    
  },

  doRequest: function() {
    Utils.showLoading("搜索中")
    
    commonModel.search({
        keyword: this.keywordsArr,
        sp: this.sp,
        num: this.num
    }).then(res => {
        wx.pageScrollTo({
            scrollTop: 0,
            duration: 0
        })
        this.assembleData(res)
        this.resetLoadingStatus()
        wx.hideLoading()

    }).catch(e => {
        wx.hideLoading()
    })
  },

  resetLoadingStatus: function() {
      this.loading = false
  },

  assembleData: function(res) {

        let noData = this.data.items.concat(res.data.data.items).length > 0?false:true
        this.sp = res.data.data.sp

        if (noData) {
            this.setData({
                noData: noData
            })
            return
        }

        if (res.data.data.items.length <= 0) {
            this.hasMore = false
            return
        }
        res.data.data.items.map((obj, index) => {
            obj.scriptTypeString = obj.scriptType.join(' / ')
            obj.writerString = obj.writer.join(' / ')
        })

        this.setData({
            items: this.data.items.concat(res.data.data.items),
            noData: noData
        })
  },

  onReachBottom: function() {
    if (this.hasMore) {
        this.doRequest()
    }
  },

  gotoReadBook: function(event) {
      let data = event.currentTarget.dataset.data
      Utils.gotoArticle(data)
  }

})
