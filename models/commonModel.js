"use strict";

import NetworkBase from "../server/NetworkBase"

class CommonModel extends NetworkBase {
    static sCommonModel = null;

    static sharedInstance() {
        if (CommonModel.sCommonModel == null) {
                CommonModel.sCommonModel = new CommonModel();
        }
        return CommonModel.sCommonModel;
    }

    constructor() {
        super()
    }

    // 剧本库
    fetchScriptStore() {
        return this.request(
            "/script/store", null,
            "POST"
        )
    }

    //热门剧本
    fetchHotScript(param) {
        return this.request(
            "/script/hotScript/list", param,
            "POST"
        )
    }

    //新进剧本
    fetchNewScript(param) {
        return this.request(
            "/script/newScript/list", param,
            "POST"
        )
    } 

    //运营剧本
    fetchOperationScript(param) {
        return this.request(
            "/operation/scriptList", param,
            "POST"
        )
    } 

    //书架接口
    fetchBookCase() {
        return this.request(
            "/read/bookCase/list", null,
            "POST"
        )
    }

    //剧本分类列表
    
    fetchScriptList(param) {
        return this.request(
            "/script/type/scriptList", param,
            "POST"
        )
    }

    //获取素材收藏夹列表
    fetchCollectFolderList() {
        return this.request(
            "/read/collect/pkgList", null,
            "POST"
        )
    }

    //获取收藏列表
    fetchCollectList(param) {
        return this.request(
            "/read/collect/fetch", param,
            "POST"
        )
    }

    //编辑素材收藏夹名称
    editPkgName(param) {
        return this.request(
            "/read/collect/editPkg", param,
            "POST"
        )
    }

    //删除笔记
    deleteNoteMark(param) {
        return this.request(
            "/read/noteMark/del", param,
            "POST"
        )
    }

    //搜索
    search(param) {
        return this.request(
            "/script/search", param,
            "POST"
        )
    }

    //编辑书本文件夹
    editBookFolder(param) {
        return this.request(
            "/read/bookCase/edit", param,
            "POST"
        )
    }

    //删除剧本
    deleteBook(param) {
        return this.request(
            "/read/bookCase/delete", param,
            "POST"
        )
    }

    //移动剧本
    moveBook(param) {
        return this.request(
            "/read/bookCase/move", param,
            "POST"
        )
    }

    //编辑笔记
    editNote(param) {
        return this.request(
            "/read/noteMark/editNote", param,
            "POST"
        )
    }

    //编辑笔记
    test() {
        return this.request(
            "http://scriptfile.ekaogo.com/21克的副本",
            "POST"
        )
    }

    //删除收藏的素材
    collectDel(param) {
        return this.request(
            "/read/collect/del", param,
            "POST"
        )
    }

    //创建素材收藏夹
    addCollectFolder(param) {
        return this.request(
            "/read/collect/addPkg", param,
            "POST"
        )
    }

    //收藏素材
    addCollect(param) {
        return this.request(
            "/read/collect/add", param,
            "POST"
        )
    }

    //下载二维码
    fetchQRUrl(param) {
        return this.request(
            "/script/share/info", param,
            "POST"
        )
    }

    //获取笔记的剧本列表
    fetchBookOfNotes() {
        return this.request(
            "/read/noteMark/scriptList", {},
            "POST"
        )
    }

    //删除收藏夹
    deleteColletFolder(param) {
        return this.request(
            "/read/collect/delPkg", param,
            "POST"
        )
    }

    //获取某个剧本的笔记列表
    fetchNotesOfScript(param) {
        return this.request(
            "/read/noteMark/list", param,
            "POST"
        )
    }

    //获取剧本详细信息
    fetchScript(param) {
        return this.request(
            "/read/script/fetch", param,
            "POST"
        )
    }

    //添加书本到书架
    addBookCase(param) {
        return this.request(
            "/read/bookCase/add", param,
            "POST"
        )
    }

    //从书架删除剧本
    deleteBookCase(param) {
        return this.request(
            "/read/bookCase/delete", param,
            "POST"
        )
    }

    //阅读记录上报
    readRecord(param) {
        return this.request(
            "/user/user/readRecord", param,
            "POST"
        )
    }

    //阅读状态上报
    putStatus(param) {
        return this.request(
            "/read/script/putStatus", param,
            "POST"
        )
    }

    //创建笔记
    addNote(param) {
        return this.request(
            "/read/noteMark/addNote", param,
            "POST"
        )
    }

    //删除文件夹
    deleteFolder(param) {
        return this.request(
            "/read/bookCase/delFolder", param,
            "POST"
        )
    }

}

module.exports = {
    commonModel: CommonModel.sharedInstance()
};