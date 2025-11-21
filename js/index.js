// 定义颜色变量
var Colors = {
	red:0xf25346,
	white:0xd8d0d1,
	brown:0x59332e,
	pink:0xF5986E,
	brownDark:0x23190f,
	blue:0x68c3c0,
};

// 全局变量
var scene,
		camera, fieldOfView, aspectRatio, nearPlane, farPlane, HEIGHT, WIDTH,
		renderer, container;

// Game state
function resetGame(){
	game = {
		speed:0,
		initSpeed:.00035,
		baseSpeed:.00035,
		targetBaseSpeed:.00035,
		speedLastFrame:0,
		score:0,
		energy:100,
		ratioSpeedDistance:50,
		energy:100,
		ratioSpeedEnergy:3,
		level:1,
		planeFallSpeed:.001,
		planeSpeed:0,
		planeCollisionDisplacementX:0,
		planeCollisionSpeedX:0,
		planeCollisionDisplacementY:0,
		planeCollisionSpeedY:0,
		planeMinSpeed:1.2,
		planeMaxSpeed:1.6,
		planeSpeed:0,
		planeCollisionDisplacementX:0,
		planeCollisionSpeedX:0,
		planeCollisionDisplacementY:0,
		planeCollisionSpeedY:0,
	};
	fieldDistance = 0;
}

// 对象变量
var hemisphereLight, shadowLight, ambientLight;
var sea;
var airplane;
var sky;
var particlesPool = [];
var particlesInUse = [];
var enemiesPool = [];
var enemiesInUse = [];
var game;
var fieldDistance = 0;
var lastEnemySpawnTime = 0;

// 初始化函数
window.addEventListener('load', init, false);

function init(event){
	resetGame();
	createScene();
	createLights();
	createParticlesPool();
	createEnemiesPool();
	createPlane();
	createSea();
	createSky();

	//add the listener
	document.addEventListener('mousemove', handleMouseMove, false);
	document.addEventListener('mousedown', handleMouseDown, false);
	document.addEventListener('touchstart', handleTouchStart, false);
	
	loop();
}

function createScene() {
	// 获取屏幕的宽度和高度，
	// 用来设置相机的宽高比和渲染器的大小
	HEIGHT = window.innerHeight;
	WIDTH = window.innerWidth;

	// 创建场景
	scene = new THREE.Scene();

	// 给场景添加雾化效果；颜色与CSS中定义的背景色相同
	scene.fog = new THREE.Fog(0xf7d9aa, 100, 950);
	
	// 创建相机
	aspectRatio = WIDTH / HEIGHT;
	fieldOfView = 60;
	nearPlane = 1;
	farPlane = 10000;
	camera = new THREE.PerspectiveCamera(
		fieldOfView,
		aspectRatio,
		nearPlane,
		farPlane
		);
	
	// 设置相机的位置
	camera.position.x = 0;
	camera.position.z = 200;
	camera.position.y = 100;
	
	// 创建渲染器
	renderer = new THREE.WebGLRenderer({ 
		// 允许透明度以显示我们在CSS中定义的渐变背景
		alpha: true, 

		// 激活抗锯齿；这会降低性能，
		// 但是，由于我们的项目是低多边形风格的，应该没问题 :)
		antialias: true 
	});

	// 定义渲染器的大小；
	// 在这种情况下，它将填充整个屏幕
	renderer.setSize(WIDTH, HEIGHT);
	
	// 启用阴影渲染
	renderer.shadowMap.enabled = true;
	
	// 将渲染器的DOM元素添加到
	// 我们在HTML中创建的容器中
	container = document.getElementById('world');
	container.appendChild(renderer.domElement);
	
	// 监听屏幕：如果用户调整大小
	// 我们必须更新相机和渲染器的大小
	window.addEventListener('resize', handleWindowResize, false);
}

function handleWindowResize() {
	// 更新渲染器和相机的高度和宽度
	HEIGHT = window.innerHeight;
	WIDTH = window.innerWidth;
	renderer.setSize(WIDTH, HEIGHT);
	camera.aspect = WIDTH / HEIGHT;
	camera.updateProjectionMatrix();
}

