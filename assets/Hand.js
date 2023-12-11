function Hand(camera){
	/* HANDLE */
	var handGeometry = new THREE.CylinderGeometry(.7, .7, 6, 7);
	var handMaterial = new THREE.MeshBasicMaterial({color: "#545355"});
	hand = new THREE.Mesh(handGeometry, handMaterial);
	hand.position.set(15, 6, camera.position.z / 2);
	return hand;
}

module.exports = Hand;