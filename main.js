import * as THREE from 'https://unpkg.com/three@0.126.1/build/three.module.js';
import {TrackballControls} from 'https://unpkg.com/three@0.126.1/examples/jsm/controls/TrackballControls.js';
import { RGBELoader } from 'https://unpkg.com/three@0.126.1/examples/jsm/loaders/RGBELoader.js';
import { OBJLoader } from 'https://unpkg.com/three@0.126.1/examples/jsm/loaders/OBJLoader.js';
import * as dat from 'dat.gui';

let camera, controls, scene, renderer, spotLight;

const sceneSize = 8;
let activeLights = [];
const rotatables = new THREE.Group();

const parameters = {
  shadows: {
    shadowsEnable: false
  },
  lights: {
    spotLightTargetX: 4,
    spotLightTargetY: 10,
    spotLightTargetZ: 4,
    spotLightIntensity: 3,
    spotLightAngle: Math.PI/12
  },
  scene: {
    rotationEnable: false
  },
  renderer: {
    exposure: 0.1
  }
}

init();
animate();

function init() {

  //GUI controls section
  const gui = new dat.GUI()

  gui.add(parameters.shadows, 'shadowsEnable').name("Enable shadows")
    .onChange(()=> {
      scene.traverse(function(element) {
        element.castShadow = parameters.shadows.shadowsEnable
      }) 
    })
  
  gui.add(parameters.lights, 'spotLightTargetX', -sceneSize/2, sceneSize/2, 0.1)
    .onChange((value)=> { 
      parameters.lights.spotLightTargetX = value
      spawnLights()
    })

  gui.add(parameters.lights, 'spotLightTargetY', -sceneSize/2, sceneSize/2, 0.1)
  .onChange((value)=> { 
    parameters.lights.spotLightTargetY = value
    spawnLights()
  })

  gui.add(parameters.lights, 'spotLightTargetZ', -sceneSize/2, sceneSize/2, 0.1)
  .onChange((value)=> { 
    parameters.lights.spotLightTargetZ = value
    spawnLights()
  })

  gui.add(parameters.lights, 'spotLightIntensity', 0.5, 20, 0.1)
    .onChange((value) => {
      parameters.lights.spotLightIntensity = value
      spawnLights()
    })

  gui.add(parameters.scene, 'rotationEnable').name("Enable rotation")
    .onChange(()=>{console.log(parameters.scene)})
  
  //Scene
  scene = new THREE.Scene()

  const cylinderGeometry = new THREE.CylinderGeometry( sceneSize*0.35, sceneSize*0.35, sceneSize*10, 24 );
  const cylinderMaterial = new THREE.MeshPhongMaterial( {color: 0x000000} );
  const cylinderMesh = new THREE.Mesh( cylinderGeometry, cylinderMaterial );
  cylinderMesh.translateY(-sceneSize*5.04)
  scene.add( cylinderMesh );

  //Camera
  camera = new THREE.PerspectiveCamera(75, innerWidth/innerHeight, 0.1, 1000)
  camera.position.z = 5

  //Renderer
  renderer = new THREE.WebGLRenderer( { antialias: true } );
  renderer.setPixelRatio( window.devicePixelRatio );
  renderer.setSize( window.innerWidth, window.innerHeight );
  renderer.shadowMap.enabled = true;
  renderer.shadowMap.type = THREE.PCFSoftShadowMap;
  document.body.appendChild( renderer.domElement );

  //Settings for HDR
  renderer.toneMapping = THREE.ReinhardToneMapping;
  renderer.toneMappingExposure = parameters.renderer.exposure;
  renderer.outputEncoding = THREE.sRGBEncoding;

  //Load HDR
  new RGBELoader()
    .load( './old_hall_2k.hdr', function ( texture) {

      texture.mapping = THREE.EquirectangularReflectionMapping;

      scene.background = texture;
      scene.environment = texture;

    } );


  //Trackball controls
  controls = new TrackballControls( camera, renderer.domElement );

  controls.rotateSpeed = 1.0;
  controls.zoomSpeed = 1.2;
  controls.panSpeed = 0.8;

  controls.keys = [ 'KeyA', 'KeyS', 'KeyD' ];

  //lights
  spawnLights()

  //board
  spawnBoard(sceneSize)
  spawnPieces(sceneSize)

  console.log(rotatables)
  scene.add(rotatables)

}