function createLights() {
	// 半球光是一种渐变色光；
	// 第一个参数是天空颜色，第二个参数是地面颜色，
	// 第三个参数是光线强度
	hemisphereLight = new THREE.HemisphereLight(0xaaaaaa,0x000000, .9)
	
	// an ambient light modifies the global color of a scene and makes the shadows softer
	ambientLight = new THREE.AmbientLight(0xdc8874, .5);
	scene.add(ambientLight);
	
	// 方向光从特定方向照射。
	// 它就像太阳一样，意味着产生的所有光线都是平行的。
	shadowLight = new THREE.DirectionalLight(0xffffff, .9);

	// 设置光线的方向
	shadowLight.position.set(150, 350, 350);
	
	// 允许投射阴影
	shadowLight.castShadow = true;

	// 定义投影阴影的可见区域
	shadowLight.shadow.camera.left = -400;
	shadowLight.shadow.camera.right = 400;
	shadowLight.shadow.camera.top = 400;
	shadowLight.shadow.camera.bottom = -400;
	shadowLight.shadow.camera.near = 1;
	shadowLight.shadow.camera.far = 1000;

	// 定义阴影的分辨率；越高越好，
	// 但也更昂贵且性能更低
	shadowLight.shadow.mapSize.width = 2048;
	shadowLight.shadow.mapSize.height = 2048;
	
	// 要激活灯光，只需将它们添加到场景中
	scene.add(hemisphereLight);  
	scene.add(shadowLight);
}

// 定义一个海洋对象：
Sea = function(){
	var geom = new THREE.CylinderGeometry(600,600,800,40,10);
	geom.applyMatrix(new THREE.Matrix4().makeRotationX(-Math.PI/2));

	// important: by merging vertices we ensure the continuity of the waves
	geom.mergeVertices();

	// get the vertices
	var l = geom.vertices.length;

	// create an array to store new data associated to each vertex
	this.waves = [];

	for (var i=0; i<l; i++){
		// get each vertex
		var v = geom.vertices[i];

		// store some data associated to it
		this.waves.push({y:v.y,
									 x:v.x,
									 z:v.z,
									 // a random angle
									 ang:Math.random()*Math.PI*2,
									 // a random distance
									 amp:5 + Math.random()*15,
									 // a random speed between 0.016 and 0.048 radians / frame
									 speed:0.016 + Math.random()*0.032
									});
	};
	var mat = new THREE.MeshPhongMaterial({
		color:Colors.blue,
		transparent:true,
		opacity:.8,
		shading:THREE.FlatShading,
	});

	this.mesh = new THREE.Mesh(geom, mat);
	this.mesh.receiveShadow = true;

}

// now we create the function that will be called in each frame 
// to update the position of the vertices to simulate the waves

Sea.prototype.moveWaves = function (){
	
	// get the vertices
	var verts = this.mesh.geometry.vertices;
	var l = verts.length;
	
	for (var i=0; i<l; i++){
		var v = verts[i];
		
		// get the data associated to it
		var vprops = this.waves[i];
		
		// update the position of the vertex
		v.x = vprops.x + Math.cos(vprops.ang)*vprops.amp;
		v.y = vprops.y + Math.sin(vprops.ang)*vprops.amp;

		// increment the angle for the next frame
		vprops.ang += vprops.speed;

	}

	// Tell the renderer that the geometry of the sea has changed.
	// In fact, in order to maintain the best level of performance, 
	// three.js caches the geometries and ignores any changes
	// unless we add this line
	this.mesh.geometry.verticesNeedUpdate=true;

	sea.mesh.rotation.z += .005;
}

// 实例化海洋并将其添加到场景中：
function createSea(){
	sea = new Sea();

	// 将其推到场景底部稍远一点的位置
	sea.mesh.position.y = -600;

	// 将海面的网格添加到场景中
	scene.add(sea.mesh);
}

