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
    showFolderNameEditData: {},
    hasNoData: false
  },

  pkgId: "",
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
    this.pkgId = item.pkgId
    this.setData({
      name: item.name,
      showFolderNameEditData: {
        title: '修改收藏夹名',
        placeholder: '输入收藏夹名',
        cancelName: '取消',
        confirmName: '确定',
        value: item.name
      }
    })
    wx.setNavigationBarTitle({
      title: item.name
    })
    this.doRequest()
  },

  resetLoadingStatus: function() {
    wx.stopPullDownRefresh()
    this.loading = false
  },

  doRequest: function(refresh) {

    if (this.loading == true) {
      wx.stopPullDownRefresh()
      return
    }

    this.loading = true

    if(refresh && this.data.hasNoData) {
      this.setData({
        hasNoData: false
      })
    }

    commonModel.fetchCollectList({sp: this.sp, num: this.num, pkgId: this.pkgId}).then(res => {

      this.resetLoadingStatus()

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
        hasNoData: data.note.length > 0?false:true
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

  inputChange: function(event) {
    this.folderName = event.detail.value
  },

  inputConfirm: function(event) {
    this.folderName = event.detail.value
    this.saveFolderName()
  },

  saveFolderName: function() {
    if (this.folderName.length <= 0 ) {
      Utils.showToast('文件夹名称不能为空')
      return
    }

    wx.showLoading({
      title: '修改中...',
    })
    commonModel.editPkgName({pkgId: this.pkgId, pkgName: this.folderName}).then(res => {
        wx.hideLoading()

        Utils.showToast("修改成功", true)

        this.setData({
            name: this.folderName,
            showFolderNameEdit: false,
            showFolderNameEditData: {
                title: '修改收藏夹名',
                placeholder: '输入收藏夹名',
                cancelName: '取消',
                confirmName: '确定',
                value: this.folderName
            }
        })

        wx.setNavigationBarTitle({
            title: this.folderName
        })

        app.globalData.collectFolders.map((obj, index) => {
            if (obj.pkgId == this.data.collectionData.package.pkgId) {
                obj.name = this.folderName
            }
        })

        this.folderName = ''

    }).catch(e => {
        wx.hideLoading()
        Utils.showToast('修改失败，请稍后重试')
    })
    
  },

  editFolder: function() {
    wx.showActionSheet({
        itemList: ['修改收藏夹名', '删除收藏夹'],
        success: (res) => {
            switch (res.tapIndex) {
                case 0:
                    this.setData({
                        showFolderNameEdit: true
                    })
                    break;

                case 1:

                    wx.showModal({
                        title: '提示',
                        content: '删除收藏夹后，收藏夹内的素材也会被自动删除',
                        cancelColor: '#1971E9',
                        confirmColor: "#EA4F62",
                        showCancel: true,
                        success: (res) => {
                            if (res.confirm) {
                                Utils.showLoading('删除中...')
                                commonModel.deleteColletFolder({
                                    pkgId: this.pkgId
                                }).then(res => {
                                    Utils.showToast('删除成功', true)
                                    Utils.hideLoading()

                                    app.globalData.collectFolders = app.globalData.collectFolders.filter((obj, index) => {
                                        return obj.pkgId != this.data.collectionData.package.pkgId
                                    })

                                    wx.navigateBack()

                                }).catch(e => {
                                    Utils.showToast('删除失败，请稍后重试')
                                })
                            }
                        }
                    })

                    break;
            
                default:
                    break;
            }
        }
    })
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
    let deleteNote = collectionData.note.splice(index, 1)

    wx.showModal({
      title: '提示',
      content: '确定要删除此条收藏？',
      confirmColor: "#3883EB",
      success: res => {
        if (res.confirm) {

          Utils.showLoading('删除中...')
          commonModel.collectDel({noteId: deleteNote[0].noteId, pkgId: this.pkgId}).then(res1 => {
                this.loading = false
                wx.hideLoading()
                Utils.showToast('删除成功', true)
                this.setData({
                    collectionData: collectionData
                })

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
    let note = event.currentTarget.dataset.data
    let dataString = JSON.stringify(note)
    app.dataString = dataString
    wx.navigateTo({
      url: '../noteDetail/noteDetail?writer=' + JSON.stringify(note.writer)
    })
  },

  promptCancel: function() {
      this.setData({
        showFolderNameEdit: false,
      })
  },

  promptConfirm: function() {
      this.saveFolderName()
  },

  promptInputChange: function(e) {
    this.folderName = e.detail.value
  }

})
