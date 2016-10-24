
/* -------------------------------------------生成界面-------------------------------------------- */

//这个函数用来生成宇宙背景
function createUniverse(container){
    var universe = document.createElement('div');
    var canvas = document.createElement('canvas');
    
    universe.className = 'universe';
    canvas.id = 'canvas';
    canvas.width = 650;
    canvas.height = 650;
    
    container.appendChild(universe);
    universe.appendChild(canvas);
}

//这个函数用来生成行星背景
function createPlanet(ctx){
    var img = new Image();
    img.onload = function(){
        ctx.save();
        var pat = ctx.createPattern(img,'no-repeat');
        ctx.beginPath();
        ctx.arc(325,325,100,0,2*Math.PI);
        ctx.fillStyle = pat;
        ctx.fill();
        ctx.restore;
    }
    img.src = 'image/planet.png';
}

//这个函数用来生成控制中心操作界面
function createControlBoard(container){
    var controlBoard = document.createElement('div');
    //控制面板代码
    var controlBoardCode = `
        <button class = 'launch-btn' name = '1'>发射飞船进入1轨道</button>
        <button class = 'launch-btn' name = '2'>发射飞船进入2轨道</button>
        <button class = 'launch-btn' name = '3'>发射飞船进入3轨道</button>
        <button class = 'launch-btn' name = '4'>发射飞船进入4轨道</button><br>
        
        <span class = 'note'>1轨道飞船：</span>
        <button class = 'move-btn' name = '1'>开始飞行</button>
        <button class = 'stop-btn' name = '1'>停止飞行</button>
        <button class = 'destroy-btn' name = '1'>销毁</button><br>
        
        <span class = 'note'>2轨道飞船：</span>
        <button class = 'move-btn' name = '2'>开始飞行</button>
        <button class = 'stop-btn' name = '2'>停止飞行</button>
        <button class = 'destroy-btn' name = '2'>销毁</button><br>
        
        <span class = 'note'>3轨道飞船：</span>
        <button class = 'move-btn' name = '3'>开始飞行</button>
        <button class = 'stop-btn' name = '3'>停止飞行</button>
        <button class = 'destroy-btn' name = '3'>销毁</button><br>
        
        <span class = 'note'>4轨道飞船：</span>
        <button class = 'move-btn' name = '4'>开始飞行</button>
        <button class = 'stop-btn' name = '4'>停止飞行</button>
        <button class = 'destroy-btn' name = '4'>销毁</button><br>
    `;
    controlBoard.innerHTML = controlBoardCode;
    controlBoard.className = 'control-board';
    container.appendChild(controlBoard);
}
    
/* ----------------------------------------------------------------------------------------------- */

