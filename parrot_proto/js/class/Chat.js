/**
 * @fileOverview リアルタイムチャットを制御するクラス
 *
 * @author Jun Nomura
 * @version 1.0.0
 */
if(Parrot===undefined) var Parrot={};
(function(){
  /**
   * WebSocketを使ってリアルタイムチャットを制御する
   * @class リアルタイムチャット制御クラス
   * @property {object} $messageSendButton メッセージ送信ボタン（jQueryObject）
   * @property {object} $messageInputForm メッセージ入力フォーム（jQueryObject）
   * @property {object} $messageBoard メッセージ表示エリア（jQueryObject）
   * @property {string} baasId BaaSにアクセスするためのId
   * @property {object} chatServer BaaSのインスタンス
   * @property {object} chatDataStore: BaaSのデータストア
   */
  Parrot.Chat=function($messageSendButton, $messageInputForm, $messageBoard){
    this.chatServer = new MilkCocoa(this.baasId);
    this.chatDataStore = this.chatServer.dataStore("chat");
    this.$messageSendButton=$messageSendButton;
    this.$messageInputForm=$messageInputForm;
    this.$messageBoard=$messageBoard;
    
    var thisInstance = this;
    this.chatDataStore.on("push",function(data){
      thisInstance.displayMessage(data.value.message);
    });
  };
  Parrot.Chat.prototype={
    /**
     * チャットメッセージを送信する
     * @memberOf Parrot.Chat 
     */
    submitMessage: function(){
      var text = this.$messageInputForm.val();
      var thisInstance = this;
      this.chatDataStore.push({'message': text}, function(data){});
      setTimeout(function(){thisInstance.$messageInputForm.val('');}, 0);
    },
    /**
     * チャットメッセージを表示する
     * @param {string} message SocketIOから取得したチャットメッセージ
     * @memberOf Parrot.Chat 
     */
    displayMessage: function(message){
      var $elm = $('<li>');
      this.$messageBoard.append($elm.text(message));
      $elm[0].scrollIntoView();
    },
    $messageSendButton: null,
    $messageInputForm: null,
    $messageBoard: null,
    baasId: 'zooi9fkn8bj.mlkcca.com',
    chatServer: null,
    chatDataStore: null
  };
})();