var app = getApp();
import { HTTP } from '../../utils/http.js'
let http = new HTTP();
Page({

  /**
   * 页面的初始数据
   */
  data: {
    username: null,
    password: null,
    useridentity: 'student',
    identify: null,
    identifycode: null,
    identity: [
      { name: '学生', value: 'student', checked: true },
      { name: '教师', value: 'teacher' },
      { name: '管理员', value: 'manager' }
    ]
  },

  /**
   * 生命周期函数--监听页面加载
   */
  onLoad: function (options) {
    if(app.appData.userinfo != null){
      // 已经登陆跳转到通知页面
      wx.redirectTo({
        url: '../notify/notify',
      })
    }
    const fileManager = wx.getFileSystemManager();
    wx.downloadFile({
      url: 'http://127.0.0.1:5000/api/identify?width=130.65&height=40',
      success: (res) => {
        let fileData = fileManager.readFileSync(res.tempFilePath, 'base64');
        this.setData({
          identify: `"data:image/svg+xml;base64,${fileData}"`
        });
        app.appData.config.cookie = res.header["Set-Cookie"];
      }
    });
  },

  /**
   * 生命周期函数--监听页面初次渲染完成
   */
  onReady: function () {
    
  },

  /**
   * 生命周期函数--监听页面显示
   */
  onShow: function () {
    
  },

  /**
   * 生命周期函数--监听页面隐藏
   */
  onHide: function () {
    
  },

  /**
   * 生命周期函数--监听页面卸载
   */
  onUnload: function () {
    
  },

  /**
   * 页面相关事件处理函数--监听用户下拉动作
   */
  onPullDownRefresh: function () {
    
  },

  /**
   * 页面上拉触底事件的处理函数
   */
  onReachBottom: function () {
    
  },

  /**
   * 用户点击右上角分享
   */
  onShareAppMessage: function () {
    
  },

  loginBtnClick: function() {
    var params = {
      userid: this.data.username,
      password: this.data.password,
      identity: this.data.useridentity,
      identifyCode: this.data.identifycode
    }

    http.request({
      url: '/api/user/' + params.userid,
      method: 'POST',
      data: params,
      success: (res) => {
        app.appData.config.token = res.token;
        wx.redirectTo({
          url: '../notify/notify',
        })
      }
    })
  },

  usernameInput: function(event){
    this.setData({ username:event.detail.value })
  },

  passwordInput: function(event){
    this.setData({ password: event.detail.value })
  },

  identifyInput: function(event){
    this.setData({ identifycode: event.detail.value })
  },

  radioChange: function(event){
    this.setData({ useridentity: event.detail.value })
  },

  refreshidentify: function(event){
    const fileManager = wx.getFileSystemManager();
    wx.downloadFile({
      url: 'http://127.0.0.1:5000/api/identify?width=130.65&height=40',
      success: (res) => {
        let fileData = fileManager.readFileSync(res.tempFilePath, 'base64');
        this.setData({
          identify: `"data:image/svg+xml;base64,${fileData}"`
        });
        app.appData.config.cookie = res.header["Set-Cookie"];
      }
    });
  }
})