// Define a Pilot object:
var Pilot = function(){
	this.mesh = new THREE.Object3D();
	this.mesh.name = "pilot";
	
	// angleHairs is a property used to animate the hair later 
	this.angleHairs=0;

	// Body of the pilot
	var bodyGeom = new THREE.BoxGeometry(15,15,15);
	var bodyMat = new THREE.MeshPhongMaterial({color:Colors.brown, shading:THREE.FlatShading});
	var body = new THREE.Mesh(bodyGeom, bodyMat);
	body.position.set(2,-12,0);
	this.mesh.add(body);

	// Face of the pilot
	var faceGeom = new THREE.BoxGeometry(10,10,10);
	var faceMat = new THREE.MeshLambertMaterial({color:Colors.pink});
	var face = new THREE.Mesh(faceGeom, faceMat);
	this.mesh.add(face);

	// Hair element
	var hairGeom = new THREE.BoxGeometry(4,4,4);
	var hairMat = new THREE.MeshLambertMaterial({color:Colors.brown});
	var hair = new THREE.Mesh(hairGeom, hairMat);
	// Align the shape of the hair to its bottom boundary, that will make it easier to scale.
	hair.geometry.applyMatrix(new THREE.Matrix4().makeTranslation(0,2,0));
	
	// create a container for the hair
	var hairs = new THREE.Object3D();

	// create a container for the hairs at the top 
	// of the head (the ones that will be animated)
	this.hairsTop = new THREE.Object3D();

	// create the hairs at the top of the head 
	// and position them on a 3 x 4 grid
	for (var i=0; i<12; i++){
		var h = hair.clone();
		var col = i%3;
		var row = Math.floor(i/3);
		var startPosZ = -4;
		var startPosX = -4;
		h.position.set(startPosX + row*4, 0, startPosZ + col*4);
		this.hairsTop.add(h);
	}
	hairs.add(this.hairsTop);

	// create the hairs at the side of the face
	var hairSideGeom = new THREE.BoxGeometry(12,4,2);
	hairSideGeom.applyMatrix(new THREE.Matrix4().makeTranslation(-6,0,0));
	var hairSideR = new THREE.Mesh(hairSideGeom, hairMat);
	var hairSideL = hairSideR.clone();
	hairSideR.position.set(8,-2,6);
	hairSideL.position.set(8,-2,-6);
	hairs.add(hairSideR);
	hairs.add(hairSideL);

	// create the hairs at the back of the head
	var hairBackGeom = new THREE.BoxGeometry(2,8,10);
	var hairBack = new THREE.Mesh(hairBackGeom, hairMat);
	hairBack.position.set(-1,-4,0)
	hairs.add(hairBack);
	hairs.position.set(-5,5,0);

	this.mesh.add(hairs);

	var glassGeom = new THREE.BoxGeometry(5,5,5);
	var glassMat = new THREE.MeshLambertMaterial({color:Colors.brown});
	var glassR = new THREE.Mesh(glassGeom,glassMat);
	glassR.position.set(6,0,3);
	var glassL = glassR.clone();
	glassL.position.z = -glassR.position.z

	var glassAGeom = new THREE.BoxGeometry(11,1,11);
	var glassA = new THREE.Mesh(glassAGeom, glassMat);
	this.mesh.add(glassR);
	this.mesh.add(glassL);
	this.mesh.add(glassA);

	var earGeom = new THREE.BoxGeometry(2,3,2);
	var earL = new THREE.Mesh(earGeom,faceMat);
	earL.position.set(0,0,-6);
	var earR = earL.clone();
	earR.position.set(0,0,6);
	this.mesh.add(earL);
	this.mesh.add(earR);
}

// move the hair
Pilot.prototype.updateHairs = function(){
	
	// get the hair
	var hairs = this.hairsTop.children;

	// update them according to the angle angleHairs
	var l = hairs.length;
	for (var i=0; i<l; i++){
		var h = hairs[i];
		// each hair element will scale on cyclical basis between 75% and 100% of its original size
		h.scale.y = .75 + Math.cos(this.angleHairs+i/3)*.25;
	}
	// increment the angle for the next frame
	this.angleHairs += 0.16;
}

