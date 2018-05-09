"use strict"

import NetworkBase from "../server/NetworkBase"

class UserModel extends NetworkBase {
    static sUserModel = null;

    static sharedInstance() {
        if (UserModel.sUserModel == null) {
                UserModel.sUserModel = new UserModel();
        }
        return UserModel.sUserModel;
    }

    constructor() {
        super()
    }

    // 获取个人信息
    fetchUserInfo() {
        return this.request(
            "/user/user/fetch", null,
            "POST"
        )
    }

    // 更新个人信息
    updateUserInfo(param) {
        return this.request(
            "/user/user/edit", param,
            "POST"
        )
    }

    //登录
    login(param) {
        return this.request(
            "/user/login/openId", param,
            "POST"
        )
    }

    //更新用户信息
    updateUserInfo(param) {
        return this.request(
            "/user/user/add", param,
            "POST"
        )
    }

}

module.exports = {
    userModel: UserModel.sharedInstance()
};