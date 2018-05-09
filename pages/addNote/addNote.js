//index.js
//获取应用实例
const app = getApp()

import { commonModel } from "../../models/commonModel"
import Utils from "../../utils/utils"

Page({
  data: {
    imageView: app.imageView.imageView,
    article: {},
    note: null,
    selectedArr: [],
    collected: false,
    markText: "",
    editDisable: true,
    folders: null,
    createFolderInputDefaultValue: '',
    folderMaskShow: false,
    showCreateFolder: false,

    showFolderNameEditData: {
        title: '新建收藏夹',
        placeholder: '输入收藏夹名',
        cancelName: '取消',
        confirmName: '确定',
        value: ''
    },

    selectAnimation: {},
    createAnimation: {},

    showSelectListData: {
        title: '选择收藏夹',
        subtitle:'(可将划线剧本与笔记收藏为创作素材在写剧本时作为参考)'
    }
  },

  

  textValue: "",
  folderInputValue: "",
  isLoading: false,
  pkgId:null,

  onShareAppMessage: function(res) {
    return Utils.share
  },


  onLoad: function(options){
    
    let article = JSON.parse(options.article)
    //let selectedArr = JSON.parse(options.selectedArr)
    let selectedArr = app.selectedArr

    wx.setNavigationBarTitle({
        title: article.scriptName
    })

    let markTextArr = []
    selectedArr.map((obj, index) => {
        markTextArr.push(obj.text)
    })

    let markText = markTextArr.join('\n')
    let writer = JSON.parse(options.writer).join(' / ')
    
    this.setData({
        article: article,
        collected: false,
        selectedArr: selectedArr,
        markText: markText,
        writer: writer
    })
  
    // wx.setNavigationBarTitle({
    //   title: res.title || "歪马剧本"
    // })
  },

  edit: function() {
    this.setData({
      textareaDisabled: false
    })
  },

  save: function() {
    if (this.data.editDisable) return
    let value = Utils.trim(this.textValue)
    if (value.length <= 0) {
      Utils.showModal("笔记不能为空")
      return
    }

    let mark = {}
    let markId = []
    this.data.selectedArr.map((obj, index) => {
        mark[obj.id] = obj.text
        markId.push(obj.id)
    })

    Utils.showLoading("保存中...")
    commonModel.addNote({
        scriptId: this.data.article.scriptId, 
        note: value,
        mark: JSON.stringify(mark),
        markId: markId.join(',')
    }).then(res => {
      wx.hideLoading()
      Utils.showToast("保存成功", true)
      let note = res.data.data
      this.setData({
        note: note
      })
      
      if (this.pkgId) {
        this.doSelectFolder(note, this.pkgId)
      }else {
        this.asyncPrevPageData(note)
      }

    }).catch(e => {
      Utils.showModal("修改失败，请稍后重试")
      wx.hideLoading()
    })

  },

  asyncPrevPageData: function(note) {
    let pages = getCurrentPages()
    let prevPage = pages[pages.length - 2]
    if (prevPage.route == "pages/article/article") {
        let arr = prevPage.data.arr
        let articleMessage = prevPage.data.articleMessage
        articleMessage.script.noteMark.push(note)

        arr.map((obj, index) => {
            obj.selected = false
        })

        note.markId.map((id) => {
            arr[Number(id)]['note'] = note
        })

        prevPage.setData({
            selectedArr: [],
            arr: arr,
            articleMessage: articleMessage,
            menuAbleFlag: true
        })
    }

    wx.navigateBack()

  },

  valueChange: function(event) {
    this.textValue = Utils.trim(event.detail.value)
    if (this.textValue.length <= 0) {
        this.setData({
            editDisable: true
        })
    }else {
        this.setData({
            editDisable: false
        })
    } 
  },

  cancelCollect: function() {

    this.setData({
        collected: false
    })

    this.pkgId = null

    // Utils.showLoading("删除中...")
    // commonModel.collectDel({
    //     noteId: this.data.note.noteId,
    //     pkgId: this.data.note.pkgId
    // }).then(res => {
    //     wx.hideLoading()
    //     this.setData({
    //         collected: false
    //     })

    //     let pages = getCurrentPages()
    //     let prevPage = pages[pages.length - 2]
    //     if (prevPage.route == "pages/markList/markList") {
    //         let collectionData = prevPage.data.collectionData
    //         let notes = collectionData.note.filter((obj, index) => {
    //             return obj.noteId != this.data.note.noteId
    //         })

    //         collectionData.note = notes
       
    //         prevPage.setData({
    //             collectionData: collectionData
    //         })
    //     }

    // }).catch(e => {
    //     wx.hideLoading()
    // })
  },


  closeMask: function() {

    // let selectAnimation = wx.createAnimation({
    //     duration: 0,
    //     timingFunction: 'linear',
    //     left: (0 - app.globalData.windowWidth)
    // })

    // let createAnimation = wx.createAnimation({
    //     duration: 0,
    //     timingFunction: 'linear',
    //     left: 0
    // })

    // selectAnimation.left().step()
    // createAnimation.left(app.globalData.windowWidth).step()

    // this.setData({
    //     selectAnimation:selectAnimation.export(),
    //     createAnimation:createAnimation.export(),
    //     folderMaskShow: false,
    //     createFolderInputDefaultValue: ''
    // })
    this.folderInputValue = ''
    this.setData({
        folderMaskShow: false,
        showCreateFolder: false
    })
  },

  doCollect: function() {
      
    if (this.data.editDisable) return

    if (this.data.folders) {
        this.setData({
            folderMaskShow: true
        })
    }else {
        Utils.showLoading('获取收藏夹...')
        commonModel.fetchCollectFolderList().then(res => {

            let folders = res.data.data

            folders.unshift({
                name: '创建收藏夹',
                style:'color:#1971E9'
            })

            let showSelectListData = Object.assign(this.data.showSelectListData, {list: folders})
            if (folders.length >= 2) {
                showSelectListData.subtitle = ''
            }

            this.setData({
                folders: folders,
                folderMaskShow: true,
                showSelectListData: showSelectListData
            })
            wx.hideLoading()
        }).catch(e => {
            wx.hideLoading()
        })
    }
    
  },

  selectListCancel: function() {
    this.setData({
        folderMaskShow: false
    })
  },

  selectListTap: function(event) {
    let data = event.currentTarget.dataset.data
    if (data.pkgId) {
        this.doSelectFolder(this.data.note?this.data.note:null, data.pkgId)
    }else {
        this.setData({
            folderMaskShow: false,
            showCreateFolder: true
        })
    }
  },

  gotoCreateFolder: function() {
        let selectAnimation = wx.createAnimation({
            duration: 300,
            timingFunction: 'linear'
        })

        let createAnimation = wx.createAnimation({
            duration: 300,
            timingFunction: 'linear'
        })

        selectAnimation.left(0 - app.globalData.windowWidth).step()
        createAnimation.left(0).step()
  
      this.setData({
        selectAnimation:selectAnimation.export(),
        createAnimation:createAnimation.export()
      })
  },

  promptCancel: function() {
      this.setData({
        showCreateFolder: false
      })
      this.folderInputValue = ''
  },

  promptConfirm: function() {
      this.doCreateFolder()
  },

  promptInputChange: function(event) {
    this.folderNameChange(event)
  },

  folderNameChange: function(event) {
    let value = Utils.trim(event.detail.value)
    this.folderInputValue = value
  },

  doCreateFolder: function() {
    if (this.isLoading) return
    if (this.folderInputValue.length <= 0) {
        Utils.showToast('请输入收藏夹名称', false)
        return
    }

    this.isLoading = true
    Utils.showLoading('创建中...')
    commonModel.addCollectFolder({
        pkgName: this.folderInputValue
    }).then(res => {
        this.isLoading = false
        Utils.hideLoading()
        Utils.showToast('创建成功', true)

        let newFolders = this.data.folders
        newFolders.push(res.data.data)

        let showSelectListData = this.data.showSelectListData
        showSelectListData.list = newFolders

        this.setData({
            folders: newFolders,
            showSelectListData: showSelectListData,
            showCreateFolder: false,
            collected: true
        })

        this.closeMask()

        this.pkgId = res.data.data.pkgId
        app.globalData.collectFolders = newFolders

    })

  },

  doSelectFolder: function(note, pkgId) {

    //如果已经生成过笔记  
    if (note) {
        if (this.isLoading) return
        this.isLoading = true
        Utils.showLoading('收藏中...')
        commonModel.addCollect({noteId: note.noteId, pkgId: pkgId}).then(res => {

            this.isLoading = false
            wx.hideLoading()
            Utils.showToast('收藏成功', true)
            this.setData({
                collected: true
            })
            this.closeMask()
            note['pkgId'] = pkgId
            this.asyncPrevPageData(note)

        }).catch(e => {
            this.isLoading = false
            wx.hideLoading()
            Utils.showToast('收藏失败，请重试', false)
        })

    }else {
        this.setData({
            collected: true,
            folderMaskShow: false
        })
        this.pkgId = pkgId
    }

  }

})
