/* -------------------------------------------生成界面-------------------------------------------- */
//这个函数用来生成行星背景
function createPlanet(ctx,canvas) {
	var img = new Image();
	var originX = canvas.attr('width') / 2;
	var originY = canvas.attr('height') / 2;
	img.onload = function(){
		ctx.save();
		var pat = ctx.createPattern(img, 'no-repeat');
		ctx.beginPath();
		ctx.arc(originX, originY, 50, 0, 2 * Math.PI);
		ctx.fillStyle = pat;
		ctx.fill();
		ctx.restore;
	}
	img.src = 'img/planet.png';
}
/* ----------------------------------------------------------------------------------------------- */

/* -----------------------------------------画布构造函数------------------------------------------ */
function Scene(ctx, canvas) {
	this.ctx = ctx;
	this.originX = canvas.attr('width') / 2;
	this.originY = canvas.attr('height') / 2;

	this.signal = '';
	this.display = {
		1: new Set(),
		2: new Set(),
		3: new Set(),
		4: new Set()
	};

	//这个方法用来向画布中添加飞船
	this.append = function(spaceship) {
		this.display[spaceship.mark].add(spaceship);
		this.draw(spaceship);
	}

	//这个方法用来擦去画布上的某一架飞船
	this.wipe = function(spaceship) {
		ctx.save();
		ctx.translate(this.originX, this.originY)
		ctx.rotate(spaceship.lastAngle);
		ctx.clearRect(spaceship.structure.x - 2, spaceship.structure.y - 2, spaceship.structure.width + 4, spaceship.structure.height + 4);
		ctx.restore();
	}

	//这个方法用来在画布上画出某一架飞船
	this.draw = function(spaceship) {
		var ss = spaceship.structure;
		ctx.beginPath();
		ctx.save();
		ctx.translate(this.originX, this.originY)
		ctx.rotate(spaceship.angle);
		ctx.strokeStyle = '#ffffff';
		ctx.strokeRect(ss.bodyX, ss.bodyY, ss.bodyW, ss.bodyH);
		ctx.arc(ss.headX, ss.headY, ss.headR, ss.headSAngle, ss.headEAngle);
		ctx.stroke();
		ctx.restore();
		spaceship.lastAngle = spaceship.angle;
	}

	//这个方法用来进行飞船碰撞检测
	this.crashCheck = function() {
		var that = this;
		var display = this.display;
		var spaceship;
		var spaceships;
		var newSpaceships;
		var angleDistance;
		var maxAngleDistance;
		var minAngleDistance;

		for(var orbit in display) {
			if(!display.hasOwnProperty(orbit)) {
				continue;
			}
			spaceships = display[orbit];
			spaceships.forEach(function(spaceship) {
				spaceships.forEach(function(another) {
					if(spaceship === another) {
						return;
					}
					angleDistance = Math.abs(spaceship.lastAngle - another.lastAngle);
					maxAngleDistance = 2 * Math.PI - spaceship.minAngleDistance;
					minAngleDistance = spaceship.minAngleDistance;
					if(angleDistance < minAngleDistance || angleDistance > maxAngleDistance) {
						spaceship.status = 'destroied';
						another.status = 'destroied';
					}
				})
			})
		}
	}

	//这个方法用来更新飞船的状态
	this.update = function() {
		var that = this;
		var signal = this.signal;
		var display = this.display;
		var updated = [];
		var destroied = [];
		var spaceships;

		for(var orbit in display) {
			if(!display.hasOwnProperty(orbit)) {
				continue;
			}
			spaceships = display[orbit];
			spaceships.forEach(function(spaceship) {
				spaceship.control(signal);
				if(spaceship.status === 'moving') {
					updated.push(spaceship);
				}
				if(spaceship.status === 'destroied') {
					destroied.push(spaceship);
				}
			})
		}
		this.signal = ''
		return [updated, destroied];
	}

	//这个方法用来在画布上渲染飞船
	this.render = function(data) {
		var updated = data[0];
		var destroied = data[1];
		updated.forEach(function(spaceship) {
			that.wipe(spaceship);
			that.draw(spaceship);
		})
		destroied.forEach(function(spaceship) {
			that.wipe(spaceship);
		})
	}

	//这个方法用来从集合中删除已被破坏的飞船
	this.abandon = function(data) {
		var destroied = data[1];
		var display = this.display;
		destroied.forEach(function(spaceship) {
			display[spaceship.mark].delete(spaceship);
		})
	}

	if(ctx) {
		var that = this;
		(function sceneLoop() {
			that.crashCheck();
			var data = that.update();
			that.render(data);
			that.abandon(data);
			requestAnimationFrame(sceneLoop)
		})()
	}
}
/* ----------------------------------------------------------------------------------------------- */