// Define a Particle (energy ball) object:
var Particle = function(){
	var geom = new THREE.SphereGeometry(3,8,8);
	var mat = new THREE.MeshPhongMaterial({
		color:0x68c3c0,
		shading:THREE.FlatShading
	});
	this.mesh = new THREE.Mesh(geom,mat);
}

Particle.prototype.explode = function(pos){
	var _this = this;
	var _p = this.mesh.parent;
	this.mesh.material.color = new THREE.Color(0x68c3c0);
	this.mesh.material.needsUpdate = true;
	this.mesh.scale.set(1, 1, 1);
	var targetX = pos.x;
	var targetY = pos.y;
	var speed = 1.5;
	this.mesh.position.y = targetY;
	this.mesh.position.x = targetX;
	this.mesh.position.z = pos.z;
	this.angle = 0;

	this.dist = 0;
	this.mesh.visible = true;

	// Shoot straight forward (positive X direction)
	TweenLite.to(this.mesh.position, speed, {x:targetX+200, ease:Linear.easeNone});
	TweenLite.to(this.mesh.scale, speed, {x:.1, y:.1, z:.1, ease:Linear.easeNone, onComplete:function(){
			_this.mesh.visible = false;
			_this.mesh.scale.set(1,1,1);
			particlesInUse.splice(particlesInUse.indexOf(_this), 1);
			particlesPool.unshift(_this);
	}});
}

// Define Enemy object (rock-like obstacle):
var Enemy = function(){
	// Create a container for the rock
	this.mesh = new THREE.Object3D();
	
	// Random color for variety
	var colors = [0xe74c3c, 0x8e44ad, 0x3498db, 0xe67e22, 0x95a5a6];
	var color = colors[Math.floor(Math.random() * colors.length)];
	
	// Create irregular rock shape by combining multiple boxes
	var nBlocs = 3 + Math.floor(Math.random() * 3);
	for (var i = 0; i < nBlocs; i++){
		// Random size for each block
		var s = 3 + Math.random() * 5;
		var geom = new THREE.BoxGeometry(s, s, s);
		var mat = new THREE.MeshPhongMaterial({
			color: color,
			shading: THREE.FlatShading
		});
		
		var m = new THREE.Mesh(geom, mat);
		
		// Random position to create irregular shape
		m.position.x = (Math.random() - 0.5) * 8;
		m.position.y = (Math.random() - 0.5) * 8;
		m.position.z = (Math.random() - 0.5) * 8;
		
		// Random rotation
		m.rotation.x = Math.random() * Math.PI;
		m.rotation.y = Math.random() * Math.PI;
		m.rotation.z = Math.random() * Math.PI;
		
		m.castShadow = true;
		m.receiveShadow = true;
		
		this.mesh.add(m);
	}
	
	this.angle = 0;
	this.dist = 0;
}

Enemy.prototype.fly = function(){
	var _this = this;
	var targetX = -300;
	var speed = 3;
	
	// Add rotation animation
	TweenLite.to(this.mesh.rotation, speed, {x:Math.PI*2, y:Math.PI*2, ease:Linear.easeNone});
	
	TweenLite.to(this.mesh.position, speed, {x:targetX, ease:Linear.easeNone, onComplete:function(){
		_this.mesh.visible = false;
		scene.remove(_this.mesh);
		enemiesInUse.splice(enemiesInUse.indexOf(_this), 1);
		enemiesPool.unshift(_this);
	}});
}

