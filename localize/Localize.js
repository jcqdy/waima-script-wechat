"use strict"

let Localize = {
    lan:{},
    imagesUrl:{}
}

Object.defineProperties(Localize.lan, {
    
    requestFail:{
        value:"请求失败",
        writable:false,
        configurable:false
    },

    requestFailDesc:{
        value:"请检查网络或稍后重试",
        writable:false,
        configurable:false
    },

    loading:{
        value:"加载中",
        writable:false,
        configurable:false
    },
    
})

Object.defineProperties(Localize.imagesUrl, {
    
    requestFail:{
        value:"请求失败",
        writable:false,
        configurable:false
    },

    requestFailDesc:{
        value:"请检查网络或稍后重试",
        writable:false,
        configurable:false
    },
    
})

module.exports = {
    Lan: Localize.lan
}