/* -------------------------------------------控制中心构造函数-------------------------------------------- */

function Hub(container, scene) {
	this.spaceshipType = null;
	
	//这个方法用于解析某个控制命令的信息
	this.analyse = function(tar) {
		var actionSignal = tar.attr('class').match(/^(\w+)-btn/)[1];
		var markSignal = parseInt(tar.attr('name'));
		var info = {
			actionSignal: actionSignal,
			markSignal: markSignal
		}
		return info;
	};
	
	//这个方法用于将指令编译成二进制码
	this.adapt = function(info){
		var actionSignal = '';
		var markSignal = '';
		switch(info.actionSignal){
			case 'move':
				actionSignal = '00';
				break;
			case 'stop':
				actionSignal = '01';
				break;
			case 'destroy':
				actionSignal = '10';
				break;
			default:
		}
		switch(info.markSignal){
			case 1:
				markSignal = '00';
				break;
			case 2:
				markSignal = '01';
				break;
			case 3:
				markSignal = '10';
				break;
			case 4:
				markSignal = '11';
				break;
			default:
		}
		var binaryInfo = markSignal + actionSignal;
		return binaryInfo;
	};

	//这个方法用于生成被广播的介质
	this.createBUS = function(info) {
		var BUS = info;
		return BUS;
	};

	//这个方法用来广播介质
	this.annoBUS = function(BUS) {
		function delayAnno() {
			scene.signal = BUS
		}
		for(var i=0; i<8; i++){
			if(Math.random() <= 0.9) {
				setTimeout(delayAnno, 300);
			}
		}
	};
	
	//这个方法用来获取将要生成的飞船的型号
	this.getSpaceshipType = function(){
		var dynamicsType = $('#container .control-board :radio[name=dynamics]:checked').val();
		var energyType = $('#container .control-board :radio[name=energy]:checked').val();
		this.spaceshipType = {
			dynamicsType: dynamicsType,
			energyType: energyType
		};
	};
	
	//这个方法用来发射飞船
	this.launch = function(markSignal) {
		var spaceshipType = this.spaceshipType;
		if(spaceshipType){
			var spaceship = new Spaceship(markSignal, spaceshipType);
			scene.append(spaceship);
			this.spaceshipType = null;
		}
	};
	
	//这个方法是控制台的总控制系统
	this.control = function(tar){
		var tarClass = tar.attr('class');
		switch(tarClass){
			case 'create-btn':
				this.getSpaceshipType();
				break;
			case 'launch-btn':
				var markSignal = this.analyse(tar).markSignal;
				this.launch(markSignal);
				break;
			case 'move-btn':
			case 'stop-btn':
			case 'destroy-btn':
				var info = this.analyse(tar);
				var binaryInfo = this.adapt(info);
				var BUS = this.createBUS(binaryInfo);
				this.annoBUS(BUS); 
				break;
			default:
				
		}
	};
	
	//这个方法用来初始化控制中心
	this.init = function() {
		var that = this;
		var form = $('#container .control-board');
		form.bind('click', function(event){
			var tar = $(event.target);
			that.control(tar);
		})
		
	};
	if(container && scene) {
		this.init();
	}
}
/* ----------------------------------------------------------------------------------------------- */

