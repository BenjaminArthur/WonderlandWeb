//Wonderland Web Engine
var controls;
var userX;
var userY;
var userZ;
var userPitch;//up/down rotation
var userRoll;//tilt rotation
var userYaw;//turn rotation

var scene = new THREE.Scene();
var camera = new THREE.PerspectiveCamera(50, window.innerWidth/window.innerHeight, 0.1, 1000);
var renderer = new THREE.WebGLRenderer();
renderer.setClearColor( 0xcccccc );
renderer.setSize(window.innerWidth, window.innerHeight);
document.body.appendChild(renderer.domElement);

var updateScene;

var objects = [];
var ray;
var pauseOverlay;
var pauseMenu;
var havePointerLock = 'pointerLockElement' in document || 'mozPointerLockElement' in document || 'webkitPointerLockElement' in document;


//Updates and renders the scene.
var render = function () 
{
	requestAnimationFrame(render);
	updateScene();
	controls.isOnObject( false );
	ray.ray.origin.copy( controls.getObject().position );
	ray.ray.origin.y -= 10;
	var intersections = ray.intersectObjects( objects );
	if ( intersections.length > 0 ) 
	{
		var distance = intersections[ 0 ].distance;
		if ( distance > 0 && distance < 10 ) 
		{
			controls.isOnObject( true );
		}
	}
	controls.update();
	renderer.render( scene, camera );
};

//Imports a new Land file, then calls a function.
//address = the address of the file to load (relative to the html page the emgine is started by)
//id = a unique name for the land
function importScript(address, id)
{
    var head = document.getElementsByTagName('head')[0];
    var script = document.createElement('script');    
    script.type = 'text/javascript';
    script.src = address;
    script.id = id;
    head.appendChild(script);
};

THREE.PointerLockControls = function ( camera ) 
{

	var scope = this;

	camera.rotation.set( 0, 0, 0 );

	var pitchObject = new THREE.Object3D();
	pitchObject.add( camera );

	var yawObject = new THREE.Object3D();
	yawObject.position.y = eyeLevel;
	yawObject.add( pitchObject );

	var moveForward = false;
	var moveBackward = false;
	var moveLeft = false;
	var moveRight = false;

	var isOnObject = false;
	var canJump = false;

	var prevTime = performance.now();

	var velocity = new THREE.Vector3();

	var PI_2 = Math.PI / 2;

	var onMouseMove = function ( event ) 
	{
		if ( scope.enabled === false ) return;

		var movementX = event.movementX || event.mozMovementX || event.webkitMovementX || 0;
		var movementY = event.movementY || event.mozMovementY || event.webkitMovementY || 0;

		yawObject.rotation.y -= movementX * 0.002;
		pitchObject.rotation.x -= movementY * 0.002;

		pitchObject.rotation.x = Math.max( - PI_2, Math.min( PI_2, pitchObject.rotation.x ) );
	};

	var onKeyDown = function ( event ) 
	{
		switch ( event.keyCode ) 
		{
			case 38: // up
			case 87: // w
				moveForward = true;
				break;

			case 37: // left
			case 65: // a
				moveLeft = true; break;

			case 40: // down
			case 83: // s
				moveBackward = true;
				break;

			case 39: // right
			case 68: // d
				moveRight = true;
				break;

			case 32: // space
				if ( canJump === true ) velocity.y += 25;
				canJump = false;
				break;
		}
	};

	var onKeyUp = function ( event ) 
	{
		switch( event.keyCode ) 
		{
			case 38: // up
			case 87: // w
				moveForward = false;
				break;

			case 37: // left
			case 65: // a
				moveLeft = false;
				break;

			case 40: // down
			case 83: // s
				moveBackward = false;
				break;

			case 39: // right
			case 68: // d
				moveRight = false;
				break;
		}
	};

	document.addEventListener( 'mousemove', onMouseMove, false );
	document.addEventListener( 'keydown', onKeyDown, false );
	document.addEventListener( 'keyup', onKeyUp, false );

	this.enabled = false;

	this.getObject = function () 
	{
		return yawObject;
	};

	this.isOnObject = function ( boolean ) 
	{
		isOnObject = boolean;
		canJump = boolean;
	};

	this.getDirection = function() 
	{
		// assumes the camera itself is not rotated
		var direction = new THREE.Vector3( 0, 0, -1 );
		var rotation = new THREE.Euler( 0, 0, 0, "YXZ" );

		return function( v ) 
		{
			rotation.set( pitchObject.rotation.x, yawObject.rotation.y, 0 );

			v.copy( direction ).applyEuler( rotation );

			return v;
		}

	}();

	this.update = function () 
	{
		if ( scope.enabled === false ) return;

		var time = performance.now();
		var delta = ( time - prevTime ) / 1000;

		velocity.x -= velocity.x * 9.5 * delta;
		velocity.z -= velocity.z * 9.5 * delta;

		velocity.y -= .7 * 100.0 * delta; // 10.0 = mass

		if ( moveForward ) velocity.z -= 200.0 * delta;
		if ( moveBackward ) velocity.z += 200.0 * delta;

		if ( moveLeft ) velocity.x -= 200.0 * delta;
		if ( moveRight ) velocity.x += 200.0 * delta;

		if ( isOnObject === true ) 
		{
			velocity.y = Math.max( 0, velocity.y );
		}

		yawObject.translateX( velocity.x * delta );
		yawObject.translateY( velocity.y * delta ); 
		yawObject.translateZ( velocity.z * delta );

		if ( yawObject.position.y < eyeLevel ) 
		{
			velocity.y = 0;
			yawObject.position.y = eyeLevel;
			canJump = true;
		}
	
		prevTime = time;
	};
};

