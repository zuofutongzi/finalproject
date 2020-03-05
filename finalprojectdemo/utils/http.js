const config = getApp().appData.config;
const errtip = {1: '出现了错误', 1005: '不正确开发者key', 1000: '输入参数错误'}

class HTTP{
  request(params){
    var that = this;
    if(!params.method){
      params.method = 'GET'
    }
    var url = config.api_base_url + params.url;
    wx.request({
      url: url,
      header: {
        'content-type': 'application/json;charset=UTF-8',
        'appkey': config.appkey,
        'Authorization': config.token,
        'cookie': config.cookie
      },
      method: params.method,
      data: params.data,
      success: (res) => {
        let code = res.statusCode.toString();
        if(code.startsWith('2')){
          params.success && params.success(res.data);
        }
        else{
          let errorcode = res.data.error_code;
          this._show_errorcode(errorcode);
        }
      },
      fail: (err) => {
        this._show_errorcode(1);
      }
    })
  }
  _show_errorcode(errorcode){
    if(!errorcode){
      errorcode = 1;
    }
    wx.showToast({
      title: errtip[errorcode],
      icon: 'none',
      duration: 2000
    })
  }
}
export { HTTP };