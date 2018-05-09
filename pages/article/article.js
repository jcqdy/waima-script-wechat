//index.js
//获取应用实例
const app = getApp()
import { commonModel } from "../../models/commonModel"
import Utils from '../../utils/utils'

Page({
  data: {
    arr: [],
    menuAble: false,
    menuAbleFlag: true, 
    selectedArr: [],
    scrollTop: 0,
    article: {},
    articleMessage: {},
    fontStyle: '',

    fontSelected: false,
    backcolorSelected: false,
    progressSelected: false,
    selctedColor:'1',
    inBookCase: false,
    showProgressBar: false,
    progressNumber: 0,

    fontSliderDefaultValue:'',
    progressSliderDefaultValue:''
  },

  startTime:0,
  endTime:0,
  timer: null,
  cancelMoveEvent: false,
  articleHeight: 0,
  isLoading: false,
  progressBarTimer: null,

  onShareAppMessage: function(res) {
    return {
      title: "我正在阅读《"+this.data.article.scriptName+"》的剧本",
      path: '/pages/article/article?scene='+this.data.article.scriptId,
      success: function(res) {
        // 转发成功
      },
      fail: function(res) {
        // 转发失败
      }
    }
  },

  onLoad: function(options) {

    if (options.scene) {
        let scriptId = options.scene
        if (app.globalData.userInfo) {
            this.fetchArticle(scriptId)
            this.setData({
                backBook:true
            })
        }else {
            app.userInfoReadyCallbackForArticle = userInfo => {
              this.fetchArticle(scriptId)
              this.setData({
                  backBook:true
              })
            }
        }

    }else {
        let article = JSON.parse(options.article)
        wx.setNavigationBarTitle({
            title: article.scriptName
        })

        this.setData({
            article: article
        })

        this.initUI()
        this.doRequestFile(article)
        this.doReadRecord(article)
    }
    
  },

  fetchArticle: function(scriptId) {
        wx.setNavigationBarTitle({
            title: this.data.article.scriptName || ''
        })

        this.initUI()
        this.doRequestFile({scriptId: scriptId})
        this.doReadRecord({scriptId: scriptId})
  },

  doReadRecord: function(article) {
    commonModel.readRecord({
        scriptId: article.scriptId
    }).then(res => {

    }).catch(e => {

    })
  },

  initUI: function() {
    let userInfo = app.globalData.userInfo
    this.setData({
        selctedColor: userInfo.backColor,
        fontStyle: 'f' + userInfo.fontSize,
        fontSliderDefaultValue: userInfo.fontSize
    })

  },

  doRequestFile: function(article) {

        Utils.showLoading('加载中...')

        commonModel.fetchScript({scriptId: article.scriptId}).then(res => {
            Utils.hideLoading()
            Utils.showLoading('加载中...')
            this.setData({
                article: res.data.data.script,
                articleMessage: res.data.data,
                inBookCase: res.data.data.script.inBookCase,
                progressSliderDefaultValue: res.data.data.script.readPos
            })

            wx.setNavigationBarTitle({
                title: res.data.data.script.scriptName || ''
            })

            wx.request({
                url: res.data.data.script.fileUrl,
                data: {},
                method: "GET",
                header: {
                    "Content-Type": "application/json"
                },
                success: (res) => {
    
                    let tempArr = res.data.data
    
                    tempArr.map((obj, index) => {
                        obj = Object.assign(obj, {
                            id: index,
                            selected: false
                        })
                    })

                    this.data.articleMessage.script.noteMark.map((obj, index) => {
                        obj.markId.map((id) => {
                            tempArr[Number(id)]['note'] = obj
                        })
                    })
    
                    this.setData({
                        arr: tempArr
                    }, () => {
                        Utils.hideLoading()
                    })

                    setTimeout(() => {
                        this.queryArticle()
                        Utils.hideLoading()
                    }, 500)
                },
    
                fail: () => {
                    Utils.hideLoading()
                    Utils.showModal('加载失败，请重试', false, (res) => {
                        this.doRequestFile(article)
                    })
                }
    
            })
        }).catch(e => {
            Utils.hideLoading()
            Utils.showModal('加载失败，请重试', false, (res) => {
                this.doRequestFile(araticle)
            })
        })
  },

  cancelPress: function(event) {
    if (this.cancelMoveEvent) {
      this.cancelMoveEvent = false
      return
    }
    let item = event.currentTarget.dataset.data
    let tempArr = this.data.arr
    let unselectedItem = null
    tempArr.filter((obj, index) => {
      if (obj.id == item.id) {
        obj.selected = false
        unselectedItem = obj
      }
    })

    let selectedArr = this.data.selectedArr
    selectedArr = selectedArr.filter((obj, index) => {
        return obj.id != unselectedItem.id
    })

    this.setData({
      arr: tempArr,
      selectedArr: selectedArr
    })

    if (selectedArr.length <= 0) {
        setTimeout(() => {
            this.setData({
                menuAbleFlag: true
            })
        }, 500)
    }

  },

  cancelMove: function() {
    this.cancelMoveEvent = true
  },

  start: function(e) {
    this.startTime = e.timeStamp

    this.timer = setTimeout(() => {
      let item = e.currentTarget.dataset.data
      let tempArr = this.data.arr
      let selectedItem = null
      tempArr.filter((obj, index) => {
      if (obj.id == item.id) {
           obj.selected = true
           selectedItem = obj
         }
      })

      let newSelectedArr = this.data.selectedArr
      newSelectedArr.push(selectedItem)

      let animation = wx.createAnimation({
        duration: 300,
        timingFunction: 'ease',
      })
      animation.opacity(0).step()
      let menuAnimation = animation.export()

      this.setData({
         menuAnimation:menuAnimation,
         arr: tempArr,
         selectedArr: newSelectedArr,
         menuAble: false,
         menuAbleFlag: false
      })
    }, 300)

  },

  move: function() {
    if (this.timer) {
      clearTimeout(this.timer)
    }
  },
  
  end: function(e) {
    
    if (this.timer) {
      clearTimeout(this.timer)
    }

  },

  hideMenu: function() {
      return
      if (this.data.menuAble) {
        this.setData({
            menuAble: !this.data.menuAble,
            fontSelected: false,
            backcolorSelected: false,
            progressSelected: false,
        })
      }
  },

  showMenuOrHideMenu: function() {
    if (this.data.selectedArr.length <= 0 && this.data.menuAbleFlag) {

        let menuAble = !this.data.menuAble
        let menuAnimation = {}

        if (menuAble) {
            let animation = wx.createAnimation({
                duration: 300,
                timingFunction: 'ease',
            })
            animation.opacity(1).step()
            menuAnimation = animation.export()
        }else {
            let animation = wx.createAnimation({
                duration: 300,
                timingFunction: 'ease',
            })
            animation.opacity(0).step()
            menuAnimation = animation.export()
        }

        this.setData({
            menuAnimation: menuAnimation,
            menuAble: !this.data.menuAble,
            fontSelected: false,
            backcolorSelected: false,
            progressSelected: false,
        })
        this.queryScrollView()
    }
  },

  queryArticle: function(value) {
    wx.createSelectorQuery().select('#article').boundingClientRect((rect) => {
        // rect.id      // 节点的ID
        // rect.dataset // 节点的dataset
        // rect.left    // 节点的左边界坐标
        // rect.right   // 节点的右边界坐标
        // rect.top     // 节点的上边界坐标
        // rect.bottom  // 节点的下边界坐标
        // rect.width   // 节点的宽度
        // rect.height  // 节点的高度
        this.articleHeight = rect.height

      }).exec()
  },

  queryScrollView: function() {
    wx.createSelectorQuery().select('#content').scrollOffset((res) => {
        // res.id      // 节点的ID
        // res.dataset // 节点的dataset
        // res.scrollLeft // 节点的水平滚动位置
        // res.scrollTop  // 节点的竖直滚动位置
        let position = Math.floor(res.scrollTop / this.articleHeight * 100)
        this.setData({
            progressSliderDefaultValue: position
        })
    }).exec()
  },

  scrollto: function(value) {

      let position = Math.floor(value / 100 * this.articleHeight)
      this.setData({
        scrollTop: position
      })
  },

  handleFontSelected: function() {
    this.setData({
        fontSelected:true,
        backcolorSelected:false,
        progressSelected: false
    })
  },

  handleBackcolorSelected: function() {
    this.setData({
        fontSelected:false,
        backcolorSelected: true,
        progressSelected: false
    })
  },

  handleProgressSelected: function() {
    this.setData({
        fontSelected:false,
        backcolorSelected:false,
        progressSelected: true
    })
  },

  handleAddBookToCase: function() {

    if (this.isLoading) return

        this.isLoading = true

      if (this.data.inBookCase) {
            Utils.showLoading('删除中...')
            commonModel.deleteBookCase({
                scriptIds: this.data.article.scriptId
            }).then(res => {
                Utils.hideLoading()
                Utils.showToast('已经从书架删除', true)
                this.isLoading = false
                this.setData({
                    inBookCase: !this.data.inBookCase
                })
            }).catch(e => {
                this.isLoading = false
                Utils.hideLoading()
                Utils.showToast('删除失败，请重试')
            })
      }else {
        Utils.showLoading('添加中...')
        commonModel.addBookCase({
            scriptId: this.data.article.scriptId
        }).then(res => {
            Utils.hideLoading()
            this.isLoading = false
            Utils.showToast('成功加入书架', true)
            this.setData({
                inBookCase: !this.data.inBookCase
            })
        }).catch(e => {
            this.isLoading = false
            Utils.hideLoading()
            Utils.showToast('添加失败，请重试')
        })
      }
  },

  fontSliderChange: function(event) {
    let font = event.detail.value
    this.setData({
        fontStyle:'f' + font 
    })
    this.queryArticle()
    this.putStatus({fontSize: Number(font)})
  },

  handleSelectColor: function(event) {
    let color = event.currentTarget.dataset.color
      this.setData({
          selctedColor: color
      })
      this.putStatus({backColor: Number(color)})
  },

  progressSliderChange: function(event) {
    let progress = event.detail.value
    this.putStatus({readPos: Number(progress)})
    this.scrollto(Number(progress))
  },

  progressChanging: function(event) {
    this.setData({
        showProgressBar: true,
        progressNumber: event.detail.value
    })

    if (this.progressBarTimer) {
        clearTimeout(this.progressBarTimer)
    }

    this.progressBarTimer = setTimeout(() => {
        this.setData({
            showProgressBar: false
        })
    }, 350)
  },

  putStatus: function(data) {
        app.globalData.userInfo = Object.assign(app.globalData.userInfo, data)
        let param = {
            scriptId: this.data.article.scriptId,
            readPos: this.data.articleMessage.script.readPos,
            fontSize: data.fontSize?data.fontSize:app.globalData.userInfo.fontSize,
            backColor: data.backColor?data.backColor:app.globalData.userInfo.backColor
        }
        commonModel.putStatus(param).then(res => {
    
        }).catch(e => {})
  },

  cancelAllSelected: function() {
      let arr = this.data.arr
      let selectedArr = this.data.selectedArr
      let selectedIds = []
      selectedArr.map((obj, index) => {
          selectedIds.push(obj.id)
      })
      arr.map((obj, index) => {
          if (selectedIds.includes(obj.id)) {
              obj.selected = false
          }
      })
      this.setData({
        arr: arr,
        selectedArr: [],
        menuAbleFlag: true
      })
  },

  gotoWriteNote: function() {
    app.selectedArr = this.data.selectedArr
    wx.navigateTo({
        url: '../addNote/addNote?article=' + JSON.stringify(this.data.article) + '&writer=' + JSON.stringify(this.data.article.writer)
    })
  },

  gotoNote: function(event) {
    let item = event.currentTarget.dataset.data
    let mark = {}
    item.note.markId.map((obj, index) => {
        mark[obj] = this.data.arr[Number(obj)].text
    })
    item.note.mark = JSON.stringify(mark)
    item.note.scriptName = this.data.article.scriptName
    item.note.coverUrl = this.data.article.coverUrl
    item.note.scriptId = this.data.article.scriptId
    app.dataString = JSON.stringify(item.note)
    wx.navigateTo({
        url: '../noteDetail/noteDetail?writer=' + JSON.stringify(this.data.article.writer)
    })
  },

  gotoNoteList: function() {
    wx.navigateTo({
        url: '../noteList/noteList?item=' + JSON.stringify(this.data.article) +'&from=' + 'script'
    })
  },

  gotoShare: function() {
    wx.navigateTo({
        url: '../share/share?article=' + JSON.stringify(this.data.article)
    })
  },

  backHome: function() {
    wx.switchTab({
        url: '../scriptLibrary/scriptLibrary'
    })
  }

})
