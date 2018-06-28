// node server start
// http-server -c-1


var container, stats, gui;
var camera, cameraTarget, scene, renderer,geometry, mesh,controls;

init();

animate();
function init() {
  //container = document.createElement( 'div' );
  container = document.getElementById( 'container' );
  document.body.appendChild( container );
  

  camera = new THREE.PerspectiveCamera(45, container.offsetWidth / container.offsetHeight, 0.01, 10000000);
  camera.position.x = 150;
  camera.position.y = 150;
  camera.position.z = 100;


    /**
   * Build GUI
   */
  function gui(stackHelper) {
      var stack = stackHelper.stack;
      gui = new dat.GUI({
          autoPlace: false,
      });
      var customContainer = document.getElementById('my-gui-container');
      customContainer.appendChild(gui.domElement);

      // stack
      var stackFolder = gui.addFolder('Stack');
      // index range depends on stackHelper orientation.
      var index = stackFolder
          .add(stackHelper, 'index', 0, stack.dimensionsIJK.z - 1)
          .step(1)
          .listen();
      var orientation = stackFolder
          .add(stackHelper, 'orientation', 0, 2)
          .step(1)
          .listen();
      orientation.onChange(function(value) {
          index.__max = stackHelper.orientationMaxIndex;
          // center index
          stackHelper.index = Math.floor(index.__max / 2);
      });
      visibleUpdate = stackFolder
          .add(stackHelper, 'visible', 0, 1)
          .listen();
      visibleUpdate.onChange(function(value) {
          window.console.log('oops... something went wrong...');        
      
      });
      stackFolder.open();
      // slice
      var sliceFolder = gui.addFolder('Slice');
      sliceFolder
          .add(stackHelper.slice, 'windowWidth', 1, stack.minMax[1] - stack.minMax[0])
          .step(1)
          .listen();
      sliceFolder
          .add(stackHelper.slice, 'windowCenter', stack.minMax[0], stack.minMax[1])
          .step(1)
          .listen();
      sliceFolder.add(stackHelper.slice, 'intensityAuto').listen();
      sliceFolder.add(stackHelper.slice, 'invert');
      sliceFolder.open();

      // bbox
      var bboxFolder = gui.addFolder('Bounding Box');
      bboxFolder.add(stackHelper.bbox, 'visible');
      bboxFolder.addColor(stackHelper.bbox, 'color');
      bboxFolder.open();

      // border
      var borderFolder = gui.addFolder('Border');
      borderFolder.add(stackHelper.border, 'visible');
      borderFolder.addColor(stackHelper.border, 'color');
      borderFolder.open();

      // layer mix folder
      var layerMixFolder = gui.addFolder('Material');
      //var opacityLayerMix1 = layerMixFolder.add(stackHelper, 'opacity', 0, 1).step(0.01);
  }

  scene = new THREE.Scene();
  scene.background = new THREE.Color( 0x000000 );
  
  // Setup controls
  controls = new AMI.TrackballControl(camera, container);
  var visibleUpdate;

  var r=255;
  var colors2;
  // PLY file
  var loader = new THREE.PLYLoader();
  loader.load('/NY/NYmeshWithNormalsASC.ply', function(Geometry) {
      // var material = new THREE.MeshLambertMaterial({
      //     color: 0xffffff,
      //     vertexColors: THREE.FaceColors,//geometry
      //     //flatShading: true
      //     //vertexColors : THREE.NoColors
      //     //wireframe: true
      //   });

      var material = new THREE.MeshPhongMaterial({
        color: 0xff0000, 

        vertexColors: THREE.FaceColors,
        specular: 0x555555, 
        shininess: 300, 
        transparent : true, 
        opacity: 1, 
        precision: "highp" ,
        wireframe : true,
        flatShading: false
    });
      
      //creo la maya geometria vs material
      mesh = new THREE.Mesh(Geometry, material);
      colors2 = new Float32Array(Geometry.attributes.position.count*3);

      for ( var i = 2; i < Geometry.attributes.position.count*3; i ++ ) {
        var x = Math.random() * r - r / 2;
        var y = Math.random() * r - r / 2;
        var z = Math.random() * r - r / 2;
        var faceColor = Math.random();
        colors2[ i * 3 ] = ( x / r ) + 0.5;
        colors2[ i * 3 + 1 ] = ( y / r ) + 0.5;
        colors2[ i * 3 + 2 ] = ( z / r ) + 0.5;
      }
      Geometry.addAttribute( "color", new THREE.BufferAttribute( colors2, 3 ) );
      Geometry.colorsNeedUpdate= true;
      // to LPS space
      var RASToLPS = new THREE.Matrix4();
      RASToLPS.set(-1, 0, 0, 0, 0, -1, 0, 0, 0, 0, 1, 0, 0, 0, 0, 1);
      mesh.applyMatrix(RASToLPS);
      mesh.castShadow = true;
      mesh.receiveShadow = true;
      scene.add(mesh);
      geometry = Geometry;

  });



// Setup loader
  var loader = new AMI.VolumeLoader(container);
  var files='/NY/bone.nii';
  loader
  .load(files)
  .then(function() {
      // merge files into clean series/stack/frame structure
      var series = loader.data[0].mergeSeries(loader.data);
      var stack = series[0].stack[0];
      loader.free();
      loader = null;

      // be carefull that series and target stack exist!
      var stackHelper = new AMI.StackHelper(stack);
      stackHelper.bbox.color = 0x8bc34a;
      stackHelper.border.color = 0xf44336;

      scene.add(stackHelper);
      // build the gui
      gui(stackHelper);

      // center camera and interactor to center of bouding box
      // for nicer experience
      var centerLPS = stackHelper.stack.worldCenter();
      camera.lookAt(centerLPS.x, centerLPS.y, centerLPS.z);
      camera.updateProjectionMatrix();
      controls.target.set(centerLPS.x, centerLPS.y, centerLPS.z);
  })
  .catch(function(error) {
      window.console.log('oops... something went wrong...');
      window.console.log(error);
  });
  // Lights
  scene.add( new THREE.HemisphereLight( 0x443333, 0x111122 ) );
  addShadowedLight( 1, 1, 1, 0xffffff, 1.35 );
  addShadowedLight( 0.5, 1, -1, 0xffaa00, 1 );
  // renderer
  renderer = new THREE.WebGLRenderer( { antialias: true } );
  renderer.setPixelRatio( window.devicePixelRatio );
  renderer.setSize(container.offsetWidth, container.offsetHeight);
  renderer.gammaInput = true;
  renderer.gammaOutput = true;
  renderer.shadowMap.enabled = true;
  container.appendChild( renderer.domElement );
  // stats
  stats = new Stats();
  container.appendChild( stats.dom );
  // resize
  window.addEventListener( 'resize', onWindowResize, false );
}

