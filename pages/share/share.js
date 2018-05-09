//index.js
//获取应用实例
const app = getApp()
import { commonModel } from "../../models/commonModel"
import Utils from "../../utils/utils"
import {Jwx} from "../../utils/JwxAPIs"

Page({
  data: {
    article: null,
    userInfo: null,
    canvasStyle: ''
  },

  canvasHeight: 0,
  canvasWidth: 0,

  onShareAppMessage: function(res) {
    return Utils.share
  },

  saveImage: () => {

    wx.canvasToTempFilePath({
        quality: 1,
        canvasId: 'myCanvas',
        success: (res) => {
            wx.saveImageToPhotosAlbum({
                filePath: res.tempFilePath,
                success: (res) => {
                    Utils.showToast("保存成功", true)
                }
            })
        } 
    })

  },

  onLoad: function(options) {

    wx.setNavigationBarTitle({
        title: "剧本分享"
    })

    let userInfo = app.globalData.userInfo
    let article = JSON.parse(options.article)
    let normalWidth = 300

    let delta = app.globalData.windowHeight/624
    let scale = delta > 1?1:delta
    let marginTop = 0

    if (app.globalData.windowHeight <= 456) {
        marginTop = 20
    }else if(app.globalData.windowHeight <= 555) {
        marginTop = 20
    }else if(app.globalData.windowHeight <= 624) {
        marginTop = 60
    }else {
        marginTop = 100
    }
    
    this.setData({
      article: article,
      userInfo: userInfo,
      canvasStyle: 'margin-top:' + marginTop + 'rpx'
    })
    
    const ctx = wx.createCanvasContext('myCanvas')
    if (scale < 1) {
        ctx.translate((app.globalData.windowWidth-300*scale)/2-(app.globalData.windowWidth-300)/2, marginTop)
        ctx.scale(scale, scale)
    }
    
    var drawCanvas = (avatarPath, coverPath, qrPath) => {
        //this.canvasWidth = app.globalData.windowWidth * 0.7
        //this.canvasHeight = app.globalData.windowHeight * 0.8

        this.canvasWidth = 300
        this.canvasHeight = 533

        //填充灰色背景
        ctx.setFillStyle('#ECEDF1')
        ctx.fillRect(0, 0, this.canvasWidth, this.canvasHeight)

        //填充白色背景
        let contentX = this.canvasWidth * 0.1
        let contentY = 50
        let contentWidth = this.canvasWidth * 0.8
        let contentHeight = this.canvasHeight * 0.8

        ctx.shadowBlur = 20
        ctx.shadowColor = "#CBCDD1"
        ctx.setFillStyle('white')
        ctx.fillRect(contentX, contentY, contentWidth, contentHeight)
        ctx.shadowBlur = 0

        //绘制头像，昵称，正在阅读剧本

        //头像边框
        // ctx.beginPath()
        // ctx.moveTo(avatarX, avatarY)
        // ctx.lineTo(avatarX + 40, avatarY)
        // ctx.lineTo(avatarX + 40, avatarY + 40)
        // ctx.lineTo(avatarX, avatarY + 40)
        // ctx.closePath()
        // ctx.lineWidth = 3
        // ctx.strokeStyle = "gray"
        // ctx.stroke()

        if (avatarPath) {
            let avatarX = contentX + 10
            let avatarY = contentY + 30
            ctx.drawImage(avatarPath, avatarX, avatarY, 40, 40)

            ctx.font = "bold 18px Microsoft YaHei"
            ctx.fillStyle = "#5A616B"
            ctx.fillText(userInfo.nickName, contentX + 10 + 40 + 10, contentY + 43)
            
            ctx.font = "normal 12px Microsoft YaHei"
            ctx.fillText("正在阅读剧本", contentX + 10 + 40 + 10, contentY + 43 + 25)

        }else {

            ctx.font = "bold 14px Microsoft YaHei"
            ctx.fillStyle = "#5A616B"
            ctx.fillText("我正在阅读剧本", contentX + 10, contentY + 43)
        }
        

        //绘制其他文字
        ctx.font = "normal 12px Microsoft YaHei"
        ctx.fillText("千部剧本随身带", contentX + 10, contentY + contentHeight - 70)
        ctx.fillText("最强编剧神器", contentX + 10, contentY + contentHeight - 35)
        ctx.drawImage(qrPath, contentX + (contentWidth - 82), contentY + contentHeight - 90, 72, 82)

        //绘制中间图片背景
        ctx.setFillStyle('#f9fafc')
        ctx.fillRect(contentX, contentY + 100, contentWidth, 175)

        //绘制剧本图片
        let coverY = contentY + 100 + 20
        ctx.drawImage(coverPath, contentX + (contentWidth - 70) / 2, coverY, 70, 100)
        
        ctx.font = "normal 12px Microsoft YaHei"
        ctx.fillStyle = "#5A616B"
        let scriptNameWidth = ctx.measureText(article.scriptName).width
        ctx.fillText(article.scriptName, contentX + (contentWidth - scriptNameWidth)/2, coverY + 100 + 25)

        let readText = article.readerNum + "人也在阅读"
        ctx.font = "normal 10px Microsoft YaHei"
        let readTextWidth = ctx.measureText(readText).width
        ctx.fillText(readText, contentX + (contentWidth - readTextWidth)/2, coverY + 100 + 25 + 15)

        ctx.font = "bold 14px Microsoft YaHei"
        let appNameWidth = ctx.measureText("歪马剧本").width
        ctx.fillText("歪马剧本", contentX + (contentWidth - appNameWidth)/2, contentY + 100 + 175 + 30)
        
        ctx.draw()
    }


    //Jwx

    if (userInfo.avatarUrl && userInfo.avatarUrl.length > 0) {

    }

    let make = function() {
        Utils.showLoading('制作中...')
        commonModel.fetchQRUrl({
            scriptId: article.scriptId
        }).then(qres => {

            if (qres.data.status == 200) {

                let coverdownload = Jwx.api('downloadFile', {url: article.coverUrl})
                let qrdownload = Jwx.api('downloadFile', {url: qres.data.data.qrcodeUrl})
                let p = Promise.all([coverdownload, qrdownload])
                p.then(res => {
                    Utils.hideLoading()
                    drawCanvas(null, res[0].tempFilePath, res[1].tempFilePath)
                })

                // if (userInfo.avatarUrl && userInfo.avatarUrl.length > 0) {
                //     let avatardownload = Jwx.api('downloadFile', {url: userInfo.avatarUrl})
                //     let coverdownload = Jwx.api('downloadFile', {url: article.coverUrl})
                //     let qrdownload = Jwx.api('downloadFile', {url: qres.data.data.qrcodeUrl})
                //     let p = Promise.all([avatardownload, coverdownload, qrdownload])
                //     p.then(res => {
                //         Utils.hideLoading()
                //         Utils.showToast('制作成功', true)
                //         drawCanvas(res[0].tempFilePath, res[1].tempFilePath, res[2].tempFilePath)
                //     })
                // }else {
                //     let coverdownload = Jwx.api('downloadFile', {url: article.coverUrl})
                //     let qrdownload = Jwx.api('downloadFile', {url: qres.data.data.qrcodeUrl})
                //     let p = Promise.all([coverdownload, qrdownload])
                //     p.then(res => {
                //         Utils.hideLoading()
                //         Utils.showToast('制作成功', true)
                //         drawCanvas(null, res[1].tempFilePath, res[2].tempFilePath)
                //     })
                // }
                
            }

        }).catch(e => {
            Utils.hideLoading()
            Utils.showModal('请求失败，请重试', true, (flag) => {
                if (flag) {
                    make()
                }
            })
        })
    }

    make()
    
    // wx.downloadFile({
    //     url: userInfo.avatarUrl, //仅为示例，并非真实的资源
    //     success: (res) => {
    //       // 只要服务器有响应数据，就会把响应内容写入文件并进入 success 回调，业务需要自行判断是否下载到了想要的内容
    //       if (res.statusCode === 200) {

    //             commonModel.fetchQRUrl({
    //                 scriptId: article.scriptId
    //             }).then(qres => {

    //                 if (qres.data.status == 200) {
                    
    //                     wx.downloadFile({
    //                         url: qres.data.data.qrcodeUrl,
    //                         success: (qrdownloadres) => {
    //                             if (qrdownloadres.statusCode === 200) {
                        
    //                                 wx.downloadFile({
    //                                     url: article.coverUrl,
    //                                     success: (response) => {
    //                                         if (response.statusCode === 200) {
                        
    //                                             drawCanvas(res.tempFilePath, response.tempFilePath, qrdownloadres.tempFilePath)
    //                                         }
    //                                     }
    //                                 })
    //                             }
    //                         }
    //                     })

    //                 }

    //             })

                
    //       }
    //     }
    //   })
  
  }

})
