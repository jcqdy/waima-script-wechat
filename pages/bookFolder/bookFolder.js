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
    folderEdit: false,
    moveBook: false,
    createFolder: false,
    folders: [],
    selectedFolderId: "",

    promptData: {
      title:'修改文件夹名',
      placeholder:'输入文件夹名',
      cancelName:'取消',
      confirmName:'确定',
      type: '1'
    },

    createFolderData: {
      title:'新建文件夹',
      placeholder:'输入文件夹名',
      cancelName:'取消',
      confirmName:'确定',
      type:'2'
    },

    showSelectListData: {
      title: '移动到'
    },

    folderMaskShow: false

  },

  folderName: "",
  createFolderInputChangeText:"",

  onShareAppMessage: function(res) {
    return Utils.share
  },

  onLoad: function(options) {
    let data = JSON.parse(options.folder)
    //this.folderName = data.folderName

    wx.setNavigationBarTitle({
        title: data.folderName
    })

    let folders = JSON.parse(options.folders)

    folders.unshift({
      name: '移出文件夹',
      style:'color:#1971E9'
    })

    folders.unshift({
      name: '新建文件夹',
      style:'color:#1971E9'
    })

    this.setData({
      shelfData: data,
      folders: folders
    })
  },

  manage: function() {
    let data = this.data.shelfData
    let items = data.data
    items.map((obj, index) => {
        obj["selected"] = 0
    })

    data.data = items
    
    this.setData({
        shelfData: data,
        manageButtonStatus: !this.data.manageButtonStatus
    })
  },

  select: function(event) {
    let data = this.data.shelfData
    let index = event.currentTarget.dataset.index
    data.data[index]["selected"] = 1
    this.setData({
        shelfData: data
    })
  },

  unselect: function(event) {
    let data = this.data.shelfData
    let index = event.currentTarget.dataset.index
    data.data[index]["selected"] = 0
    this.setData({
        shelfData: data
    })
  },

  editFolderName: function(){
    
    wx.showActionSheet({
      itemList: ['修改文件夹名', '删除文件夹'],
      success: (res) => {
          switch (res.tapIndex) {
              case 0:
                  this.setData({
                     folderEdit: true
                  })
                  break;

              case 1:

                  wx.showModal({
                      title: '',
                      content: '删除文件夹后，剧本会自动移到文件夹外',
                      cancelColor: '#1971E9',
                      confirmColor: "#1971E9",
                      showCancel: true,
                      success: (res) => {
                          if (res.confirm) {
                              Utils.showLoading('删除中...')
                              commonModel.deleteFolder({
                                folderId: this.data.shelfData.folderId
                              }).then(res => {
                                  Utils.showToast('删除成功', true)
                                  Utils.hideLoading()

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

  closeFolderEdit: function() {
    this.folderName = ""
    this.setData({
      folderEdit: false
    })
  },

  closeMoveBook: function() {
    this.setData({
      moveBook: false
    })
  },

  promptCancel: function(event) {
    if (event.currentTarget.dataset.type == '1') {
      this.closeFolderEdit()
    }else if(event.currentTarget.dataset.type == '2') {
      this.closeCreateFolder()
    } 
  },

  promptConfirm: function(event) {
    if (event.currentTarget.dataset.type == '1') {
      this.saveFolderName()
    }else if(event.currentTarget.dataset.type == '2') {
      this.paramForCreateFolder()
    } 
  },

  promptInputChange: function(event) {
    if (event.currentTarget.dataset.type == '1') {
      this.folderName = Utils.trim(event.detail.value)
    }else if(event.currentTarget.dataset.type == '2') {
      this.createFolderInputChangeText = Utils.trim(event.detail.value)
    } 
    
  },

  selectListCancel: function() {
    this.setData({
      folderMaskShow: false
    })
  },

  saveFolderName: function() {
    if (this.folderName.length <= 0) {
      Utils.showToast("名字不能为空")
      return
    }

    wx.setNavigationBarTitle({
        title: this.folderName
    })

    Utils.showLoading("修改中...")

    commonModel.editBookFolder({
      folderId: this.data.shelfData.folderId,
      name: this.folderName
    }).then(res => {
      wx.hideLoading()
      this.folderName = ""
      this.setData({
        folderEdit: false,
        manageButtonStatus: 0
      })
      Utils.showToast("修改成功", true)
    }).catch(e => {
      wx.hideLoading()
      Utils.showToast("修改失败，请重试")
    })

  },

  deleteBook: function() {
    let shelfData = this.data.shelfData
    let items = shelfData.data
    let arr = []
    let scriptIds = []
    let deleteScriptName = ''
    items.map((obj, index) => {
        if (obj["selected"] == 1) {
          arr.push(obj)
          scriptIds.push(obj.scriptId)
          deleteScriptName = obj.scriptName
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
                commonModel.deleteBook({scriptIds: scriptIds.join(",")}).then(res => {
                    wx.hideLoading()
                    Utils.showToast("删除成功", true)

                    let newArr = items.filter((obj, index) => {
                        return !arr.includes(obj)
                    })

                    shelfData.data = newArr

                    this.setData({
                        shelfData: shelfData,
                        folderMaskShow: false,
                        folderEdit:false,
                        createFolder: false
                    })

                    this.manage()
                    if (this.data.shelfData.data.length <= 0) {
                        wx.navigateBack()
                    }

                    }).catch(e => {
                    Utils.showToast("删除失败，请稍后重试", false)
                    wx.hideLoading()
                })

            }
        }
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
    let items = shelfData.data
    let arr = []
    let scriptIds = []
    items.map((obj, index) => {
        if (obj["selected"] == 1) {
          arr.push(obj)
          scriptIds.push(obj.scriptId)
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

  paramForOutFolder: function() {
    let shelfData = this.data.shelfData
    let items = shelfData.data
    let arr = []
    let scriptIds = []
    items.map((obj, index) => {
        if (obj["selected"] == 1) {
          arr.push(obj)
          scriptIds.push(obj.scriptId)
        }
    })

    let param = {
      scriptIds: scriptIds.join(","),
      makeFolder: 0
    }

    this.moveBook(param, arr)
  },

  paramForExistFolder: function() {

    if (this.data.selectedFolderId.length <= 0) {
      Utils.showModal("请先选择目标文件夹")
      return
    }

    let shelfData = this.data.shelfData
    let items = shelfData.data
    let arr = []
    let scriptIds = []
    items.map((obj, index) => {
        if (obj["selected"] == 1) {
          arr.push(obj)
          scriptIds.push(obj.scriptId)
        }
    })

    let param = {
      scriptIds: scriptIds.join(","),
      makeFolder: 0,
      newFolderId: this.data.selectedFolderId
    }

    this.moveBook(param, arr)
  },

  selectListTap: function(event) {
    let data = event.currentTarget.dataset.data
    if (data.name == '新建文件夹') {
      this.createFolder()
    }else if(data.name == '移出文件夹') {
      this.paramForOutFolder()
    }else {
      this.setData({
        selectedFolderId: data.folderId
      }, this.paramForExistFolder)
    }
  },

  paramForCreateFolder: function() {

    if (this.createFolderInputChangeText.length <= 0) {
      Utils.showToast('文件夹名称不能为空')
      return
    }

    let shelfData = this.data.shelfData
    let items = shelfData.data
    let arr = []
    let scriptIds = []
    items.map((obj, index) => {
        if (obj["selected"] == 1) {
          arr.push(obj)
          scriptIds.push(obj.scriptId)
        }
    })

    let param = {
      scriptIds: scriptIds.join(","),
      makeFolder: 1,
      name: this.createFolderInputChangeText
    }

    this.moveBook(param, arr)
  },

  moveBook: function(param, arr) {

    Utils.showLoading("移动中...")
    commonModel.moveBook(param).then(res => {
      wx.hideLoading()
      Utils.showToast("移动成功", true)

      let shelfData = this.data.shelfData
      let items = shelfData.data

      let newArr = items.filter((obj, index) => {
        return !arr.includes(obj)
      })

      shelfData.data = newArr

      this.setData({
        shelfData: shelfData,
        folderMaskShow: false,
        folderEdit: false,
        createFolder: false
      })

      this.createFolderInputChangeText = ""

      this.manage()
      if (this.data.shelfData.data.length <= 0) {
        wx.navigateBack()
      }

    }).catch(e => {
      Utils.showToast("移动失败，请稍后重试", false)
      wx.hideLoading()
    })
  },

  createFolder: function() {
    this.setData({
      createFolder: true,
      folderMaskShow: false
    })
  },

  closeCreateFolder: function() {
    this.createFolderInputChangeText = ""
    this.setData({
      createFolder: false
    })
  },

  createFolderInputChange: function(event) {
    this.createFolderInputChangeText = Utils.trim(event.detail.value)
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
      Utils.gotoArticle(book)
    }
  }

})