// Define a Plane object:
var AirPlane = function() {
	
	this.mesh = new THREE.Object3D();
	
	// Cockpit

	var geomCockpit = new THREE.BoxGeometry(80,50,50,1,1,1);
	var matCockpit = new THREE.MeshPhongMaterial({color:Colors.red, shading:THREE.FlatShading});

	// we can access a specific vertex of a shape through 
	// the vertices array, and then move its x, y and z property:
	geomCockpit.vertices[4].y-=10;
	geomCockpit.vertices[4].z+=20;
	geomCockpit.vertices[5].y-=10;
	geomCockpit.vertices[5].z-=20;
	geomCockpit.vertices[6].y+=30;
	geomCockpit.vertices[6].z+=20;
	geomCockpit.vertices[7].y+=30;
	geomCockpit.vertices[7].z-=20;

	var cockpit = new THREE.Mesh(geomCockpit, matCockpit);
	cockpit.castShadow = true;
	cockpit.receiveShadow = true;
	this.mesh.add(cockpit);

	// Create the pilot
	this.pilot = new Pilot();
	this.pilot.mesh.position.set(5,27,0);
	this.mesh.add(this.pilot.mesh);
	
	// Create the engine
	var geomEngine = new THREE.BoxGeometry(20,50,50,1,1,1);
	var matEngine = new THREE.MeshPhongMaterial({color:Colors.white, shading:THREE.FlatShading});
	var engine = new THREE.Mesh(geomEngine, matEngine);
	engine.position.x = 40;
	engine.castShadow = true;
	engine.receiveShadow = true;
	this.mesh.add(engine);
	
	// Create the tail
	var geomTailPlane = new THREE.BoxGeometry(15,20,5,1,1,1);
	var matTailPlane = new THREE.MeshPhongMaterial({color:Colors.red, shading:THREE.FlatShading});
	var tailPlane = new THREE.Mesh(geomTailPlane, matTailPlane);
	tailPlane.position.set(-35,25,0);
	tailPlane.castShadow = true;
	tailPlane.receiveShadow = true;
	this.mesh.add(tailPlane);
	
	// Create the wing
	var geomSideWing = new THREE.BoxGeometry(40,8,150,1,1,1);
	var matSideWing = new THREE.MeshPhongMaterial({color:Colors.red, shading:THREE.FlatShading});
	var sideWing = new THREE.Mesh(geomSideWing, matSideWing);
	sideWing.castShadow = true;
	sideWing.receiveShadow = true;
	this.mesh.add(sideWing);
	
	// propeller
	var geomPropeller = new THREE.BoxGeometry(20,10,10,1,1,1);
	var matPropeller = new THREE.MeshPhongMaterial({color:Colors.brown, shading:THREE.FlatShading});
	this.propeller = new THREE.Mesh(geomPropeller, matPropeller);
	this.propeller.castShadow = true;
	this.propeller.receiveShadow = true;
	
	// blades
	var geomBlade = new THREE.BoxGeometry(1,100,20,1,1,1);
	var matBlade = new THREE.MeshPhongMaterial({color:Colors.brownDark, shading:THREE.FlatShading});
	
	var blade = new THREE.Mesh(geomBlade, matBlade);
	blade.position.set(8,0,0);
	blade.castShadow = true;
	blade.receiveShadow = true;
	this.propeller.add(blade);
	this.propeller.position.set(50,0,0);
	this.mesh.add(this.propeller);
};

// Instantiate the plane and add it to the scene:

var airplane;

function createPlane(){ 
	airplane = new AirPlane();
	airplane.mesh.scale.set(.25,.25,.25);
	airplane.mesh.position.y = 100;
	scene.add(airplane.mesh);
}

function createParticlesPool(){
	for (var i=0; i<10; i++){
		var particle = new Particle();
		particlesPool.push(particle);
	}
}

function createEnemiesPool(){
	for (var i=0; i<10; i++){
		var enemy = new Enemy();
		enemiesPool.push(enemy);
	}
}

function spawnEnemies(){
	var nEnemies = 1;
	for (var i=0; i<nEnemies; i++){
		var enemy;
		if (enemiesPool.length) {
			enemy = enemiesPool.pop();
		}else{
			enemy = new Enemy();
		}
		scene.add(enemy.mesh);
		enemy.mesh.visible = true;
		enemy.mesh.position.x = 200;
		enemy.mesh.position.y = Math.random()*100 + 30;
		enemy.mesh.position.z = Math.random()*50 - 25;
		enemy.fly();
		enemiesInUse.push(enemy);
	}
}

