var socket = io();

// stores default lightsaber color variable
var lightsaberColor = {color: "#00ffff"}

var alpha, beta, gamma;
alpha = document.getElementById("alpha");
beta = document.getElementById("beta");
gamma = document.getElementById("gamma");

socket.emit('lightsaberjoin', {room: roomId});

socket.on('beginsetup', function(data){
	 window.addEventListener("compassneedscalibration", function(event) {
    	alert('Your compass needs calibrating!');
    	event.preventDefault();
    }, true);
	socket.emit('setupcomplete');
});

socket.on('viewready', function(data){

	var originalAlpha = 0;
	var freezeAlpha = false;
	var oldOrientation = {};
	var oldMotion = {};

	if(window.DeviceOrientationEvent){
		window.addEventListener('deviceorientation', function(e){
			if(!freezeAlpha) {
				originalAlpha = e.alpha;
				freezeAlpha = true;
			}
			var orientation = {g: Math.round(e.gamma), b: Math.round(e.beta), a: Math.round(e.alpha), o: window.orientation || 0};
			alpha.innerHTML = orientation.a;
			beta.innerHTML = orientation.b;
			gamma.innerHTML = orientation.g;
			if(JSON.stringify(orientation) != JSON.stringify(oldOrientation)){
				var calibratedOrientation = {g: orientation.g, b: orientation.b, a: orientation.a - Math.abs(originalAlpha), o: orientation.o}
				socket.emit('sendorientation', calibratedOrientation);
				oldOrientation = calibratedOrientation;
			}
		});
	}
});


var muted = false,
	muteClass = "volume fa fa-volume-off",
	volumeClass = "volume fa fa-volume-up",
	volumeButton = document.getElementsByClassName("volume")[0],
	audio = new Audio();
	soundDir  = "/sounds/",
	hitFiles = ["hit1.wav", "hit2.wav", "hit3.wav", "hit4.wav"],
	hitSounds = ["/sounds/hit1.wav", "/sounds/hit2.wav", "/sounds/hit3.wav", "/sounds/hit4.wav"];

// volumeButton.addEventListener("click", function(){
// 	if(muted){
// 		volumeButton.className = volumeClass;
// 		muted = false;
// 	}	
// 	changeAudio();
// });

function changeAudio(){
    if(!muted){
        for(var i=0; i<hitFiles.length; i++){
            var newAudio = document.createElement("AUDIO");
            newAudio.id = "audio";
            newAudio.src= soundDir+hitFiles[Math.floor(Math.random() * 3)];
            newAudio.load();
            hitSounds.push(newAudio);
        }
    }
}

function changeColor(sabercolor){
    lightsaberColor = {color: sabercolor}
}

// starts game 
function startgame(){
    socket.emit('startedGame', lightsaberColor);
    // displays main lightsaber on controller
    $('#center').fadeIn(500);

    // hides smaller lightsabers and button
    $('.saber').fadeOut(100);
    $('.confirm-button').fadeOut(100);
    $('.landing').fadeOut(100);

}

// activiates powerAttack_1
function powerAttack_1(){
    socket.emit('powerAttack_1');
    console.log("powerAttack_1 clicked");
}

socket.on('playsound', function(data){
    // hitSounds[Math.floor(Math.random() * 3)].play();
});