function animate() {
  requestAnimationFrame(animate)

  if ( parameters.scene.rotationEnable == true) {

    rotatables.rotateOnWorldAxis(new THREE.Vector3(0, 1, 0), 0.003)

  }

  controls.update()
  
  renderer.render(scene, camera)
}

function spawnPieces(sceneSize) {
  
  const unit = sceneSize/8
  const half = sceneSize/16

  for (let i = 0; i < 8; i++) {
    pawn(sceneSize/26, 0xffffff, -sceneSize/2+i*unit+half, unit*2+half)
  }
  

  for (let j = 0; j < 8; j++) {
    pawn(sceneSize/26, 0x000000, -sceneSize/2+j*unit+half, -unit*3+half)
  }

  king(sceneSize*0.05, 0xffffff, -unit+half, unit*3+half)
  king(sceneSize*0.05, 0x000000, 0+half, -unit*4+half)

  rook(sceneSize/23, 0x000000, -sceneSize/2+half, -sceneSize/2+half)
  rook(sceneSize/23, 0x000000, sceneSize/2-half, -sceneSize/2+half)

  rook(sceneSize/23, 0xffffff, -sceneSize/2+half, sceneSize/2-half)
  rook(sceneSize/23, 0xffffff, sceneSize/2-half, sceneSize/2-half)
}

function pawn(size, input_color, movX, movZ) {

  const material = new THREE.MeshPhysicalMaterial( {
    color: input_color,
    metalness: 0,
    roughness: 0.5,
    clearcoat: 0.0,
    clearcoatRoughness: 0.3,
    reflectivity: 0.5,
    transmission: 0.9
  } );

  const g1 = new THREE.BoxGeometry( size*1.7, size*0.1, size*1.7 );
  g1.translate(movX, 0, movZ)
  const g2 = new THREE.BoxGeometry( size*1.3, size*0.8, size*1.3 );
  g2.translate(movX, size*0.4, movZ)
  const g3 = new THREE.BoxGeometry( size*1.4, size*0.1, size*1.4 );
  g3.translate(movX, size*0.8, movZ)
  const g4 = new THREE.BoxGeometry( size*1.0, size*0.7, size*1.0 );
  g4.translate(movX, size*1.2, movZ)
  const g5 = new THREE.BoxGeometry( size*1.1, size*0.1, size*1.1 );
  g5.translate(movX, size*1.6, movZ)
  const g6 = new THREE.BoxGeometry( size*0.6, size*1.1, size*0.6 );
  g6.translate(movX, size*2.2, movZ)
  const g7 = new THREE.BoxGeometry( size*0.7, size*0.1, size*0.7 );
  g7.translate(movX, size*2.7, movZ)
  const g8 = new THREE.BoxGeometry( size*0.2, size*0.4, size*0.2 );
  g8.translate(movX, size*2.9, movZ)
  const g9 = new THREE.BoxGeometry( size*0.9, size*0.8, size*0.9 );
  g9.translate(movX, size*3.2, movZ)

  
  const c1 = new THREE.Mesh( g1, material );
  c1.castShadow = parameters.shadows.shadowsEnable;
  const c2 = new THREE.Mesh( g2, material );
  c2.castShadow = parameters.shadows.shadowsEnable;
  const c3 = new THREE.Mesh( g3, material );
  c3.castShadow = parameters.shadows.shadowsEnable;
  const c4 = new THREE.Mesh( g4, material );
  c4.castShadow = parameters.shadows.shadowsEnable;
  const c5 = new THREE.Mesh( g5, material );
  c5.castShadow = parameters.shadows.shadowsEnable;
  const c6 = new THREE.Mesh( g6, material );
  c6.castShadow = parameters.shadows.shadowsEnable;
  const c7 = new THREE.Mesh( g7, material );
  c7.castShadow = parameters.shadows.shadowsEnable;
  const c8 = new THREE.Mesh( g8, material );
  c8.castShadow = parameters.shadows.shadowsEnable;
  const c9 = new THREE.Mesh( g9, material );
  c9.castShadow = parameters.shadows.shadowsEnable;


  rotatables.add( c1 );
  rotatables.add( c2 );
  rotatables.add( c3 );
  rotatables.add( c4 );
  rotatables.add( c5 );
  rotatables.add( c6 );
  rotatables.add( c7 );
  rotatables.add( c8 );
  rotatables.add( c9 );
}