function spawnParticles(pos, density, particleColor){
	var nPArticles = density;
	for (var i=0; i<nPArticles; i++){
		var particle;
		if (particlesPool.length) {
			particle = particlesPool.pop();
		}else{
			particle = new Particle();
		}
		scene.add(particle.mesh);
		particle.mesh.visible = true;
		var _this = this;
		particle.mesh.position.y = pos.y;
		particle.mesh.position.x = pos.x;
		particle.explode(pos);
		particlesInUse.push(particle);
	}
}

// Define a Sky Object
Sky = function(){
	// Create an empty container
	this.mesh = new THREE.Object3D();
	
	// choose a number of clouds to be scattered in the sky
	this.nClouds = 20;
	
	// To distribute the clouds consistently,
	// we need to place them according to a uniform angle
	var stepAngle = Math.PI*2 / this.nClouds;
	
	// create the clouds
	for(var i=0; i<this.nClouds; i++){
		var c = new Cloud();
	 
		// set the rotation and the position of each cloud;
		// for that we use a bit of trigonometry
		var a = stepAngle*i; // this is the final angle of the cloud
		var h = 750 + Math.random()*200; // this is the distance between the center of the axis and the cloud itself

		// Trigonometry!!! I hope you remember what you've learned in Math :)
		// in case you don't: 
		// we are simply converting polar coordinates (angle, distance) into Cartesian coordinates (x, y)
		c.mesh.position.y = Math.sin(a)*h;
		c.mesh.position.x = Math.cos(a)*h;

		// rotate the cloud according to its position
		c.mesh.rotation.z = a + Math.PI/2;

		// for a better result, we position the clouds 
		// at random depths inside of the scene
		c.mesh.position.z = -400-Math.random()*400;
		
		// we also set a random scale for each cloud
		var s = 1+Math.random()*2;
		c.mesh.scale.set(s,s,s);

		// do not forget to add the mesh of each cloud in the scene
		this.mesh.add(c.mesh);  
	}  
}

// Define a Cloud object:
Cloud = function(){
	// Create an empty container that will hold the different parts of the cloud
	this.mesh = new THREE.Object3D();
	
	// create a cube geometry;
	// this shape will be duplicated to create the cloud
	var geom = new THREE.BoxGeometry(20,20,20);
	
	// create a material; a simple white material will do the trick
	var mat = new THREE.MeshPhongMaterial({
		color:Colors.white,  
	});
	
	// duplicate the geometry a random number of times
	var nBlocs = 3+Math.floor(Math.random()*3);
	for (var i=0; i<nBlocs; i++ ){
		
		// create the mesh by cloning the geometry
		var m = new THREE.Mesh(geom, mat); 
		
		// set the position and the rotation of each cube randomly
		m.position.x = i*15;
		m.position.y = Math.random()*10;
		m.position.z = Math.random()*10;
		m.rotation.z = Math.random()*Math.PI*2;
		m.rotation.y = Math.random()*Math.PI*2;
		
		// set the size of the cube randomly
		var s = .1 + Math.random()*.9;
		m.scale.set(s,s,s);
		
		// allow each cube to cast and to receive shadows
		m.castShadow = true;
		m.receiveShadow = true;
		
		// add the cube to the container we first created
		this.mesh.add(m);
	} 
}

// Now we instantiate the sky and push its center a bit
// towards the bottom of the screen

function createSky(){
	sky = new Sky();
	sky.mesh.position.y = -600;
	scene.add(sky.mesh);
}

function loop(){
	sea.moveWaves();
	sky.mesh.rotation.z += .01;

	// update the plane on each frame
	updatePlane();
	
	// Spawn enemies periodically (every 2 seconds)
	var currentTime = Date.now();
	if (currentTime - lastEnemySpawnTime > 2000){
		spawnEnemies();
		lastEnemySpawnTime = currentTime;
	}
	
	// Check collisions
	checkCollisions();
	
	// Update score display
	updateScoreDisplay();
	
	renderer.render(scene, camera);
	requestAnimationFrame(loop);
}