function addShadowedLight( x, y, z, color, intensity ) {
  var directionalLight = new THREE.DirectionalLight( color, intensity );
  directionalLight.position.set( x, y, z );
  scene.add( directionalLight );
  directionalLight.castShadow = true;
  var d = 1;
  directionalLight.shadow.camera.left = -d;
  directionalLight.shadow.camera.right = d;
  directionalLight.shadow.camera.top = d;
  directionalLight.shadow.camera.bottom = -d;
  directionalLight.shadow.camera.near = 1;
  directionalLight.shadow.camera.far = 4;
  directionalLight.shadow.mapSize.width = 1024;
  directionalLight.shadow.mapSize.height = 1024;
  directionalLight.shadow.bias = -0.001;
}

function onWindowResize() {
    camera.aspect = container.offsetWidth / container.offsetHeight;
    camera.updateProjectionMatrix();
    renderer.setSize(container.offsetWidth, container.offsetHeight);
}

function animate() {
  requestAnimationFrame( animate );
  render();
  stats.update();
}

function render() {
  var timer = Date.now() * 0.0005;
  

  // if(geometry){
    mesh.rotation.z += 0.01;
  //   geometry.colorsNeedUpdate= true;
  //    window.console.log('Ready to rock!!');
  // }
  controls.update();
  renderer.render( scene, camera );
}