function king(scale, input_color, movX, movZ) {

  const points = []
  
  points.push(new THREE.Vector2(0, 0));
  points.push(new THREE.Vector2(1, 0));
  points.push(new THREE.Vector2(1.05, 0.072));
  points.push(new THREE.Vector2(0.946, 0.159));
  points.push(new THREE.Vector2(0.997, 0.204));
  points.push(new THREE.Vector2(0.885, 0.2960));
  
  points.push(new THREE.Vector2(1, 0.468  ));
  points.push(new THREE.Vector2(0.93, 0.6 ));
  points.push(new THREE.Vector2( 0.67, 0.71 ));
  points.push(new THREE.Vector2( 0.78, 0.79 ));
  points.push(new THREE.Vector2( 0.688, 0.872 ));

  points.push(new THREE.Vector2( 0.638, 0.852 ));
  points.push(new THREE.Vector2( 0.43, 1.43 ));
  points.push(new THREE.Vector2( 0.34, 2.12 ));
  points.push(new THREE.Vector2( 0.334, 2.67 ));
  points.push(new THREE.Vector2( 0.54, 2.67 ));

  points.push(new THREE.Vector2( 0.643, 2.81 ));
  points.push(new THREE.Vector2( 0.496, 2.9 ));
  points.push(new THREE.Vector2( 0.5, 2.96 ));
  points.push(new THREE.Vector2( 0.41, 3 ));
  points.push(new THREE.Vector2( 0.445, 3.06 ));

  points.push(new THREE.Vector2( 0.324, 3.12 ));
  points.push(new THREE.Vector2( 0.4, 3.36 ));
  points.push(new THREE.Vector2( 0.55, 3.63 ));
  points.push(new THREE.Vector2( 0.612, 3.79 ));
  points.push(new THREE.Vector2( 0.506, 3.78 ));

  points.push(new THREE.Vector2( 0.273, 3.88 ));
  points.push(new THREE.Vector2( 0.208, 3.93 ));
  points.push(new THREE.Vector2( 0.263, 4 ));
  points.push(new THREE.Vector2( 0.172, 4.08 ));
  points.push(new THREE.Vector2( 0, 4.085 ));

  const geometry = new THREE.LatheGeometry( points, 24);

  
  const material = new THREE.MeshPhysicalMaterial( {
    color: input_color,
    metalness: 0.3,
    roughness: 0.8,
    clearcoat: 1,
    clearcoatRoughness: 0.1,
    reflectivity: 0.7,
    transmission: 0
  } );

  const crossGeometry1 = new THREE.BoxGeometry(0.2, 0.7, 0.1)
  const crossGeometry2 = new THREE.BoxGeometry(0.5, 0.2, 0.1)
  crossGeometry1.translate(0, 4.3, 0)
  crossGeometry2.translate(0, 4.3, 0)
  crossGeometry1.scale(scale, scale, scale)
  crossGeometry2.scale(scale, scale, scale)
  const crossMesh1 = new THREE.Mesh(crossGeometry1, material)
  const crossMesh2 = new THREE.Mesh(crossGeometry2, material)
  crossMesh1.translateX(movX)
  crossMesh1.translateZ(movZ)
  crossMesh2.translateX(movX)
  crossMesh2.translateZ(movZ)


  const lathe = new THREE.Mesh( geometry, material );
  lathe.scale.set(scale, scale, scale)
  lathe.translateX(movX)
  lathe.translateZ(movZ)


  const kingGroup = new THREE.Group()
  kingGroup.add(crossMesh1)
  kingGroup.add(crossMesh2)
  kingGroup.add(lathe)
  rotatables.add(kingGroup) 
}

