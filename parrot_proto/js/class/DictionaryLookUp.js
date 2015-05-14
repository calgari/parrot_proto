/**
 * @fileOverview 辞書APIから単語を検索するクラス
 *
 * @author Jun Nomura
 * @version 1.0.0
 */
if(Parrot===undefined) var Parrot={};
(function(){
  /**
   * 新しいDictionaryLookUpオブジェクトを作成する。
   * @class 1つの辞書検索オブジェクトを表すクラス
   * @constructor 
   * @param {string} originalWord 検索元となるキーワード
   * @param {object} $textSendButton 辞書検索実行ボタン(jQueryObject)
   * @property {object} foundWords 検索結果
   * @property {string} URLForGetId APIへのアクセスに使用する文字列
   * @property {string} AttributeForGetId　APIへのアクセスに使用する文字列
   * @property {string} URLForGetWord APIへのアクセスに使用する文字列
   * @property {string} AttributeForGetWord　APIへのアクセスに使用する文字列
   * @property {string} dictionaryJE 使用する和英辞典のID
   * @property {string} originalWord 検索元となるキーワード
   * @property {object} $textSendButton 辞書検索実行ボタン(jQueryObject)
   * @property {object} $searchResultDisplayArea 検索結果表示エリア(jQueryObject)
   * @property {object} unnecessaryTranslatedWord 検索結果単語欄に表示しない単語
   * @property {int} indexOfListOfItemContainsUnnecessaryWord　検索結果単語欄に表示しない単語を持っていた場合の、単語の番目（持っていなければ-1）
   */ 
  Parrot.DictionaryLookUp=function(originalWord, $textSendButton, $searchResultDisplayArea){
    this.originalWord=originalWord;
    this.$textSendButton=$textSendButton;
    this.$searchResultDisplayArea=$searchResultDisplayArea;
    this.checkHasUnnecessaryTranslatedWord();
  };
  Parrot.DictionaryLookUp.searchResultGroupCount=0;
  Parrot.DictionaryLookUp.prototype={
    /**
     * 辞書APIから単語のIDを取得する
     * @memberOf Parrot.DictionaryLookUp 
     */
    getWordId: function(){
      var thisInstance = this;
      var url = this.URLForGetId +'?Dic='+this.dictionaryJE+'&Word='+this.originalWord+this.AttributeForGetId;
      var groupNum = Parrot.DictionaryLookUp.searchResultGroupCount;
      var success = function(data){
        var attachedData={'ajaxResponse':data, 'groupNum': groupNum};
        var getWordIdEndEvent={'eventName':'getWordIdEndEvent', 'attachedData':attachedData, 'publisher':thisInstance, 'target':document};
        Parrot.Util.raiseEvent(getWordIdEndEvent);
      };
      var attr = Parrot.Util.createAjaxAttribute(url, success);
      $.ajax(attr);
      Parrot.DictionaryLookUp.searchResultGroupCount++;
      
      var getWordIdStartEvent={'eventName':'getWordIdStartEvent', 'attachedData':groupNum, 'publisher':this, 'target':document};
      Parrot.Util.raiseEvent(getWordIdStartEvent);
    },
    /**
     * 辞書APIから翻訳した単語を取得する
     * @param {object} data APIから渡される単語情報
     * @param {int} groupNum 文を単語に分割した際の単語番号
     * @memberOf Parrot.DictionaryLookUp 
     */
    getTranslatedWord: function(data, groupNum){
      var response = $.parseXML( data.responseText );
      var thisInstance = this;
      var itemCountForFiltering = 0;
      $(response).find('itemid').each(function(){
        if(thisInstance.translatedWordIsUnnecessary(itemCountForFiltering)){
          itemCountForFiltering++;
          return;
        }
        var item=$(this).text();
        var url = thisInstance.URLForGetWord +'?Dic='+thisInstance.dictionaryJE+'&Item='+item+thisInstance.AttributeForGetWord;
        var success = function(data){
          var attachedData={'ajaxResponse':data, 'groupNum': groupNum};
          var getTranslatedWordEndEvent={'eventName':'getTranslatedWordEndEvent', 'attachedData':attachedData, 'publisher':thisInstance, 'target':document};
          Parrot.Util.raiseEvent(getTranslatedWordEndEvent);
        };
        var attr = Parrot.Util.createAjaxAttribute(url, success);
        $.ajax(attr);
        itemCountForFiltering++;
      });
    },
    /**
     * 取得した検索結果をプロパティに保持する
     * @param {object} data APIから渡される単語検索結果
     * @param {int} groupNum 文を単語に分割した際の単語番号
     * @memberOf Parrot.DictionaryLookUp 
     */
    storeTranslatedWord: function(data, groupNum){
      var $response = $($.parseXML(data.responseText));
      var originalWord = $response.find('.NetDicHeadTitle').text();
      var translatedWords = [];
      $response.find('.NetDicBody > div > div').each(function(){
        var text = $(this).text();
        text = text.replace('↵', "");//改行コードトリミング
        text = text.replace(/(\(.*\))/g, "");//括弧内をトリミング
        text = text.replace(/(^\s+)|(\s+$)/g, "");//空白文字トリミング
        if(!text) return;
        translatedWords.push(text);
      });
      this.foundWords = {
        'originalWord':originalWord,
        'translatedWords': translatedWords,
        'groupNum': groupNum
      }
      
      var storeTranslatedWordEndEvent={'eventName':'storeTranslatedWordEndEvent', 'attachedData':null, 'publisher':this, 'target':document};
      Parrot.Util.raiseEvent(storeTranslatedWordEndEvent);
    },
    /**
     * 画面上に検索結果を表示する
     * @memberOf Parrot.DictionaryLookUp 
     */
    displayFoundWords: function(){
      console.log(this.foundWords);
      var $item=$('<dl class="search-result"><dt>'+this.foundWords.originalWord+'</dt></dl>');
      var translatedWords = this.foundWords.translatedWords;
      var translatedWordsCount = translatedWords.length;
      for(var i=0; i<translatedWordsCount; i++){
        $item.append($('<dd>'+translatedWords[i]+'</dd>'));
      }
      
      var itemGroupId = 'SearchResultGroup_'+this.foundWords.groupNum;
      var $itemGroup = $('#'+itemGroupId);
      if($itemGroup.length===0){
        $itemGroup=$('<li id="'+itemGroupId+'" class="search-result-group"></li>');
        this.$searchResultDisplayArea.append($itemGroup);
      }
      $itemGroup.css('opacity', '');
      
      $itemGroup.append($item);
      $item[0].scrollIntoView();
      this.clearInstance();
    },
    /**
     * DictionaryLookUpインスタンスを他オブジェクトの参照から外す
     * @memberOf Parrot.DictionaryLookUp 
     */
    clearInstance: function(){
    },
    checkHasUnnecessaryTranslatedWord: function(){
      var list = this.unnecessaryTranslatedWord;
      var listLength = this.unnecessaryTranslatedWord.length;
      for(var i=0;i<listLength;i++){
        if(this.originalWord===list[i].originalWord) this.indexOfListOfItemContainsUnnecessaryWord = i;
      }
    },
    translatedWordIsUnnecessary: function(num){
      if(this.indexOfListOfItemContainsUnnecessaryWord===-1) return false;
      var unnecessaryIdList = this.unnecessaryTranslatedWord[this.indexOfListOfItemContainsUnnecessaryWord].unnecessaryTranslatedWordNum;
      if(unnecessaryIdList.indexOf(num)!=-1) return true;
      return false;
    },
    foundWords: {},
    URLForGetId: 'http://public.dejizo.jp/NetDicV09.asmx/SearchDicItemLite',
    AttributeForGetId: '&Scope=HEADWORD&Match=EXACT&Merge=AND&Prof=XHTML&PageSize=5&PageIndex=0',
    URLForGetWord: 'http://public.dejizo.jp/NetDicV09.asmx/GetDicItemLite',
    AttributeForGetWord: '&Prof=XHTML&Loc=',
    dictionaryJE: 'EdictJE',
    originalWord: '',
    $textSendButton: null,
    $searchResultDisplayArea: null,
    unnecessaryTranslatedWord: [
      {'originalWord':'する', 'unnecessaryTranslatedWordNum':[0, 2, 3, 4]},
      {'originalWord':'とる', 'unnecessaryTranslatedWordNum':[0, 2]},
      {'originalWord':'とりあえず', 'unnecessaryTranslatedWordNum':[1, 2]},
      {'originalWord':'いい', 'unnecessaryTranslatedWordNum':[0, 1, 2, 3]},
      {'originalWord':'行く', 'unnecessaryTranslatedWordNum':[1]},
      {'originalWord':'言う', 'unnecessaryTranslatedWordNum':[1]},
      {'originalWord':'よく', 'unnecessaryTranslatedWordNum':[1, 3, 5]},
      {'originalWord':'キー', 'unnecessaryTranslatedWordNum':[1, 2, 3, 4]}
    ],
    indexOfListOfItemContainsUnnecessaryWord: -1
  }
})();