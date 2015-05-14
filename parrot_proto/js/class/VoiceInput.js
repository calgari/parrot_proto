/**
 * @fileOverview 音声入力を制御するクラス
 *
 * @author Jun Nomura
 * @version 1.0.0
 */
if(Parrot===undefined) var Parrot={};
(function(){
  /**
   * 新しいVoiceInputオブジェクトを作成する。
   * @class 1つの音声入力制御オブジェクトを表すクラス
   * @constructor 
   * @property {object} recoginition SpeechRecognitionインスタンス
   */ 
  Parrot.VoiceInput=function(){
    this.init();
  };
  Parrot.VoiceInput.prototype={
    /**
     * 初期化（SpeechRecognitionインスタンスの設定と各種イベント発行）
     * @memberOf Parrot.VoiceInput 
     */
    init: function(){
      window.SpeechRecognition = window.SpeechRecognition || webkitSpeechRecognition;
      this.recognition = new SpeechRecognition();
      this.recognition.lang = 'ja';
      this.recognition.continuous = true;
      this.recognition.interimResults = true;
      
      var thisInstance = this;
      this.recognition.addEventListener('start', function(){
        var voiceInputStartEvent={'eventName':'voiceInputStartEvent', 'attachedData':null, 'publisher':thisInstance, 'target':document};
        Parrot.Util.raiseEvent(voiceInputStartEvent);
      });
      this.recognition.addEventListener('end', function(){
        var voiceInputEndEvent={'eventName':'voiceInputEndEvent', 'attachedData':null, 'publisher':thisInstance, 'target':document};
        Parrot.Util.raiseEvent(voiceInputEndEvent);
      });
      this.recognition.addEventListener('result', function(event){
        var results = event.results;
        for (var i = event.resultIndex; i<results.length; i++){
          var text = results[i][0].transcript;
          var voiceInputResultEvent={'eventName':'voiceInputResultEvent', 'attachedData':{'text': text}, 'publisher':thisInstance, 'target':document};
          Parrot.Util.raiseEvent(voiceInputResultEvent);
        }
      });
    },
    /**
     * 音声入力スタート
     * @memberOf Parrot.VoiceInput 
     */
    recStart: function(){
      this.recognition.start();
    },
    /**
     * 音声入力ストップ
     * @memberOf Parrot.VoiceInput 
     */
    recEnd: function(){
      this.recognition.stop();
    },
    recoginition: null
  };
})();