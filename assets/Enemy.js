function Enemy(){
	var enemyGeometry = if x %2 = 0 {
    new THREE.SphereGeometry(2, 40, 40);
    } 
	var enemyMaterial = new THREE.MeshBasicMaterial({transparent: true, opacity: 0.75, color: "rgb(Utils.getRandomInRange(0, 255), Utils.getRandomInRange(0, 255), Utils.getRandomInRange(0, 255))"});

	var enemy = new THREE.Mesh(enemyGeometry, enemyMaterial);

	return enemy;
}

module.exports = Enemy;