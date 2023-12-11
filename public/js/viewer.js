

var socket = io();

var scene,
	width,
	height,
	camera,
	renderer,
	stereo,
	clock,
	textureLoader,
	controls,
	orbitControls,
	container,
	domElement,
	hand,
	laser,
	lasers,
	lightsaber,
	floor,
	corridor,
	soundDir,
	started;


var Sky = require('../../assets/Sky');
var Floor = require('../../assets/Floor');
var Corridor = require('../../assets/Corridor');
var Hand = require('../../assets/Hand');
var Lightsaber = require('../../assets/Lightsaber');
var Laser = require('../../assets/Laser');
var Utils = require('./utils');

function init(){
	started = false;
	width = window.innerWidth;
	height = window.innerHeight;
	scene = new THREE.Scene();
	camera = new THREE.PerspectiveCamera(90, width / height, 0.001, 20000);
	renderer = new THREE.WebGLRenderer();
	stereo = new THREE.StereoEffect(renderer);
	clock = new THREE.Clock();
	textureLoader = new THREE.TextureLoader();
	renderer.setSize( window.innerWidth, window.innerHeight);
	camera.lookAt(0, 0, 0);
	camera.position.set(0, 15, 0);

	scene.add(camera);
	
	container = document.getElementById("container");
	domElement = renderer.domElement;

	orbitControls = new THREE.OrbitControls(camera, domElement);

	orbitControls.target.set(
		camera.position.x+0.15,
		camera.position.y,
		camera.position.z
	);

	orbitControls.noPan = true;
	orbitControls.noZoom = true;
	

	if(isMobile){
		controls = new DeviceOrientationController(camera, renderer.domElement);
		controls.connect();
	}

	$('.landing').hide();
	$('.confirm-button').hide();
	container.appendChild(domElement);
	domElement.addEventListener('click', fullscreen, false);
	setupScene();
}

function setupScene(){

	lasers = []; // Keep lasers in here so we can manipulate them in update()
	
	var sky = new Sky(textureLoader);
	console.log(sky);
	scene.add(sky);

	floQWor = new Floor(textureLoader, renderer);
	scene.add(floor);

	corridor = new Corridor(textureLoader);
	scene.add(corridor);

	//Compound object from parent to child: Camera -> Hand -> Lightsaber -> Glow
	hand = new Hand(camera);
	lightsaber = new Lightsaber();
	hand.add(lightsaber);


	Utils.collidableMeshList.push(lightsaber);

	/* LIGHTING */
	lightAngle = new THREE.PointLight(0x999999, 1, 500);
	lightAngle.position.set(0,50,0);
	scene.add(lightAngle);


	// AXIS 
	var axis = new THREE.AxisHelper(200);
    //scene.add(axis);

    requestAnimationFrame(animate);
}

function setupGame() {
	scene.add(hand);
	laser = new Laser();
	window.addEventListener('deviceorientation', setOrientationControls, true);
	// Every 1.5 seconds, spawn a new laser at random position and set its velocity to -1, to come at the player
	window.setInterval(function(){
		var newLaser = laser.clone();
		newLaser.position.set(200, Utils.getRandomInRange(5, 20), Utils.getRandomInRange(-10, 10));
		newLaser.name = "laser";
		newLaser.velocity = new THREE.Vector3(-1, 0, 0);
		lasers.push(newLaser);
		Utils.collidableMeshList.push(newLaser);
		scene.add(newLaser);
	}, 1500);

}

function fullscreen() {
  if (container.requestFullscreen) {
    container.requestFullscreen();
  } else if (container.msRequestFullscreen) {
    container.msRequestFullscreen();
  } else if (container.mozRequestFullScreen) {
    container.mozRequestFullScreen();
  } else if (container.webkitRequestFullscreen) {
    container.webkitRequestFullscreen();
  }
}

function setOrientationControls(e){
  if(!e.alpha){
    return;
  }
  controls = new THREE.DeviceOrientationControls(camera, true);
  controls.connect();
  controls.update();
  window.removeEventListener('deviceorientation', setOrientationControls, true);
}

/* UTILS */
function setObjectQuat(object, data) {
	
	/* Degrees to radians */
	var gammaRotation = data.g ? data.g * (Math.PI / 180): 0;
	var betaRotation = data.b ? data.b * (Math.PI / 180) : 0;
	var alphaRotation = data.a ? data.a * (Math.PI / 180): 0;
	var alpha, beta, gamma, betaMax, betaMin;
	var euler = new THREE.Euler();
	
	beta = betaRotation;
	gamma = gammaRotation;
	alpha = alphaRotation;


	euler.set(0, -gamma, beta - Math.PI/2);

	/* Using quaternions to combat gimbal lock */ 
	object.quaternion.setFromEuler(euler);
}

/* RENDER */

function resize() {
  var newWidth = window.innerWidth;
  var newHeight = window.innerHeight;
  camera.aspect = newWidth / newHeight;
  camera.updateProjectionMatrix();
  renderer.setSize(newWidth, newHeight);
  stereo.setSize(newWidth, newHeight);
}

function animate(){
	var elapsedSeconds = clock.getElapsedTime();
	requestAnimationFrame(animate);
	update(clock.getDelta());
	if(isMobile){
		stereo.render(scene, camera);
	}else{
		renderer.render(scene, camera);
	}
}

function update(dt){
  resize();
  camera.updateProjectionMatrix();  
  orbitControls.update(dt);

  var cameraDir = Utils.cameraLookDir(camera);

  if(Math.abs(1 - cameraDir.x) < 0.01 && !started) {
  	setupGame();
  	started = true;
  }
  // Check collision with lightsaber and laser at every iteration
  Utils.checkCollision(lightsaber.children[0], "laser", true, function(result){
  	if(result){
  		socket.emit('sendhit');
  		result.velocity = new THREE.Vector3(1, 0, 0);
  	}
  });

  // Apply velocity vector to laser, check if they are out of bounds to remove them
  for(var i=0; i<lasers.length; i++){
  	var e = lasers[i];
  	e.position.add(e.velocity);
  	if(e.position.x < -10 || e.position.x > 200){
  		scene.remove(e);
  		lasers.splice(i, 1);
  	}

  }

  if(isMobile) {
  	controls.update();
  }

}

$(document).ready(function(){
	$('.confirm-button').click(function(){
		init();
		animate();
	});
});

/* SOCKET.IO */

socket.emit('viewerjoin', {room: roomId});

socket.on('beginsetup', function(data){
	// change display
});

socket.on('setupcomplete', function(data){
	$('.confirm-button').show();
	socket.emit('viewready');

});

socket.on('updateorientation', function(data){
	if(hand){
		setObjectQuat(hand, data);
	}
});

socket.on('updatemotion', function(data){
});