/* -----------------------------------------飞船构造函数------------------------------------------ */
function Spaceship(mark, spaceshipType) {
	if(typeof this.move !== 'function') {
		
		//这个方法用来保存所有飞船的型号
		Spaceship.prototype.type = {
			'前进号': {speed: 30, consumption: 5}, //速率30px/s, 能耗5/s
			'奔腾号': {speed: 50, consumption: 7},
			'超越号': {speed: 80, consumption: 9},
			
			'劲量型': 2, //补充能源速率2/s
			'光能型': 3,
			'永久型': 4
		};
		
		//这个方法用来生成飞船的结构
		Spaceship.prototype.createStructure = function() {
			var x = -25,
				y = this.r,
				headR = 10,
				headX = x + headR,
				headY = y + headR,
				headSAngle = 0.5 * Math.PI,
				headEAngle = 1.5 * Math.PI,
				bodyX = x + headR,
				bodyY = y,
				bodyW = 40,
				bodyH = 20,
				width = headR + bodyW,
				height = 2 * headR;
			return {
				x: x,
				y: y,
				headR: headR,
				headX: headX,
				headY: headY,
				headSAngle: headSAngle,
				headEAngle: headEAngle,
				bodyX: bodyX,
				bodyY: bodyY,
				bodyW: bodyW,
				bodyH: bodyH,
				width: width,
				height: height
			}
		};
		
		//这个方法是飞船的能源系统
		Spaceship.prototype.energyProcess = function() {
			var that = this;
			(function processLoop(){
				switch(that.status){
					case 'moving':
						that.energy -= that.consumption;
						if(that.energy <= that.minEnergy) {
							that.energy = that.minEnergy;
							that.control('refuel');
							return;
						}
						break;
					case 'still':
						that.energy += that.refuel;
						if(that.energy >= that.maxEnergy) {
							that.energy = that.maxEnergy;
							return;
						}
						break;
					case 'refueling':
						that.energy += that.refuel;
						if(that.energy >= that.maxEnergy) {
							that.energy = that.maxEnergy;
							that.control('move');
							return;
						}
						
						break;
					default:
				}
				setTimeout(processLoop, that.loop);
			})()
		};
		
		//这个方法是飞船的动力系统
		Spaceship.prototype.dynamicsProcess = function(){
			var that = this;
			(function processLoop(){
				if(that.status === 'moving'){
					that.angle = (that.angle + that.angularVelocity) % (2 * Math.PI);
					setTimeout(processLoop, that.loop)
				}
			})()
		}
		
		//这个方法是飞船的状态管理系统
		Spaceship.prototype.statusManager = function(actionSignal){
			switch(actionSignal){
				case 'move':
					this.status = 'moving';
					break;
				case 'stop':
					this.status = 'still';
					break;
				case 'refuel':
					this.status = 'refueling';
					break;
				case 'destroy':
					this.status = 'destroied';
					break;
				default:
			}
		}
		
		//这个方法是飞船的解码系统
		Spaceship.prototype.decode = function(binarySignal) {
			var signal = {};
			var binMarkSignal = binarySignal.substring(0, 2);
			var binActionSignal = binarySignal.substring(2, 4);
			switch(binMarkSignal){
				case '00':
					signal.markSignal = 1;
					break;
				case '01':
					signal.markSignal = 2;
					break;
				case '10':
					signal.markSignal = 3;
					break;
				case '11':
					signal.markSignal = 4;
					break;
				default:
					signal.markSignal = 0;
			}
			switch(binActionSignal){
				case '00':
					signal.actionSignal = 'move';
					break;
				case '01':
					signal.actionSignal = 'stop';
					break;
				case '10':
					signal.actionSignal = 'destroy';
					break;
				default:
					signal.actionSignal = '';
			}
			return signal;
		}
		
		//这个方法是飞船的信号处理系统
		Spaceship.prototype.signalHandle = function(signal) {
			if(signal.markSignal !== this.mark || signal.actionSignal === this.lastActionSignal) {
				return 0;
			}
			this.lastActionSignal = signal.actionSignal;
			return signal.actionSignal;
		}

		//这个方法是飞船的控制系统
		Spaceship.prototype.control = function(binarySignal) {
			var signal = this.decode(binarySignal)
			var actionSignal = this.signalHandle(signal);
			if(actionSignal){
				this.statusManager(actionSignal);
				this.dynamicsProcess();
				this.energyProcess();
			}
		}
	}

	//飞船状态
	this.mark = mark;
	this.planetR = 50;
	this.orbitDistance = 50;
	this.status = 'launched';
	this.r = this.mark * this.orbitDistance + this.planetR
	this.structure = this.createStructure();
	
	//信号处理系统属性
	this.lastActionSignal = null;
	
	//控制系统属性
	this.loop = 10;
	
	//动力系统属性
	this.angularVelocity = this.type[spaceshipType.dynamicsType].speed / this.r / (1000 / this.loop);
	this.angle = 0;
	this.lastAngle = 0;
	this.minAngleDistance = this.structure.width / this.r;

	//能源系统属性
	this.maxEnergy = 100;
	this.minEnergy = 0;
	this.consumption = this.type[spaceshipType.dynamicsType].consumption / (1000 / this.loop);
	this.refuel = this.type[spaceshipType.energyType] / (1000 / this.loop);
	this.energy = this.maxEnergy;
}
/* ----------------------------------------------------------------------------------------------- */

/* -------------------------------------------程序初始化------------------------------------------ */
function init() {
	var container = $('#container'); //获取根容器
	var canvas = $('#container .canvas')
	var ctx = canvas[0].getContext('2d'); //获取画布
	createPlanet(ctx, canvas); //生成行星背景
	var scene = new Scene(ctx, canvas); //生成画布对象
	var hub = new Hub(container, scene); //生成控制中心对象
}
init()
	/* ----------------------------------------------------------------------------------------------- */