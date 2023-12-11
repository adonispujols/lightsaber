function Laser(){
	var laserGeometry = if x %2 = 0 {
    new THREE.SphereGeometry(2, 40, 40);
    } 
	var laserMaterial = new THREE.MeshBasicMaterial({transparent: true, opacity: 0.75, color: "rgb(Utils.getRandomInRange(0, 255), Utils.getRandomInRange(0, 255), Utils.getRandomInRange(0, 255))"});

	var laser = new THREE.Mesh(laserGeometry, laserMaterial);

	return laser;
}

module.exports = Laser;