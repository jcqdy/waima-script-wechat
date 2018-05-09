//index.js
//获取应用实例
const app = getApp()

import { commonModel } from "../../models/commonModel"
import Utils from "../../utils/utils"

Page({
  data: {
    collectionData: null,
    name: null,
    showFolderNameEdit: false,
    from: null,
    showEmpty: false
  },

  scriptId: "",
  sp: 0, 
  num: 30,
  folderName: "",
  hasMore: true,
  loading: false,

  onShareAppMessage: function(res) {
    return Utils.share
  },

  onLoad: function(options){
    let item = JSON.parse(options.item)
    this.scriptId = item.scriptId
    wx.setNavigationBarTitle({
      title: item.scriptName
    })

    if (options.from) {
      this.setData({
        from: options.from
      }) 
    }

    this.doRequest()
  },

  resetLoadingStatus: function() {
    wx.stopPullDownRefresh()
    this.loading = false
    Utils.hideLoading()
  },

  doRequest: function(refresh) {

    if (this.loading == true) {
      wx.stopPullDownRefresh()
      return
    }

    this.loading = true

    Utils.showLoading('加载中...')
    commonModel.fetchNotesOfScript({sp: this.sp, num: this.num, scriptId: this.scriptId}).then(res => {

      this.resetLoadingStatus()
      wx.stopPullDownRefresh()

      this.sp = res.data.data.sp
      let data = this.data.collectionData

      if (data == null || refresh) {
        data = res.data.data.items
      }else {
        data.note.concat(res.data.data.items.note)
        if (res.data.data.items.note.length <= 0) {
          this.hasMore = false
        }
      }

      data.note.map((obj, index) => {
            let markJson = obj.mark.length > 0?JSON.parse(obj.mark):obj.mark
            let key = obj.markId[0]
            let markText = markJson[key]
            obj.markText = markText
            obj.markJson = markJson
      })

      this.setData({
        collectionData: data,
        hasNoData: data.note.length > 0?false:true,
        showEmpty: (this.data.from == 'script' && data.note.length <= 0)?true:false
      })

    }).catch(e => {
      wx.stopPullDownRefresh()
      this.resetLoadingStatus()
    })
  },

  onPullDownRefresh: function() {
    this.sp = 0
    this.hasMore = true
    this.doRequest(true)
  },

  onReachBottom: function() {
    if (this.hasMore) {
      this.doRequest()
    }
  },

  deleteMaterial: function(event) {

    if (this.loading == true) {
        return
    }
    this.loading = true

    let index = event.currentTarget.dataset.index
    let collectionData = this.data.collectionData
    let deleteNote = collectionData.note.splice(index, 1)[0]

    wx.showModal({
      title: '提示',
      content: '确定要删除此条笔记？',
      confirmColor: "#3883EB",
      success: res => {
        if (res.confirm) {

          Utils.showLoading('删除中...')
          commonModel.deleteNoteMark({noteId: deleteNote.noteId}).then(res1 => {
                this.loading = false
                wx.hideLoading()
                Utils.showToast('删除成功', true)
                this.setData({
                    collectionData: collectionData
                })

                let pages = getCurrentPages()
                let prevPage = pages[pages.length - 2]
                if (prevPage.route == "pages/article/article") {
                  let arr = prevPage.data.arr
                  deleteNote.markId.map((obj, index) => {
                    arr[Number(obj)].note = null
                  })

                  prevPage.setData({
                    arr: arr
                  })

                }

          }).catch(e => {
            this.loading = false
            Utils.showLoading('删除中...')
            Utils.showToast('删除失败，请稍后重试', false)
          })

        } else if (res.cancel) {
            this.loading = false
        }
      }

    })
    
  },

  gotoNoteDetail: function(event) {
    let data = event.currentTarget.dataset.data
    data.scriptName = this.data.collectionData.script.scriptName
    data.coverUrl = this.data.collectionData.script.coverUrl
    let dataString = JSON.stringify(data)
    app.dataString = dataString
    wx.navigateTo({
      url: '../noteDetail/noteDetail?writer=' + JSON.stringify(this.data.collectionData.script.writer)
    })
  }

})
