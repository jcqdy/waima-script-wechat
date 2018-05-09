'use strict'

import { Lan } from "../localize/Localize"

export default class NetworkBase {

    constructor() {}

    //root = "https://script-test.ekaogo.com"
    root = "https://script.ekaogo.com"

    request(url, parameters, method) {
        return new Promise((resolve, reject) => {

            method = method || "GET"
            const app = getApp()
            let commonParam = {appName: app.globalData.appName, 
                appVersion: app.globalData.appVersion, 
                platform: app.globalData.platform,
                userId: app.globalData.userInfo? app.globalData.userInfo.userId : "" 
            }
            parameters = Object.assign(parameters || {}, commonParam)

            if (method == "GET") {
                let paramPairArr = []
                let paramString = ""
                for (var key in parameters) {
                    paramPairArr.push(key + "=" + parameters[key])
                }
                paramString = paramPairArr.join("&")
                if (paramString.length > 0) {
                    url = url + "?" + paramString
                }
            }

            wx.request({

                url: this.root + url,

                data: parameters,

                method: method,

                header: {
                    "Content-Type": "application/x-www-form-urlencoded"
                },

                success: function(res) {
                    if (res.data.status == 200) {
                        resolve && resolve(res)
                    } else {
                        reject && reject(res)
                    }
                },

                fail: function(error) {
                    // wx.showModal({
                    //     title: Lan.requestFail,
                    //     content: Lan.requestFailDesc,
                    //     showCancel: false,
                    //     confirmText: "确定",
                    //     confirmColor: '#3A404D',
                    //     cancelColor: '#999'
                    // })
                    reject && reject(error)
                },

                complete: function(res) {
                    // wx.stopPullDownRefresh()
                }

            })
        })
    }

    baseUploadFile(requestURL, filePath, progressCallback) {
        return new Promise((resolve, reject) => {
            wx.uploadFile({
                url: this.root + requestURL,
                filePath: filePath ? filePath : "",
                name: 'Filedata',
                formData: {},
                success: (upres) => {
                    resolve && resolve(upres)
                },
                fail: () => {
                    reject && reject(error)
                },
                complete: () => {

                }
            }).onProgressUpdate((res) => {
                progressCallback && progressCallback(res.progress)
            })
        })
    }

    wxLogin() {
        return new Promise((resolve, reject) => {
            wx.login({
                success: (res) => {
                    resolve && resolve(res)
                },
                fail: (error) => {
                    reject && reject(error)
                },
                complete: () => {

                }
            })
        })
    }
}