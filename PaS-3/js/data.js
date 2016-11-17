var data = {
	dynamics: {
		1: {speed: 30, consumption: 5}, //1号动力系统：速率30px/s, 能耗5%/s
		2: {speed: 50, consumption: 7},
		3: {speed: 500, consumption: 8}
	},
	energy: {
		1: 2, //1号充能系统：2%/s
		2: 5,
		3: 10
	},
	command: [0, 1, 2, 3, 9],
	readableCommand: ['launch', 'move', 'stop', 'refuel', 'destroy'],
	spaceshipStatus: ['发射完毕', '飞行中', '静止中', '补充能源中', '即将销毁'],

	dynamicsCode: [1, 2, 3],
	dynamicsName: ['蓝色空间号', '万有引力号', '星环号'],

	energyCode: [1, 2, 3],
	energyName: ['光能型', '急速型', '永久型'],

	//飞船状态信息
	spaceship1: {
		"mark": 1,
		"_dynamics": undefined,
		"_energy": undefined,
		"_status": undefined,
		"power": undefined
	},
	spaceship2: {
		"mark": 2,
		"_dynamics": undefined,
		"_energy": undefined,
		"_status": undefined,
		"power": undefined
	},
	spaceship3: {
		"mark": 3,
		"_dynamics": undefined,
		"_energy": undefined,
		"_status": undefined,
		"power": undefined
	},
	spaceship4: {
		"mark": 4,
		"_dynamics": undefined,
		"_energy": undefined,
		"_status": undefined,
		"power": undefined
	},

	_log: []
}

for(var i=1;i<5;i++){
	Object.defineProperties(data['spaceship' + i], {
		status: {
			get: function(){
				var status = this._status;
				return data.spaceshipStatus[data.command.indexOf(status)];
			},
			set: function(value){
				this._status = value;
			}
		},
		energy: {
			get: function(){
				var energyType = this._energy;
				return data.energyName[data.energyCode.indexOf(energyType)];
			},
			set: function(value){
				this._energy = parseInt(value);
			}
		},
		dynamics: {
			get: function(){
				var dynamicsType = this._dynamics;
				return data.dynamicsName[data.dynamicsCode.indexOf(dynamicsType)];
			},
			set: function(value){
				this._dynamics = parseInt(value);
			}
		}
	})
}
Object.defineProperty(data, "log", {
	get: function(){
		return this._log;
	},
	set: function(value){
		this._log.push(value);
		commandLog(value);
	}
})
