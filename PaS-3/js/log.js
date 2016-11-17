/**
* @description 添加飞船的状态信息
* @method statusLog
*/
function statusLog(){
	var trs = $('#container .status-log tr');
	var td = $('#container .status-log td');
		trs.map(function(){
			var className = $(this).attr('class');
			if(!className){
				return;
			}
			var status = data[className].status;
			if(!status){
				return;
			}
			if($(this).find('.status').text() === '即将销毁'){
				$(this).find('td').map(function(){
					$(this).empty();
					data[className].status = undefined;

				})
			}else{
				$(this).find('td').map(function(){
					var val = data[className][$(this).attr('class')]
					$(this).text(val)
				})
			}

		})
}
/**
* @description 为命令日志添加信息
* @method commandLog
*/
function commandLog(value){
    var commandLog = $('#container .command-log');
    var log = $('<p>' + value[0] + '</p>');
    log.addClass(value[1]);
	commandLog.append(log).animate({
        scrollTop: log.offset().top - commandLog.offset().top + commandLog.scrollTop()
    })
    commandLog.focus();
}

setInterval(statusLog, 1000);
