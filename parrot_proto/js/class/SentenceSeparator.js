/**
 * @fileOverview 文章を単語単位で分割する
 *
 * @author Jun Nomura
 * @version 1.0.0
 */
if(Parrot===undefined) var Parrot={};
(function(){
  /**
   * 新しいSentenceSeparatorオブジェクトを作成する。
   * @class 1つの単語分割オブジェクトを表すクラス
   * @constructor 
   * @param {array} seperatedWords　分割した単語を格納する配列
   * @param {object} $textSendButton 単語分割実行ボタン(jQueryObject)
   * @param {string} originalSentence　単語分割対象となる文字列
   * @param {string} URLForSeperateSentence　APIへのアクセスに使用する文字列
   * @param {string} AttributeForSeperateSentence　APIへのアクセスに使用する文字列
   * @param {array} unNecessaryWordType　不要な単語の品詞名を列挙した配列
   * @param {array} filterEscapeWord 品詞フィルタをくぐり抜ける単語の配列
   * @param {bool} wordTypeCheckMode 単語の品詞をチェックしたいときに使用するフラグ（開発用）
   */
  Parrot.SentenceSeparator=function(sentence, $textSendButton){
    this.originalSentence=sentence;
    this.seperatedWords=[];
    this.$textSendButton = $textSendButton;
  };
  Parrot.SentenceSeparator.prototype={
    /**
     * 単語分割実行
     * @memberOf Parrot.SentenceSeparator 
     */
    exec: function(){
      var url = this.URLForSeperateSentence+'?sentence='+this.originalSentence+this.AttributeForSeperateSentence;
      var thisInstance = this;
      var success = function(data){
        var sentenceSeparateEndEvent={'eventName':'sentenceSeparateEndEvent', 'attachedData':data, 'publisher':thisInstance, 'target':document};
        Parrot.Util.raiseEvent(sentenceSeparateEndEvent);
      };
      var attr = Parrot.Util.createAjaxAttribute(url, success);
      $.ajax(attr);
    },
    /**
     * 分割した単語を配列に格納
     * @param {object} data APIから渡される単語情報
     * @memberOf Parrot.SentenceSeparator 
     */
    createWordList: function(data){
      var $response = $($.parseXML(data.responseText));
      var thisInstance = this;
      $response.find('word pos').each(function(){
        var $this = $(this);
        var posText = $this.text();
        var pos = posText.split(',');
        var baseFormText = $this.next().text();
        if(thisInstance.filter(pos, baseFormText)){
          thisInstance.seperatedWords.push(baseFormText);
        }
        if(thisInstance.wordTypeCheckMode){
          console.log('word:'+ baseFormText + ' type:'+ pos);
        }
      });
      
      var wordList=this.seperatedWords.slice(0);
      var createWordListEndEvent={'eventName':'createWordListEndEvent', 'attachedData':wordList, 'publisher':this, 'target':document};
      Parrot.Util.raiseEvent(createWordListEndEvent);
      
      this.clearInstance();
    },
    /**
     * 検索する単語にフィルタをかける
     * @param {array} pos 品詞の配列
     * @param {string} baseFormText 単語の文字列（状態変化前）
     * @memberOf Parrot.SentenceSeparator 
     */
    filter: function(pos, baseFormText){
      var filterEscapeWord = this.filterEscapeWord;
      var escapeWordCount = filterEscapeWord.length;
      for(var j=0; j<escapeWordCount; j++ ){
        if(baseFormText === filterEscapeWord[j]) return true;
      }
      
      var filterType = this.unNecessaryWordType;
      var filterCount = filterType.length;
      
      for(var i=0; i<filterCount; i++){
        if(pos.indexOf(filterType[i])!=-1) return false;
      }
      if(baseFormText === '*') return false;
      return true;
    },
    /**
     * SentenceSeparatorインスタンスを他オブジェクトの参照から外す
     * @memberOf Parrot.SentenceSeparator 
     */
    clearInstance: function(){
      this.$textSendButton.off('click', this.exec);
    },
    seperatedWords: [],
    $textSendButton: null,
    originalSentence: '',
    URLForSeperateSentence: 'http://chasen.org/~taku/software/mecapi/mecapi.cgi',
    AttributeForSeperateSentence: '&response=pos%2Cbaseform&filter=uniq&format=xml',
    unNecessaryWordType: ['格助詞', '係助詞', '非自立', '連体化', '接続助詞', '助動詞', '副助詞／並立助詞／終助詞', '終助詞', '副助詞', '並立助詞', '記号','接尾'],
    filterEscapeWord: ['時'],
    wordTypeCheckMode: false
  }
})();