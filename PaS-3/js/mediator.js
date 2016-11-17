var BUS = {
    /**
    * @description 添加订阅者
    * @method addSubscriber
    * @for BUS
    * @param {object} subscriber - 订阅者
    */
	addSubscriber: function(subscriber){
		this.subscribers.push(subscriber)
	},
    /**
    * @description 移除订阅者
    * @method removeSubscriber
    * @for BUS
    * @param {object} subscriber - 订阅者
    */
	removeSubscriber: function(subscriber){
		for(var i=0;i<this.subscribers.length;i++){
			if(this.subscribers[i] === subscriber){
				delete this.subscribers[i];
			}
		}
	},
    /**
    * @description 广播消息
    * @method publish
    * @for BUS
    * @param {string} message
    */
	publish: function(message){
		//console.log(message)
		var that = this;
		var clone = this.subscribers.concat();
		if(!/^[01]+$/.test(message)){
			return;
		}
		function delayPub() {
			clone.forEach(function(subscriber){
				subscriber.control(message);
			})
		}
		for(var i=0; i<8; i++){
			if(Math.random() <= 0.9) {
				setTimeout(delayPub, 300);
			}
		}

	},
    /**
    * @description 为某对象添加上述三种方法
    * @method installTo
    * @for BUS
    * @param {object} obj
    */
	installTo: function(obj){
		for(var i in this){
			if(this.hasOwnProperty(i)){
				obj[i] = this[i];
				obj.subscribers = [];
			}
		}
	}
}
