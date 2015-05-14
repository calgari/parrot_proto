$(document).ready(function(){
  "use strict";
  
  ////チャットシステム起動
  var $sendButton = $('#SendButton');
  var $messageInput = $('#MessageInput');
  var $messageBoard = $('#Messages');
  var chat = new Parrot.Chat($sendButton, $messageInput, $('#Messages'));
  $sendButton.click(function(){chat.submitMessage();});
  
  ////音声認識を起動
  var vi = new Parrot.VoiceInput();
  $('#VoiceInputSwitch').bind('change', function(){
    if(this.checked) vi.recStart();
    else vi.recEnd();
  });
  document.addEventListener("voiceInputResultEvent", function(event){
    $messageInput.val(event.attachedData.text);
  }, false);
  document.addEventListener("voiceInputEndEvent", function(event){
    if($messageInput.val()) $sendButton.trigger('click');
  }, false);
  
  ///////文章を単語に分割
  $sendButton.click(function(){
    var ss=new Parrot.SentenceSeparator($messageInput.val(), $sendButton);
    ss.exec();
  });
  document.addEventListener("sentenceSeparateEndEvent", function(event){
    event.publisher.createWordList(event.attachedData);
  }, false);
  
  ///////単語一つ一つの、英訳を検索
  var $searchResultPanel = $('#SearchResultPanel');
  document.addEventListener("createWordListEndEvent", function(event){
    var wordList = event.attachedData;
    var wordCount = wordList.length;
    if(wordCount <= 0) return;
    for(var i=0; i<wordCount; i++){
      var dlu = new Parrot.DictionaryLookUp(wordList[i], $sendButton, $searchResultPanel);
      dlu.getWordId();
    }
    console.log(wordList);
  }, false);
  document.addEventListener("getWordIdStartEvent", function(event){
    var $itemGroup=$('<li id="SearchResultGroup_'+event.attachedData+'" class="search-result-group"></li>');
    $itemGroup.css('opacity', 0);
    $searchResultPanel.append($itemGroup);
  }, false);
  document.addEventListener("getWordIdEndEvent", function(event){
    event.publisher.getTranslatedWord(event.attachedData.ajaxResponse, event.attachedData.groupNum);
  }, false);
  document.addEventListener("getTranslatedWordEndEvent", function(event){
    event.publisher.storeTranslatedWord(event.attachedData.ajaxResponse, event.attachedData.groupNum);
  }, false);
  document.addEventListener("storeTranslatedWordEndEvent", function(event){
    event.publisher.displayFoundWords();
  }, false);
  
  ///////UI制御
  document.onkeydown = function (e){
    // InternetExplorer 用
    if (!e) e = window.event;
    if(e.keyCode===13){
      if($messageInput.is( ":focus" )) $sendButton.trigger('click');
    }
  };
});