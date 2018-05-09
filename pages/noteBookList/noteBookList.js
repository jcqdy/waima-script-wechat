//index.js
//获取应用实例
const app = getApp()

import { commonModel } from "../../models/commonModel"
import Utils from "../../utils/utils"

Page({
    data: {
        imageView: app.imageView.imageView,
        list: null
    },

    isLoading: false,

    onShareAppMessage: function(res) {
        return Utils.share
    },

    onLoad: function(options) {
        if (this.isLoading) return
        this.doRequest()
    },

    doRequest: function() {
        this.isLoading = true
        Utils.showLoading('加载中...')
        commonModel.fetchBookOfNotes().then(res => {
            Utils.hideLoading()
            this.isLoading = false
            wx.stopPullDownRefresh()
            this.setData({
                list: res.data.data
            })
        }).catch(e => {
            Utils.hideLoading()
            this.isLoading = false
            wx.stopPullDownRefresh()
        })
    },

    onPullDownRefresh: function() {
        if (this.isLoading) return
        this.doRequest()
    },

    gotoNoteList: function(event) {
        let item = event.currentTarget.dataset.item
        wx.navigateTo({
            url: '../noteList/noteList?item=' + JSON.stringify(item)
        })
    },

    gotoRead: function() {
        wx.switchTab({
            url: '../scriptLibrary/scriptLibrary'
        })
    }

})
