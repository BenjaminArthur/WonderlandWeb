//Nexus Land

//Item Definitions:

//Ground
var groundGeometry = new THREE.PlaneGeometry(70,70,10,10);
//var groundMaterial = new THREE.MeshLambertMaterial({color: 0xffffff});
var groundTexture = THREE.ImageUtils.loadTexture('assets/images/checkerboard.png');
groundTexture.wrapS = groundTexture.wrapT = THREE.RepeatWrapping;
groundTexture.repeat.set( 10,10 );
var groundMaterial = new THREE.MeshLambertMaterial({map: groundTexture});
var ground = new THREE.Mesh(groundGeometry, groundMaterial);



//room volume
var volumeHeight = 20;
var volumeWidth = 70;
var volumeDepth = 70;
var volumeGeometry = new THREE.BoxGeometry(volumeWidth,volumeHeight,volumeDepth);
var volumeBottomTexture = THREE.ImageUtils.loadTexture('assets/images/checkerboard.png');
volumeBottomTexture.wrapS = groundTexture.wrapT = THREE.RepeatWrapping;
volumeBottomTexture.repeat.set( 10,10 );

var volumeMaterials = [];
volumeMaterials.push(new THREE.MeshLambertMaterial({color: 0x000000, side : THREE.BackSide })); // right face
volumeMaterials.push(new THREE.MeshLambertMaterial({color: 0x000000, side : THREE.BackSide })); // left face
volumeMaterials.push(new THREE.MeshLambertMaterial({color: 0x000000, side : THREE.BackSide })); // top face
volumeMaterials.push(new THREE.MeshLambertMaterial({map: groundTexture, side : THREE.BackSide })); // bottom face
volumeMaterials.push(new THREE.MeshLambertMaterial({color: 0x000000, side : THREE.BackSide })); // front face
volumeMaterials.push(new THREE.MeshLambertMaterial({color: 0x000000, side : THREE.BackSide })); // back face


var volumeMaterial = new THREE.MeshFaceMaterial(volumeMaterials);
landVolume = new THREE.Mesh(volumeGeometry, volumeMaterial);
landVolume.castShadow = false;
landVolume.receiveShadow = true;

//Light
var light = new THREE.PointLight( 0xffffff, 4, 100 );
light.position.set( -5, 10, 5 );
light.castShadow = true;
light.shadowDarkness = 0.5;
light.showCameraVisible = true;

light.shadowCameraRight     =  5;
light.shadowCameraLeft     = -5;
light.shadowCameraTop      =  5;
light.shadowCameraBottom   = -5;

var lightImage = THREE.ImageUtils.loadTexture( "assets/images/light.png" );
var material = new THREE.SpriteMaterial( { map: lightImage} );
var lightSprite = new THREE.Sprite( material );
lightSprite.position.set( -5, 10, 5 );


var light2 = new THREE.AmbientLight(0x404040);
scene.add(light2);


//imports a table

	refractSphereCamera = new THREE.CubeCamera( .1, 50, 512 );
	scene.add( refractSphereCamera );
	//refractSphereCamera.rotation.z = (Math.PI);

	var fShader = THREE.FresnelShader;
	
	var fresnelUniforms = 
	{
		"mRefractionRatio": { type: "f", value: 0.98 },
		"mFresnelBias": 	{ type: "f", value: 0.1 },
		"mFresnelPower": 	{ type: "f", value: 2.0 },
		"mFresnelScale": 	{ type: "f", value: 1.5 },
		"tCube": 			{ type: "t", value: refractSphereCamera.renderTarget } //  textureCube }
	};
	
var glassMaterial = new THREE.ShaderMaterial( {
		uniforms: 		fresnelUniforms,
		vertexShader:   fShader.vertexShader,
		fragmentShader: fShader.fragmentShader
} );;



var table;


var manager = new THREE.LoadingManager();
manager.onProgress = function ( item, loaded, total ) 
{
	console.log( item, loaded, total );
};
var loader = new THREE.OBJLoader(manager);




//defines a custom box to be placed in the Land and animated
var boxHeight = 1;
var boxWidth = 1;
var boxDepth = 1;
var boxGeometry = new THREE.BoxGeometry(boxWidth,boxHeight,boxDepth);

var boxTexture = THREE.ImageUtils.loadTexture('assets/images/checkerboard.png');
var boxMaterial = new THREE.MeshLambertMaterial({color: 0x00ff00});
var box = new THREE.Mesh(boxGeometry.clone(), boxMaterial);


var boxFloatSpeed = .001;

//a custom function that makes updates that animate the box when called each frame
function moveBox()
{
	box.rotation.y += 0.01;
	box.position.y += boxFloatSpeed + (boxFloatSpeed * (box.position.y - groundHeight + (boxHeight / 2)));
	if (box.position.y <= groundHeight + (boxHeight *5)) 
	{
		box.position.y = groundHeight + (boxHeight *5);
		boxFloatSpeed = -boxFloatSpeed;
	}
	if (box.position.y >= groundHeight +  groundHeight +(6* boxHeight)) 
	{
		box.position.y = groundHeight +  groundHeight +(6* boxHeight);
		boxFloatSpeed = -boxFloatSpeed;
	}
};

//Things to happen every frame in your Land
updateScene = function ()
{
	moveBox();
	
	box.visible = false;
	table.visible = false;
	refractSphereCamera.updateCubeMap( renderer, scene );
	refractSphereCamera.position.set(camera.position.x, camera.position.y +5, camera.position.z);
	box.visible = true;
	table.visible = true;
};



//Setup objects and add them to the Region, then begin the render loop
setupRegion = function ()
{
	//do whatever you need to do to put things in their initial placement in your Land
	renderer.antialias = true;
	//scene.add(ground);
	scene.add(landVolume);
	//scene.add( lightSprite );
	landVolume.position.y = groundHeight + (volumeHeight / 2);
	//scene.add(box);
	scene.add( light );
	box.position.y = groundHeight + (boxHeight * 5);
	ground.rotation.x = -(Math.PI / 2);
	ground.position.y = groundHeight;
	
		
	
	loader.load('assets/objects/table.obj', function (object) 
	{
		table = object;
	   table.traverse( function ( child ) 
	   {
			if ( child instanceof THREE.Mesh ) {
				child.material = glassMaterial;
				child.scale.set(.032,.032,.032);
				landVolume.castShadow = true;
				landVolume.receiveShadow = true;
			}
		} );

		table.position.y = groundHeight;
		scene.add( table );
		objects.push(table);
	});
	
	objects = [ground, box];
	//Go back to engine to run render function
	render();
};
//region is loaded, initialize it
setupRegion();