function checkCollisions(){
	var planePos = airplane.mesh.position;
	
	// Check particle vs enemy collisions
	for (var i = particlesInUse.length - 1; i >= 0; i--){
		var particle = particlesInUse[i];
		if (!particle.mesh.visible) continue;
		
		for (var j = enemiesInUse.length - 1; j >= 0; j--){
			var enemy = enemiesInUse[j];
			if (!enemy.mesh.visible) continue;
			
			var dx = particle.mesh.position.x - enemy.mesh.position.x;
			var dy = particle.mesh.position.y - enemy.mesh.position.y;
			var dz = particle.mesh.position.z - enemy.mesh.position.z;
			var dist = Math.sqrt(dx*dx + dy*dy + dz*dz);
			
			if (dist < 12){
				// Hit!
				particle.mesh.visible = false;
				enemy.mesh.visible = false;
				scene.remove(enemy.mesh);
				enemiesInUse.splice(j, 1);
				enemiesPool.unshift(enemy);
				game.score += 10;
				break;
			}
		}
	}
}

function updateScoreDisplay(){
	var scoreDiv = document.getElementById('score');
	if (!scoreDiv){
		scoreDiv = document.createElement('div');
		scoreDiv.id = 'score';
		scoreDiv.style.position = 'absolute';
		scoreDiv.style.top = '20px';
		scoreDiv.style.left = '20px';
		scoreDiv.style.color = 'white';
		scoreDiv.style.fontSize = '24px';
		scoreDiv.style.fontFamily = 'Arial';
		scoreDiv.style.textShadow = '2px 2px 4px rgba(0,0,0,0.5)';
		document.body.appendChild(scoreDiv);
	}
	scoreDiv.innerHTML = 'Score: ' + game.score;
}

var mousePos={x:0, y:0};

// now handle the mousemove event

function handleMouseMove(event) {

	// here we are converting the mouse position value received 
	// to a normalized value varying between -1 and 1;
	// this is the formula for the horizontal axis:
	
	var tx = -1 + (event.clientX / WIDTH)*2;

	// for the vertical axis, we need to inverse the formula 
	// because the 2D y-axis goes the opposite direction of the 3D y-axis
	
	var ty = 1 - (event.clientY / HEIGHT)*2;
	mousePos = {x:tx, y:ty};

}

function handleMouseDown(event){
	if (airplane){
		var pos = {x:airplane.mesh.position.x, 
					 y:airplane.mesh.position.y+10,
					 z:airplane.mesh.position.z};
		spawnParticles(pos, 1);
	}
}

function handleTouchStart(event){
	event.preventDefault();
	if (airplane){
		var pos = {x:airplane.mesh.position.x, 
					 y:airplane.mesh.position.y+10,
					 z:airplane.mesh.position.z};
		spawnParticles(pos, 1);
	}
}

function updatePlane(){
	var targetY = normalize(mousePos.y,-.75,.75,25, 175);
	var targetX = normalize(mousePos.x,-.75,.75,-100, 100);
	
	// Move the plane at each frame by adding a fraction of the remaining distance
	airplane.mesh.position.y += (targetY-airplane.mesh.position.y)*0.1;

	// Rotate the plane proportionally to the remaining distance
	airplane.mesh.rotation.z = (targetY-airplane.mesh.position.y)*0.0128;
	airplane.mesh.rotation.x = (airplane.mesh.position.y-targetY)*0.0064;

	airplane.propeller.rotation.x += 0.3;
	airplane.pilot.updateHairs();
	
	// Update game speed
	game.speed = game.baseSpeed;
}

function normalize(v,vmin,vmax,tmin, tmax){

	var nv = Math.max(Math.min(v,vmax), vmin);
	var dv = vmax-vmin;
	var pc = (nv-vmin)/dv;
	var dt = tmax-tmin;
	var tv = tmin + (pc*dt);
	return tv;

}