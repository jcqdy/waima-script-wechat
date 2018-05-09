//index.js
//获取应用实例
const app = getApp()

import { commonModel } from "../../models/commonModel"
import Utils from "../../utils/utils"

Page({
  data: {
    imageView: app.imageView.imageView,
    note: {},
    collected: false,
    markText: "",
    editDisable: false,
    editTaped: false,
    folders: null,
    createFolderInputDefaultValue: '',
    folderMaskShow: false,
    showCreateFolder: false,
    selectAnimation: {},
    createAnimation: {},
    textAreaDefaultValue: '',

    showFolderNameEditData: {
        title: '新建收藏夹',
        placeholder: '输入收藏夹名',
        cancelName: '取消',
        confirmName: '确定',
        value: ''
    },

    showSelectListData: {
        title: '选择收藏夹',
        subtitle:'(可将划线剧本与笔记收藏为创作素材在写剧本时作为参考)'
    }

  },

  textValue: "",
  folderInputValue: "",
  isLoading: false,

  onShareAppMessage: function(res) {
    return Utils.share
  },

  onLoad: function(options){
    
    let note = JSON.parse(app.dataString)
    if (note.note && note.note.length > 0) {
      this.textValue = note.note
    }

    wx.setNavigationBarTitle({
        title: note.scriptName
    })

    let marks = note.mark.length > 0?JSON.parse(note.mark):note.mark
    let markTextArr = []
    for (let key in marks) {
        markTextArr.push(marks[key])
    }

    let markText = markTextArr.join('\n')
    let writer = JSON.parse(options.writer).join(' / ')
    
    this.setData({
      note: note,
      collected: note.pkgId.length > 0?true:false,
      markText: markText,
      textAreaDefaultValue: note.note,
      writer: writer
    })
  
    // wx.setNavigationBarTitle({
    //   title: res.title || "歪马剧本"
    // })
  },

  editTaped: function() {
    this.setData({
        editTaped: true
    })
  },

  edit: function() {
    this.setData({
      textareaDisabled: false
    })
  },

  save: function() {
    let value = Utils.trim(this.textValue)
    if (value.length <= 0) {
      Utils.showModal("笔记不能为空")
      return
    }

    Utils.showLoading("修改中...")
    commonModel.editNote({noteId: this.data.note.noteId, note: value}).then(res => {
      wx.hideLoading()
      Utils.showToast("修改成功", true)
      this.setData({
        editTaped:false
      })

      let pages = getCurrentPages()
      let prevPage = pages[pages.length - 2]
      if (prevPage.route == "pages/markList/markList" || prevPage.route == "pages/noteList/noteList") {
        let collectionData = prevPage.data.collectionData
        collectionData.note.map((obj, index) => {
          if (obj.noteId == this.data.note.noteId) {
            obj.note = value
          }
        })

        prevPage.setData({
          collectionData: collectionData
        })

      }else if (prevPage.route == "pages/article/article") {
        let articleMessage = prevPage.data.articleMessage
        let arr = prevPage.data.arr
        articleMessage.script.noteMark.map((obj, index) => {
            if (obj.noteId == this.data.note.noteId) {
                obj.note = value
                obj.markId.map(id => {
                    arr[Number(id)]['note'].note = value
                })
            }
        })

        prevPage.setData({
            arr: arr,
            articleMessage: articleMessage
        })
    }

    }).catch(e => {
      Utils.showModal("修改失败，请稍后重试")
      wx.hideLoading()
    })

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

    Utils.showLoading("删除中...")
    commonModel.collectDel({
        noteId: this.data.note.noteId,
        pkgId: this.data.note.pkgId
    }).then(res => {
        wx.hideLoading()
        let note = this.data.note
        note.pkgId = ''
        this.setData({
            collected: false,
            note: note
        })

        let pages = getCurrentPages()
        let prevPage = pages[pages.length - 2]
        if (prevPage.route == "pages/markList/markList") {
            let collectionData = prevPage.data.collectionData
            let notes = collectionData.note.filter((obj, index) => {
                return obj.noteId != this.data.note.noteId
            })

            collectionData.note = notes
       
            prevPage.setData({
                collectionData: collectionData
            })

        }else if(prevPage.route == "pages/noteList/noteList") {
            let collectionData = prevPage.data.collectionData
            collectionData.note.map((obj, index) => {
                if (obj.noteId == this.data.note.noteId) {
                    obj.pkgId = ''
                }
            })
       
            prevPage.setData({
                collectionData: collectionData
            })
        }else if (prevPage.route == "pages/article/article") {
            let articleMessage = prevPage.data.articleMessage
            let arr = prevPage.data.arr
            articleMessage.script.noteMark.map((obj, index) => {
                if (obj.noteId == note.noteId) {
                    obj.markId.map((id) => {
                        arr[Number(id)]['note'].pkgId = ''
                    })
                }
            })
    
            prevPage.setData({
                arr: arr,
                articleMessage: articleMessage
            })
        }

    }).catch(e => {
        wx.hideLoading()
    })
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

  folderNameChange: function(event) {
    let value = Utils.trim(event.detail.value)
    this.folderInputValue = value
  },

  doCreateFolder: function() {
    if (this.isLoading) return
    if (this.folderInputValue.length <= 0) {
        Utils.showToast('请输入文件夹名称', false)
        return
    }

    this.isLoading = true
    Utils.showLoading('创建中...')

    let newFolder = null

    commonModel.addCollectFolder({
        pkgName: this.folderInputValue
    }).then(res => {
        this.isLoading = false
        let newFolders = this.data.folders
        newFolder = res.data.data
        newFolders.push(newFolder)

        let note = this.data.note
        note.pkgId = res.data.data.pkgId
        this.setData({
            folders: newFolders,
            note:note
        })
        app.globalData.collectFolders = newFolders
        return commonModel.addCollect({noteId: this.data.note.noteId, pkgId: res.data.data.pkgId})

    }).then(res => {
        this.isLoading = false
        wx.hideLoading()
        Utils.showToast('创建成功', true)
        this.setData({
            collected: true
        })

        let pages = getCurrentPages()
        let prevPage = pages[pages.length - 2]
        if(prevPage.route == "pages/noteList/noteList") {
            let collectionData = prevPage.data.collectionData
            collectionData.note.map((obj, index) => {
                if (obj.noteId == this.data.note.noteId) {
                    obj.pkgId = newFolder.pkgId
                }
            })
       
            prevPage.setData({
                collectionData: collectionData
            })
        }else if (prevPage.route == "pages/article/article") {
            let articleMessage = prevPage.data.articleMessage
            let arr = prevPage.data.arr

            articleMessage.script.noteMark.map((obj, index) => {
                if (obj.noteId == this.data.note.noteId) {
                    obj.markId.map((id) => {
                        arr[Number(id)]['note'].pkgId = newFolder.pkgId
                    })
                }
            })
    
            prevPage.setData({
                arr: arr,
                articleMessage: articleMessage
            })
        }

        this.closeMask()

    }).catch(e => {
        this.isLoading = false
        wx.hideLoading()
        Utils.showToast('创建失败，请重试', false)
    })

  },

  doSelectFolder: function(note, pkgId) {

    if (this.isLoading) return
    this.isLoading = true
    Utils.showLoading('收藏中...')
    commonModel.addCollect({noteId: note.noteId, pkgId: pkgId}).then(res => {

        this.isLoading = false
        wx.hideLoading()
        Utils.showToast('收藏成功', true)
        this.closeMask()
        note['pkgId'] = pkgId

        this.setData({
            collected: true,
            note: note
        })

        let pages = getCurrentPages()
        let prevPage = pages[pages.length - 2]
        if (prevPage.route == "pages/markList/markList") {
            let collectionData = prevPage.data.collectionData
            if (collectionData.package.pkgId == note.pkgId) {
                collectionData.note.unshift(note)
            }
       
            prevPage.setData({
                collectionData: collectionData
            })

        }else if(prevPage.route == "pages/noteList/noteList") {
            let collectionData = prevPage.data.collectionData
            collectionData.note.map((obj, index) => {
                if (obj.noteId == this.data.note.noteId) {
                    obj.pkgId = note['pkgId']
                }
            })
       
            prevPage.setData({
                collectionData: collectionData
            })
        }else if (prevPage.route == "pages/article/article") {
            let articleMessage = prevPage.data.articleMessage
            let arr = prevPage.data.arr

            articleMessage.script.noteMark.map((obj, index) => {
                if (obj.noteId == note.noteId) {
                    obj.markId.map((id) => {
                        arr[Number(id)]['note'].pkgId = note.pkgId
                    })
                }
            })
    
            prevPage.setData({
                arr: arr,
                articleMessage: articleMessage
            })
        }

    }).catch(e => {
        this.isLoading = false
        wx.hideLoading()
        Utils.showToast('收藏失败，请重试', false)
    })

  }

})
