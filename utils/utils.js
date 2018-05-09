"use strict"

import Base64 from "./base64"

class Utils {

    constructor() {}

    static share = {
        title: "这个软件有你要的所有经典剧本",
        path: '/pages/scriptLibrary/scriptLibrary',
        imageUrl: '../../asset/images/fengmian.jpg',
        success: function(res) {
          // 转发成功
        },
        fail: function(res) {
          // 转发失败
        }
    }

    static systemInfo = wx.getSystemInfoSync()

    static formatTime(date) {
        var year = date.getFullYear()
        var month = date.getMonth() + 1
        var day = date.getDate()

        var hour = date.getHours()
        var minute = date.getMinutes()
        var second = date.getSeconds()

        return [
            [year, month, day].map(this.formatNumber).join('-'), [hour, minute].map(this.formatNumber).join(':')
        ]
        return [
            [year, month, day].map(this.formatNumber).join('-'), [hour, minute, second].map(this.formatNumber).join(':')
        ]
    }

    static formatLogTime(date) {
        var year = date.getFullYear()
        var month = date.getMonth() + 1
        var day = date.getDate()

        var hour = date.getHours()
        var minute = date.getMinutes()
        var second = date.getSeconds()

        return [
            [year, month, day].map(this.formatNumber).join(''), [hour, minute, second].map(this.formatNumber).join('')
        ]
    }

    static formatNumber(n) {
        n = n.toString()
        return n[1] ? n : '0' + n
    }

    static getTimestamp(stringTime) {
        var _stringTime = stringTime.replace(/\-/g, "/");
        var timestamp2 = Date.parse(new Date(_stringTime));
        timestamp2 = timestamp2 / 1000;
        return timestamp2;
    }

    static rpxToPx(rpx) {
        return rpx * Utils.systemInfo.windowWidth / 750
    }

    static pxToRpx(px) {
        return px / (Utils.systemInfo.windowWidth / 750)
    }

    static imageMogr(size) {
        return `imageslim`
        return `imageMogr2/thumbnail/${size}x${size}>/interlace/1`
    }

    static checkPhoneNum(phone) {
        if (/^1\d{10}$/.test(phone)) {
            return true;
        } else {
            return false;
        }
    }

    static showModal(content, cancel, callback) {
        wx.showModal({
            title: '',
            content: content,
            confirmColor: "#3883EB",
            showCancel: cancel?true:false,
            success: function(res) {
                if (res.confirm) {
                    callback && callback(true)
                } else if (res.cancel) {
                    callback && callback(false)
                }
            }
        })
    }

    static showLoading(text) {
        wx.showLoading({
            title: text || "",
            mask: true
        })   
    }
    
    static hideLoading() {
        wx.hideLoading()   
    }

    static showToast(title, success) {
        wx.showToast({
            title: title,
            icon: success? "success":"none",
            duration: 2000,
            mask: true
        })
    }

    static trim(s) {
        return s.replace(/(^\s*)|(\s*$)/g, "");
    }

    static gotoArticle(data) {
        const app = getApp()
        wx.navigateTo({
            url: '../article/article?article=' + JSON.stringify(data)
        })
    }

}

module.exports = Utils