controls = new THREE.PointerLockControls( camera );
scene.add( controls.getObject() );

function onWindowResize() 
{
	camera.aspect = window.innerWidth / window.innerHeight;
	camera.updateProjectionMatrix();

	renderer.setSize( window.innerWidth, window.innerHeight );
}

function setupEngine()
{
	scene.fog = new THREE.Fog( 0xff00ff, 10, 100 );
	controls = new THREE.PointerLockControls( camera );
	scene.add( controls.getObject() );
	ray = new THREE.Raycaster();
	ray.ray.direction.set( 0, -1, 0 );
	//import a region;
	importScript(regions[0], "Nexus");
	//position the camera at a natural eye-level for someone of the given user height
	camera.position.z = 5;
	camera.position.y = eyeLevel;
	pauseOverlay = document.getElementById( 'PauseOverlay' );
	pauseMenu = document.getElementById( 'PauseMenu' );	
	if ( havePointerLock )
	{
		var element = document.body;
		var pointerlockchange = function ( event ) 
		{
			if ( document.pointerLockElement === element || document.mozPointerLockElement === element || document.webkitPointerLockElement === element ) 
			{
				controls.enabled = true;
				pauseOverlay.style.display = 'none';
			} 
			else 
			{
				controls.enabled = false;

				pauseOverlay.style.display = '-webkit-box';
				pauseOverlay.style.display = '-moz-box';
				pauseOverlay.style.display = 'box';

				pauseMenu.style.display = '';
			}
		}
		var pointerlockerror = function ( event ) 
		{
			pauseMenu.style.display = '';
		}
		// Hook pointer lock state change events
		document.addEventListener( 'pointerlockchange', pointerlockchange, false );
		document.addEventListener( 'mozpointerlockchange', pointerlockchange, false );
		document.addEventListener( 'webkitpointerlockchange', pointerlockchange, false );

		document.addEventListener( 'pointerlockerror', pointerlockerror, false );
		document.addEventListener( 'mozpointerlockerror', pointerlockerror, false );
		document.addEventListener( 'webkitpointerlockerror', pointerlockerror, false );

		pauseMenu.addEventListener( 'click', function ( event ) 
		{
			pauseMenu.style.display = 'none';

		// Ask the browser to lock the pointer
			element.requestPointerLock = element.requestPointerLock || element.mozRequestPointerLock || element.webkitRequestPointerLock;

			if ( /Firefox/i.test( navigator.userAgent ) ) 
			{
				var fullscreenchange = function ( event ) 
				{
					if ( document.fullscreenElement === element || document.mozFullscreenElement === element || document.mozFullScreenElement === element ) 
					{

						document.removeEventListener( 'fullscreenchange', fullscreenchange );
						document.removeEventListener( 'mozfullscreenchange', fullscreenchange );

						element.requestPointerLock();
					}

				}

				document.addEventListener( 'fullscreenchange', fullscreenchange, false );
				document.addEventListener( 'mozfullscreenchange', fullscreenchange, false );

				element.requestFullscreen = element.requestFullscreen || element.mozRequestFullscreen || element.mozRequestFullScreen || element.webkitRequestFullscreen;

				element.requestFullscreen();

			} 
			else 
			{
				element.requestPointerLock();
			}

		}, false );

	}
	else 
	{
		pauseMenu.innerHTML = 'Your browser doesn\'t seem to support Pointer Lock API.<br/>Wonderland Web could not start.';
	}

	window.addEventListener( 'resize', onWindowResize, false );
};