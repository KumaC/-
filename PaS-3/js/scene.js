//生成行星背景
(function createPlanet() {
    var canvas = $('#container .universe .canvas');
	var ctx = canvas[0].getContext('2d'); //获取画布
	var img = new Image();
    canvas.attr('width', $(document).width());
    canvas.attr('height', $(document).height());
	img.src = 'img/planet.png';
	var originX = canvas.attr('width') / 2;
	var originY = canvas.attr('height') / 2;
    ctx.translate(originX, originY);
	img.onload = function(){
		ctx.drawImage(img, -48, -48)
	}
})()

/* -----------------------------------------画布------------------------------------------ */
var scene = {
	canvas: $('#container .universe .canvas'),
	ctx: $('#container .universe .canvas')[0].getContext('2d'),
	originX: $('#container .universe').attr('width') / 2,
	originY: $('#container .universe').attr('height') / 2,

	signal: '',
	display: {
		1: null,
		2: null,
		3: null,
		4: null
	},
    /**
    * @description 向画布中添加飞船
    * @method append
    * @for scene
    * @param {object} spaceship
    */
	append: function(spaceship) {
		this.display[spaceship.mark] = spaceship;
        this.draw(spaceship);
	},
    /**
    * @description 从画布中移除飞船
    * @method wipe
    * @for scene
    * @param {object} spaceship
    */
	wipe: function(spaceship) {
		var ctx = this.ctx;
		ctx.save();
		ctx.rotate(spaceship.lastAngle);
		ctx.clearRect(spaceship.structure.x - 2, spaceship.structure.y - 2, spaceship.structure.width + 4, spaceship.structure.height + 4);
		ctx.restore();
	},
    /**
    * @description 在画布上画出某一架飞船
    * @method draw
    * @for scene
    * @param {object} spaceship
    */
	draw: function(spaceship) {
		var ctx = this.ctx;
		ctx.save();
		ctx.rotate(spaceship.angle);
		var img = new Image();
		img.src = 'img/spaceship.png';
        ctx.drawImage(img, spaceship.structure.x, spaceship.structure.y);
		ctx.restore();
		spaceship.lastAngle = spaceship.angle;

	},
    /**
    * @description 更新飞船的状态
    * @method update
    * @for scene
    */
	update: function() {
		var display = this.display;
		var updated = [];
		var destroied = [];
        for(var orbit in display) {
			if(display.hasOwnProperty(orbit) && display[orbit]) {
                display[orbit].status !== 9 || destroied.push(display[orbit]);
                display[orbit].angularVelocity === 0 || updated.push(display[orbit]);
			}
		}
		return [updated, destroied];
	},
    /**
    * @description 画布渲染
    * @method render
    * @for scene
    * @param {array} data
    */
	render: function(data) {
		var that = this;
		var updated = data[0];
		var destroied = data[1];
		updated.forEach(function(spaceship) {
			that.wipe(spaceship);
			that.draw(spaceship);
		})
		destroied.forEach(function(spaceship) {
			that.wipe(spaceship);
		})
	},
    /**
    * @description 从画布中除去已销毁的飞船
    * @method abandon
    * @for scene
    * @param {array} data
    */
	abandon: function(data) {
		var destroied = data[1];
		var display = this.display;
		destroied.forEach(function(spaceship) {
			display[spaceship.mark] = null;
		})
	},


};
(function sceneLoop() {
	scene.render(scene.update());
	scene.abandon(scene.update());
	requestAnimationFrame(sceneLoop);
})()


/* ----------------------------------------------------------------------------------------------- */
