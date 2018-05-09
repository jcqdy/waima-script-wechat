//index.js
//获取应用实例
const app = getApp()
import { commonModel } from '../../models/commonModel'
import Utils from "../../utils/utils"

Page({
  data: {
    imageView: app.imageView.imageView,
    shelfData: [],
    manageButtonStatus: 0,
    moveBook: false,
    createFolder: false,
    isShelf: true,
    folders: [],
    selectedFolderId: "",

    createFolderData: {
      title:'新建文件夹',
      placeholder:'输入文件夹名',
      cancelName:'取消',
      confirmName:'确定',
      type:'2'
    },

    showSelectListData: {
      title: '移动到'
    }

  },

  createFolderInputChangeText:"",

  onShareAppMessage: function(res) {
    return Utils.share
  },

  onPullDownRefresh: function() {
    if (this.data.manageButtonStatus == 0) {
      this.doRequest() 
    }else {
      wx.stopPullDownRefresh()
    }
  },

  doRequest: function() {
    commonModel.fetchBookCase().then(res => {
        wx.stopPullDownRefresh()
        let folders = res.data.data.filter((obj, index) => {
          return obj.isFolder
        })

        let data = res.data.data
        data.map((obj, index) => {
          if (obj.isFolder) {
            let covers = []
            let count = obj.data.length >= 4?4:obj.data.length
            for(let i=0; i < count; i++) {
              covers.push(obj.data[i].coverUrl)
            }
            obj['covers'] = covers
          }
        })
    
        folders.unshift({
          name: '新建文件夹',
          style:'color:#1971E9'
        })

        this.setData({
            shelfData: res.data.data,
            folders: folders
        })

    }).catch(e => {
      wx.stopPullDownRefresh()
    }) 
  },

  onLoad: function() {

    if (app.globalData.userInfo) {
      this.doRequest()
    }else {
      app.userInfoReadyCallbackForShelf = userInfo => {
        this.doRequest()
      }
    }
    
  },

  onShow: function() {
    this.doRequest()
  },

  gotoFolder: function(event) {

    if (this.data.manageButtonStatus == 1) {
      return
    }

    let folders = this.data.shelfData.filter((obj, index) => {
      return obj.isFolder && obj.folderId != event.currentTarget.dataset.folder.folderId
    })
    wx.navigateTo({
      url:"../bookFolder/bookFolder?folder=" + JSON.stringify(event.currentTarget.dataset.folder) + "&folders=" + JSON.stringify(folders)
    })
  },

  manage: function() {
    let data = this.data.shelfData
    data.map((obj, index) => {
        obj["selected"] = 0
    })
    this.setData({
        shelfData: data,
        manageButtonStatus: !this.data.manageButtonStatus
    })
  },

  select: function(event) {
    let data = this.data.shelfData
    let index = event.currentTarget.dataset.index
    data[index]["selected"] = 1
    this.setData({
        shelfData: data
    })
  },

  unselect: function(event) {
    let data = this.data.shelfData
    let index = event.currentTarget.dataset.index
    data[index]["selected"] = 0
    this.setData({
        shelfData: data
    })
  },

  deleteBook: function() {
    let items = this.data.shelfData
    let arr = []
    let scriptIds = []
    let deleteScriptName = ''
    items.map((obj, index) => {
        if (obj["selected"] == 1) {
          arr.push(obj)
          scriptIds.push(obj.data.scriptId)
          deleteScriptName = obj.data.scriptName
        }
    })

    if (arr.length <= 0) {
      Utils.showModal("请选择要删除的剧本")
      return
    }


    wx.showModal({
      title: '',
      content: scriptIds.length > 1?'确定要删除所选剧本？':('确定要删除《'+ deleteScriptName +'》？'),
      cancelColor: '#1971E9',
      confirmColor: '#1971E9',
      showCancel: true,
      success: (res) => {
          if (res.confirm) {
            Utils.showLoading("删除中...")
            commonModel.deleteBook({
              scriptIds: scriptIds.join(',')
            }).then(res => {
              wx.hideLoading()
              Utils.showToast("删除成功", true)
        
              let newArr = items.filter((obj, index) => {
                return !arr.includes(obj)
              })
        
              this.setData({
                shelfData: newArr,
                moveBook: false,
                createFolder:false
              })
        
              this.manage()
        
            }).catch(e => {
              Utils.showToast("删除失败，请稍后重试", false)
              wx.hideLoading()
            })
          }
      }
  })

    

  },

  closeMoveBook: function() {
    this.setData({
      moveBook: false
    })
  },

  selectMoveFolder: function(event) {
    let folderId = event.currentTarget.dataset.folderid
    this.setData({
      selectedFolderId: folderId
    })
  },

  handleMoveBook: function() {

    let shelfData = this.data.shelfData
    let items = shelfData
    let arr = []
    items.map((obj, index) => {
        if (obj["selected"] == 1) {
          arr.push(obj)
        }
    })

    if (arr.length <= 0) {
      Utils.showModal("请选择要移动的剧本")
      return
    }

    let showSelectListData = Object.assign(this.data.showSelectListData, {list: this.data.folders})

    this.setData({
        folderMaskShow: true,
        showSelectListData: showSelectListData
    })

    this.setData({
      moveBook: true
    })

  },

  promptCancel: function(event) {
    this.closeCreateFolder()
  },

  promptConfirm: function(event) {
    this.paramForCreateFolder()
  },

  promptInputChange: function(event) {
    this.createFolderInputChangeText = Utils.trim(event.detail.value)
  },

  selectListCancel: function() {
    this.setData({
      moveBook: false
    })
  },

  selectListTap: function(event) {
    let data = event.currentTarget.dataset.data
    if (data.name == '新建文件夹') {
      this.createFolder()
    }else {
      this.setData({
        selectedFolderId: data.folderId
      }, this.paramForExistFolder)
    }
  },

  paramForExistFolder: function() {

    if (this.data.selectedFolderId.length <= 0) {
      Utils.showModal("请先选择目标文件夹")
      return
    }

    let shelfData = this.data.shelfData
    let arr = []
    let scriptIds = []
    shelfData.map((obj, index) => {
        if (obj["selected"] == 1) {
          arr.push(obj)
          scriptIds.push(obj.data.scriptId)
        }
    })

    let param = {
      scriptIds: scriptIds.join(","),
      makeFolder: 0,
      newFolderId: this.data.selectedFolderId
    }

    this.moveBook(param, arr)
  },

  paramForCreateFolder: function() {

    if (this.createFolderInputChangeText.length <= 0) {
      Utils.showToast("文件夹名称不能为空")
      return
    }

    let shelfData = this.data.shelfData
    let arr = []
    let scriptIds = []
    shelfData.map((obj, index) => {
        if (obj["selected"] == 1) {
          arr.push(obj)
          scriptIds.push(obj.data.scriptId)
        }
    })

    let param = {
      scriptIds: scriptIds.join(","),
      name: this.createFolderInputChangeText,
      makeFolder: 1
    }

    this.moveBook(param, arr)
  },

  moveBook: function(param, arr) {

    Utils.showLoading("移动中...")
    commonModel.moveBook(param).then(res => {
      wx.hideLoading()
      Utils.showToast('移动成功', true)

      let shelfData = this.data.shelfData
      
      let newArr = shelfData.filter((obj, index) => {
        return !arr.includes(obj)
      })

      this.setData({
        shelfData: newArr,
        moveBook: false,
        createFolder:false
      })

      this.createFolderInputChangeText = ""
      this.manage()
      this.doRequest()

    }).catch(e => {
      Utils.showToast('移动失败，请重试', false)
      wx.hideLoading()
    })
  },

  createFolder: function() {
    this.setData({
      createFolder: true,
      moveBook: false
    })
  },

  closeCreateFolder: function() {
    this.createFolderInputChangeText = ""
    this.setData({
      createFolder: false
    })
  },

  gotoReadBook: function(event) {
    let book = event.currentTarget.dataset.book
    if (this.data.manageButtonStatus == 1) {
      if (book.selected) {
        this.unselect(event)
      }else {
        this.select(event)
      }
    }else {
      Utils.gotoArticle(book.data)
    }
  }

})
