/**
* @description adapter对象提供了十进制数据与二进制数据相互转换的功能
*/
var adapter = {
    /**
    * @method encode
    * @for adapter
    * @param {number} info - 被编译的十进制数据
    * @param {number} bit - 二进制数据的位数
    * @returns {string} 返回的二进制数据
    */
	encode: function(info, bit){
		var tem = Math.floor(info).toString(2);
		for(var i=0,len=bit-tem.length;i<len;i++){
			tem = '0' + tem;
		}
		return tem;
	},
    /**
    * @method decode
    * @for adapter
    * @param {string} info - 被解码的二进制数据
    * @returns {number} 返回的十进制数据
    */
	decode: function(info){
		return parseInt(info, 2);
	}
}
