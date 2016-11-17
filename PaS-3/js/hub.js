/* -------------------------------------------控制中心-------------------------------------------- */

var hub = {
	spaceshipType: null,
    /**
    * @description 分析被按下的按钮所表达的信息
    * @method analyse
    * @for hub
    * @param {Object} tar - 某个按钮所在的dom对象
    * @param {number} actionSignal
    * @returns {object} 信号接收者标识具体信组成的对象
    */
	analyse: function(tar, actionSignal) {
		return {
			markSignal: parseInt(tar.attr('name')),
			actionSignal: actionSignal
		};
	},
    /**
    * @description 将要发送的信息编码成二进制数据
    * @method encode
    * @for hub
    * @param {number} info - 需要发送的命令
    * @returns {string}
    */
	encode: function(info){
		return adapter.encode(info.markSignal, 4) + adapter.encode(info.actionSignal, 4)
	},
    /**
    * @description 处理飞船发来的信息
    * @method signalHandle
    * @for hub
    * @param {string} message
    */
	signalHandle: function(message){
		var mark = 'spaceship' + adapter.decode(message.substring(0, 4));
		data[mark].status = adapter.decode(message.substring(4, 8));
		data[mark].power = adapter.decode(message.substring(8, 16)) + '%';
	},
    /**
    * @description 用来获取将要生成的飞船的型号
    * @method getSpaceshipType
    * @for hub
    */
	//
	getSpaceshipType: function() {
		this.spaceshipType =  {
			dynamicsType: $('#container .launch-board :radio[name=dynamics]:checked').val(),
			energyType: $('#container .launch-board :radio[name=energy]:checked').val()
		};
	},
    /**
    * @description 这个方法用来发射飞船
    * @method launch
    * @for hub
    * @param {number} markSignal
    */
	//这个方法用来发射飞船
	launch: function(markSignal) {
		var spaceshipType = this.spaceshipType;
		if(spaceshipType){
			var spaceship = new Spaceship(markSignal, spaceshipType);
			this.addSubscriber(spaceship);
			scene.append(spaceship);
			data['spaceship'+markSignal]['dynamics'] = spaceshipType.dynamicsType;
			data['spaceship'+markSignal]['energy'] = spaceshipType.energyType;
			this.spaceshipType = null;
		}
	},
    /**
    * @description 获取此刻的时间
    * @method getTime
    * @for hub
    * @returns {string}
    */
	getTime: function(){
		var date = new Date();
		return date.getFullYear() + '.' + (date.getMonth()+1) + '.' + date.getDate()+' '+date.toTimeString().match(/(.+)GMT/)[1];
	},
    /**
    * @description 控制台的总控制系统
    * @method control
    * @for hub
    */
	//这个方法是控制台的总控制系统
	control: function(tar){
		if(typeof tar === 'string'){
			this.signalHandle(tar);
			return;
		}
		switch(tar.attr('class')){
			case 'create-btn':
				this.getSpaceshipType();
				data.log = [this.getTime() + '创建飞船: <br>动力系统型号：' + data.dynamicsName[this.spaceshipType.dynamicsType - 1] + '<br>能源系统型号: ' + data.energyName[this.spaceshipType.energyType - 1], 'log-create'];
				break;
			case 'launch-btn':
                var markSignal = this.analyse(tar).markSignal;
                if(scene.display[markSignal]){
                    data.log = [this.getTime() + '此轨道已存在飞船', 'invalid'];
                } else if(this.spaceshipType) {
                    data.log = [this.getTime() + '发射飞船进入'+ markSignal + '轨道', 'log-launch'];
                    this.launch(markSignal);
                } else {
                    data.log = [this.getTime() + '尚未创建新飞船', 'invalid'];
                }
                break;
			case 'move-btn':
				var info = this.analyse(tar, 1);
				var binaryInfo = this.encode(info);
				this.publish(binaryInfo);
                scene.display[info.markSignal] ?
                data.log = [this.getTime() + '命令' + info.markSignal + '号飞船开始飞行', 'log-move'] :
				data.log = [this.getTime() + '该轨道无飞船', 'invalid'];
				break;
			case 'stop-btn':
				var info = this.analyse(tar, 2);
				var binaryInfo = this.encode(info);
				this.publish(binaryInfo);
                scene.display[info.markSignal] ?
				data.log = [this.getTime() + '命令'+info.markSignal+'号飞船停止飞行', 'log-stop'] :
				data.log = [this.getTime() + '该轨道无飞船', 'invalid'];
				break;
			case 'destroy-btn':
				var info = this.analyse(tar, 9);
				var binaryInfo = this.encode(info);
				this.publish(binaryInfo);
				this.removeSubscriber(scene.display[info.markSignal]);
                scene.display[info.markSignal] ?
				data.log = [this.getTime() + '命令'+info.markSignal+'号飞船销毁', 'log-destroy'] :
				data.log = [this.getTime() + '该轨道无飞船', 'invalid'];
				break;
			default:
		}
		if(info){

		}
	}
};
var loadImg = new Image();
loadImg.src = 'img/spaceship.png';
loadImg.onload = function(){
	$('#container .launch-board, #container .control-board').bind('click', function(event){
		hub.control($(event.target));
	});
}

//为控制中心添加BUS系统
BUS.installTo(hub);
/* ----------------------------------------------------------------------------------------------- */
