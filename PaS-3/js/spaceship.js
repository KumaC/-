/**
* @class spaceship
* @constructor
*/
function Spaceship(mark, spaceshipType) {
	//为飞船添加BUS系统
	BUS.installTo(this);
	this.addSubscriber(hub);

	if(typeof this.move !== 'function') {
        /**
        * @description 生成飞船结构
        * @method createStructure
        * @for Spaceship
        */
		Spaceship.prototype.createStructure = function() {
    		return {
    			x: -25,
    		    y: this.r,
                width: 40,
                height: 40
            }
        };
        /**
        * @description 解析控制台发送的信息
        * @method decode
        * @for Spaceship
        * @param {string} binarySignal
        */
		Spaceship.prototype.decode = function(binarySignal) {
    		return {
    			markSignal: adapter.decode(binarySignal.substring(0, 4)),
    			actionSignal: adapter.decode(binarySignal.substring(4, 8)),
			}
		};
        /**
        * @description 判断信息是否需要交由控制系统处理
        * @method signalHandle
        * @for Spaceship
        * @param {number} signal
        */
		Spaceship.prototype.signalHandle = function(signal) {
			if(signal.markSignal === this.mark && signal.actionSignal !== this.status){
                return signal.actionSignal;
            }
		};
        /**
        * @description 向控制台发送信息
        * @method signalRadiation
        * @for Spaceship
        * @param {number} signal
        */
		Spaceship.prototype.signalRadiation = function(signal) {
			var that = this;
			function radiationLoop(){
				if(that.status === 9){
					clearInterval(rLoop);
				}
				var mark = that.mark, status = that.status, energy = that.energy;
				that.publish(adapter.encode(mark, 4) + adapter.encode(status, 4) + adapter.encode(energy, 8))
			}
			var rLoop = setInterval(radiationLoop, 1000)
		};
        /**
        * @description 管理飞船的状态
        * @method statusManager
        * @for Spaceship
        * @param {number} actionSignal
        */
        Spaceship.prototype.statusManager = function(actionSignal){
            this.status = actionSignal;
        };
        /**
        * @description 飞船能源系统
        * @method energyProcess
        * @for Spaceship
        */
		Spaceship.prototype.energyProcess = function() {
			switch(this.status){
				case 1: //moving
					this.energy -= this.consumption;
					if(this.energy <= this.minEnergy) {
						this.energy = this.minEnergy;
						this.statusManager(3);
					}
					break;
				case 2: //still
                    this.energy < this.maxEnergy ?
					this.energy += this.refuel : this.energy = this.maxEnergy;
					break;
				case 3: //refueling
					this.energy += this.refuel;
					if(this.energy >= this.maxEnergy) {
						this.energy = this.maxEnergy;
						this.statusManager(1);
					}
                    break;
				default:
			}
		};
        /**
        * @description 飞船动力系统
        * @method dynamicsProcess
        * @for Spaceship
        */
		Spaceship.prototype.dynamicsProcess = function(){
            switch (this.status) {
                case 1: //moving
                    this.angularVelocity < this.maxAngularVelocity ?
                    this.angularVelocity += 0.0001 : this.angularVelocity = this.maxAngularVelocity; //加速度模拟
                    this.angle = (this.angle + this.angularVelocity) % (2 * Math.PI);
                    break;
                default: //launched, still, refueling
                    this.angularVelocity > 0 ?
                    this.angularVelocity -= 0.0001 : this.angularVelocity = 0; //加速度模拟
                    this.angle = (this.angle + this.angularVelocity) % (2 * Math.PI);
            }
        };
        /**
        * @description 飞船核心控制体统
        * @method coreControl
        * @for Spaceship
        */
		//这个方法是飞船的核心控制系统
		Spaceship.prototype.coreControl = function() {
            var that = this;
            (function coreLoop(){
                that.dynamicsProcess();
    			that.energyProcess();
                that.status === 9 || setTimeout(coreLoop);
            })()
		}
        /**
        * @description 飞船外部控制系统
        * @method control
        * @for Spaceship
        * @param {string} binarySignal
        */
		//这个方法是飞船的外部控制系统
		Spaceship.prototype.control = function(binarySignal) {
			var signal = this.decode(binarySignal);
            var actionSignal = this.signalHandle(signal);
			actionSignal && this.statusManager(actionSignal);
		}
        Spaceship.prototype.planetR = 30; //
        Spaceship.prototype.orbitDistance = 50;
        Spaceship.prototype.loop = 10;
	}

	//飞船状态
	this.mark = mark;
	this.status = 0;
	this.r = this.mark * this.orbitDistance + this.planetR
	this.structure = this.createStructure();

    //动力系统属性
    this.angularVelocity = 0;
	this.maxAngularVelocity = data.dynamics[spaceshipType.dynamicsType].speed / this.r / (1000 / this.loop);
	this.angle = 0;
	this.lastAngle = 0;

	//能源系统属性
	this.maxEnergy = 100;
	this.minEnergy = 0;
	this.consumption = data.dynamics[spaceshipType.dynamicsType].consumption / (1000 / this.loop);
	this.refuel = data.energy[spaceshipType.energyType] / (1000 / this.loop);
	this.energy = this.maxEnergy;

	this.signalRadiation();
    this.coreControl();
}
