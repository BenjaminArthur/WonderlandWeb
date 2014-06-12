//Nexus Land

//Item Definitions:

//Ground
var groundGeometry = new THREE.PlaneGeometry(10,10,1,1);
var groundMaterial = new THREE.MeshLambertMaterial({color: 0xffffff});
var ground = new THREE.Mesh(groundGeometry, groundMaterial);

//Light
var light = new THREE.PointLight( 0xffffff, 2, 20 );
light.position.set( -5, 10, 5 );

//defines a custom box to be placed in the Land and animated
var boxHeight = 1;
var boxWidth = 1;
var boxDepth = 1;
var boxGeometry = new THREE.BoxGeometry(boxWidth,boxHeight,boxDepth);
var greenMaterial = new THREE.MeshLambertMaterial({color: 0x00ff00});
var box = new THREE.Mesh(boxGeometry, greenMaterial);
var boxFloatSpeed = .003;

//a custom function that makes updates that animate the box when called each frame
function moveBox()
{
	box.rotation.y += 0.01;
	box.position.y += boxFloatSpeed + (boxFloatSpeed * (box.position.y - groundHeight + (boxHeight / 2)));
	if (box.position.y <= groundHeight + (boxHeight / 2)) 
	{
		box.position.y = groundHeight + (boxHeight / 2);
		boxFloatSpeed = -boxFloatSpeed;
	}
	if (box.position.y >= groundHeight +  groundHeight +(1.5* boxHeight)) 
	{
		box.position.y = groundHeight +  groundHeight +(1.5* boxHeight);
		boxFloatSpeed = -boxFloatSpeed;
	}
};

//Things to happen every frame in your Land
updateScene = function ()
{
	moveBox();
};

//Setup objects and add them to the Region, then begin the render loop
setupRegion = function ()
{
	//do whatever you need to do to put things in their initial placement in your Land
	renderer.antialias = true;
	scene.add(ground);
	scene.add(box);
	scene.add( light );
	box.position.y = groundHeight + (boxHeight / 2);
	ground.rotation.x = -(Math.PI / 2);
	ground.position.y = groundHeight;
	
	//Go back to engine to run render function
	render();
};
//region is loaded, initialize it
setupRegion();