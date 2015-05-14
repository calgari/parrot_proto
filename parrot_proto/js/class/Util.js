/**
 * @fileOverview 共通処理クラス
 *
 * @author Jun Nomura
 * @version 1.0.0
 */
if(Parrot===undefined) var Parrot={};
(function(){
  /**
   * 共通処理を管理数クラス
   * @class 共通処理クラス
   */
  Parrot.Util={
    /**
     * APIへアクセスするための情報を生成する。
     * @param {string} attrUrl APIへのURL
     * @param {object} attrCallback 情報取得成功時に実行されるイベント
     * @returns {object} APIへアクセスするための情報
     * @memberOf Parrot.Util 
     */
    createAjaxAttribute: function(attrUrl, attrCallback){
      var errorFunction = function(){console.log('ajax error occuered')};
      var attribute = {url: '', type: 'GET', dataType: 'xml', timeout: 10000, success: null, error: errorFunction};
      attribute.url = attrUrl;
      attribute.success = attrCallback;
      return attribute;
    },
    /**
     * カスタムイベントを発行する。
     * @param {string} eventName イベント名
     * @param {object} target イベントを受け取るDOM
     * @param {object} publisher イベント発行者オブジェクト
     * @param {object} data イベントに添付するデータ
     * @memberOf Parrot.Util 
     */
    raiseEvent: function(eventInfo){
      if(!eventInfo.target) eventInfo.target = document;
      
      var myEvent = document.createEvent("HTMLEvents");
      myEvent.initEvent(eventInfo.eventName, true, true);
      myEvent.publisher=eventInfo.publisher;
      myEvent.attachedData=eventInfo.attachedData;
      eventInfo.target.dispatchEvent(myEvent);
    }
  }
})();