/* -----------------------------------------画布构造函数------------------------------------------ */
function Scene(ctx){
    this.ctx = ctx;
    this.signal = {};
    this.display = {
        1: new Set(),
        2: new Set(),
        3: new Set(),
        4: new Set()
    }; 
    
    //这个方法用来向画布中添加飞船
    this.append = function(spaceship){
        this.display[spaceship.mark].add(spaceship);
        console.log(spaceship)
        this.draw(spaceship);
    }
    
    //这个方法用来擦去画布上的某一架飞船
    this.wipe = function(spaceship){
        ctx.save();
        ctx.translate(325, 325)
        ctx.rotate(spaceship.lastAngle);
        ctx.clearRect(spaceship.structure.x-2,spaceship.structure.y-2,60,24);
        ctx.restore();
    }
    
    //这个方法用来在画布上画出某一架飞船
    this.draw = function(spaceship){
        var ss = spaceship.structure;
        ctx.beginPath();
        ctx.save();
        ctx.translate(325, 325)
        ctx.rotate(spaceship.angle);
        ctx.strokeStyle = '#ffffff';
        ctx.strokeRect(ss.bodyX,ss.bodyY,ss.bodyW,ss.bodyH);
        ctx.arc(ss.headX,ss.headY,ss.headR,ss.headSAngle,ss.headEAngle);
        ctx.stroke();
        ctx.restore();
        spaceship.lastAngle = spaceship.angle;
    }
    
    //这个方法用来进行飞船碰撞检测
    this.crashCheck = function(){
        var that = this;
        var display = this.display;
        var spaceship;
        var spaceships;
        var newSpaceships;
        var angleDistance;
        var maxAngleDistance;
        var minAngleDistance;
        
        for(var orbit in display){
            if(!display.hasOwnProperty(orbit)){
                continue;
            }
            spaceships = display[orbit];
            spaceships.forEach(function(spaceship){
                spaceships.forEach(function(another){
                    if(spaceship === another){
                        return;
                    }
                    angleDistance = Math.abs(spaceship.lastAngle - another.lastAngle);
                    maxAngleDistance =  2 * Math.PI - spaceship.minAngleDistance;
                    minAngleDistance = spaceship.minAngleDistance;
                    if(angleDistance < minAngleDistance || angleDistance > maxAngleDistance){
                        spaceship.state = 'destroied';
                        another.state = 'destroied';
                    }
                })
            })
        }
    }
    
    //这个方法用来更新飞船的状态
    this.update = function(){
        var that = this;
        var signal = this.signal;
        var display = this.display;
        var updated = [];
        var destroied = [];
        var spaceships;
        
        for(var orbit in display){
            if(!display.hasOwnProperty(orbit)){
                continue;
            }
            spaceships = display[orbit];
            spaceships.forEach(function(spaceship){
                spaceship.signalHandle(signal);
                if(spaceship.state === 'moving'){
                    updated.push(spaceship);
                }
                if(spaceship.state === 'destroied'){
                    destroied.push(spaceship);
                }
            })
        }
        this.signal = [-1]
        return [updated, destroied];
    }
    
    //这个方法用来在画布上渲染飞船
    this.render = function(data){
        var updated = data[0];
        var destroied = data[1];
        updated.forEach(function(spaceship){
            that.wipe(spaceship);
            that.draw(spaceship);
        })
        destroied.forEach(function(spaceship){
            that.wipe(spaceship);
        })
    }
    
    //这个方法用来从集合中删除已被破坏的飞船
    this.abandon = function(data){
        var destroied = data[1];
        var display = this.display;
        destroied.forEach(function(spaceship){
            display[spaceship.mark].delete(spaceship);
        })
    }
    
    if(ctx){
        var that = this;
        (function sceneLoop(){
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

function Hub(container, scene){
    //这个方法用于解析控制台按钮发出的信息
    this.analyse = function(event){
        var actionSignal = event.target.className.match(/^(\w+)-btn/)[1];
        var markSignal = Number(event.target.name);
        var info = {
            actionSignal: actionSignal,
            markSignal: markSignal
        }
        return info;
    }
    
    //这个方法用于生成被广播的介质
    this.createMediator = function(info){
        var Mediator = info;
        return Mediator;
    }
    
    //这个方法用来广播介质
    this.annoMediator = function(Mediator){
        function delayAnno(){
            scene.signal.markSignal = Mediator.markSignal;
            scene.signal.actionSignal = Mediator.actionSignal;
        }
        if(Math.random() <= 1){
            setTimeout(delayAnno, 1000);
        }
    }
    
    //这个方法用来发射飞船
    this.launch = function(markSignal){
        var spaceship = new Spaceship(markSignal);
        scene.append(spaceship);
    }
    
    //这个方法用来初始化控制中心
    this.init = function(){
        var that = this;
        var controlBoard = container.getElementsByClassName('control-board')[0];
        var button = controlBoard.getElementsByTagName('button');
        for(let i=0;i<button.length;i++){
            button[i].addEventListener('click',function(event){
                var info = that.analyse(event);
                if(info.actionSignal === 'launch'){
                    that.launch(info.markSignal);
                }else{
                    var Mediator = that.createMediator(info);
                    that.annoMediator(Mediator);
                }   
            }, false)
        }
    }
    if(container && scene){
        this.init()
    }
}
/* ----------------------------------------------------------------------------------------------- */

/* -----------------------------------------飞船构造函数------------------------------------------ */
function Spaceship(mark){
    if(typeof this.move !== 'function'){
        
        //这个方法用来生成飞船的结构
        Spaceship.prototype.createStructure =  function(){
            var mark = this.mark;
            var x = -25,
                y = 100 + 50 * mark,
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
                height = headR;
            return{
                x : x,
                y : y,
                headR : headR,
                headX : headX,
                headY : headY,
                headSAngle : headSAngle,
                headEAngle : headEAngle,
                bodyX : bodyX,
                bodyY : bodyY,
                bodyW : bodyW,
                bodyH : bodyH,
                width : width,
                height : height
            }
        }
        
        //这个方法对飞行时的飞船的参数进行调整
        Spaceship.prototype.processInMoving = function(){
            this.energy -= 0.01;
            this.angle = (this.angle + this.angularVelocity) % (2 * Math.PI);
        }
        
        //这个方法对静止时的飞船的参数进行调整
        Spaceship.prototype.processInStill = function(){
            this.energy += 0.03;
        }
        
        //这个方法是飞船的信号处理系统
        Spaceship.prototype.signalHandle = function(signal){
            if(signal.markSignal !== this.mark || signal.actionSignal === this.lastActionSignal){
                return;
            }
            this.lastActionSignal = signal.actionSignal;
            this.control(signal.actionSignal);
        }
        
        //这个方法是飞船的控制系统
        Spaceship.prototype.control = function(actionSignal){
            var that = this;
            switch(actionSignal){  
                case 'move':
                    this.state = 'moving';
                    (function movingLoop(){
                        that.processInMoving();
                        if(that.energy <= that.minEnergy){
                            that.energy = that.minEnergy;
                            that.control('refuel');
                            return;
                        }
                        if(that.state === 'moving'){
                            setTimeout(movingLoop, 10);
                        }
                    })()
                    break;
                 
                case 'stop':
                    this.state = 'still';
                    (function stillLoop(){
                        that.processInStill();
                        if(that.energy >= that.maxEnergy){
                            that.energy = that.maxEnergy;
                            return;
                        }
                        if(that.state === 'still'){
                            setTimeout(stillLoop, 10);
                        }
                    })()
                    break;
                    
                case 'refuel':
                    this.state = 'refueling';
                    (function refuelingLoop(){
                        that.processInStill();
                        if(that.energy >= that.maxEnergy){
                            that.energy = that.maxEnergy;
                            that.control('move');
                            return;
                        }
                        if(that.state === 'refueling'){
                            setTimeout(refuelingLoop, 10);
                        }
                        
                    })()
                    break;
                    
                case 'destroy':
                    this.state = 'destroied'
                    break;
                    
                default:
                    throw "signal is wrong";
            }
        }
    }
    
    //信号处理系统属性
    this.lastActionSignal = null;
    this.mark = mark;
    this.state = 'launched';
    
    //飞船结构
    this.structure = this.createStructure();
    
    //动力系统属性
    this.angularVelocity = 0.003 / this.mark;
    this.angle = 0;
    this.lastAngle = 0;
    this.minAngleDistance = this.structure.width / (this.mark * 50 + 100)
    
    //能源系统属性
    this.maxEnergy = 100;
    this.minEnergy = 0;
    this.energy = this.maxEnergy;
}
/* ----------------------------------------------------------------------------------------------- */

/* -------------------------------------------程序初始化------------------------------------------ */
function init(){
    var spaceship = null;
    var mark = -1;
    var actionSignal = null;
    var markSignal = null;
    
    var container = document.getElementById('container'); //获取根容器
    createUniverse(container); //生成宇宙背景
    createControlBoard(container); //生成控制中心操作面板
    var canvas = document.getElementById('canvas')
    var ctx = canvas.getContext('2d'); //获取画布
    createPlanet(ctx); //生成行星背景
    var scene = new Scene(ctx); //生成画布对象
    var hub = new Hub(container, scene); //生成控制中心对象
}
init()
/* ----------------------------------------------------------------------------------------------- */