function rook(scale, input_color, movX, movZ) {

  const loader = new OBJLoader();

  const rookMaterial = new THREE.MeshPhysicalMaterial( {
    color: input_color,
    metalness: 0.3,
    roughness: 0.8,
    clearcoat: 1,
    clearcoatRoughness: 0.1,
    reflectivity: 0.7,
    transmission: 0
  });

  loader.load(
    'rook.obj',
    function ( object ) {
      object.children[0].material = rookMaterial
      object.children[0].translateX(movX)
      object.children[0].translateZ(movZ)
      object.children[0].geometry.scale(scale, scale, scale)
      rotatables.add(object.children[0])
    }
  );
  

}

function spawnBoard(scale) {

  const whiteMaterial = new THREE.MeshPhysicalMaterial( {
    color: 0xffffff,
    metalness: 0,
    roughness: 0.9,
    clearcoat: 0.7,
    clearcoatRoughness: 0.8,
    reflectivity: 0.15,
    transmission: 0
  } );

  const blackMaterial = new THREE.MeshPhysicalMaterial( {
    color: 0x2d1a0a,
    metalness: 0,
    roughness: 0.9,
    clearcoat: 0.7,
    clearcoatRoughness: 0.8,
    reflectivity: 0.15,
    transmission: 0
  } );

  const unit = scale/8
  for (let i = 0; i < 8; i++) {
    for (let j = 0; j < 8; j++) {
      if ((i+j) % 2 == 0) {
        generateSquare(unit, unit*i-scale/2+unit/2, -scale*0.020, unit*j-scale/2+unit/2, whiteMaterial)
      } else {
        generateSquare(unit, unit*i-scale/2+unit/2, -scale*0.020, unit*j-scale/2+unit/2, blackMaterial)
      }
    }
  }
}

function generateSquare(scale, posX, posY, posZ, material) {
  const squareGeometry = new THREE.BoxGeometry( scale, scale*0.3, scale );
  squareGeometry.translate(posX, posY, posZ)
  const squareMesh = new THREE.Mesh( squareGeometry, material );
  squareMesh.receiveShadow = true
  rotatables.add(squareMesh)
}

function spawnLights() {

  activeLights.forEach(function (light) {
    scene.remove(light)
  })
  activeLights = []

  spotLight = new THREE.SpotLight( 0x555555, parameters.lights.spotLightIntensity );
  spotLight.castShadow = true;
  spotLight.angle = parameters.lights.spotLightAngle;
  spotLight.penumbra = 1;
  spotLight.decay = 2;
  spotLight.distance = 50;
 
  spotLight.position.set(-sceneSize/2, sceneSize/4, -sceneSize/2);
  scene.add(spotLight);
  scene.add(spotLight.target)
  spotLight.target.position.set(
    parameters.lights.spotLightTargetX,
    parameters.lights.spotLightTargetY,
    parameters.lights.spotLightTargetZ
  )
  activeLights.push(spotLight)

  const ambientLight = new THREE.AmbientLight( 0x202020 );
  scene.add( ambientLight );
  activeLights.push(ambientLight)
}
