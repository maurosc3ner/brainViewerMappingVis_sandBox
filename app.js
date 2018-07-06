// node server start
// http-server -c-1


var container, stats, gui;
var camera, cameraTarget, scene, renderer,geometry, mesh,controls, regularGeometry, colorArray;

init();

animate();
function init() {
  //container = document.createElement( 'div' );
  container = document.getElementById( 'container' );
  document.body.appendChild( container );
  
  $.getJSON("./js/colorJson.json", function (data) {
    $.each(data, function (index, value) {
       //console.log(value[1]);
       colorArray = value;

        });
    });

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

  // PLY file
  var loader = new THREE.PLYLoader();
  loader.load('/NY/NYmeshWithNormalsASC.ply', function(Geometry) {

    //   var material = new THREE.MeshPhongMaterial({

    //     color: new THREE.Color( 0.4, 0.4, 1.0),

    //     vertexColors: THREE.FaceColors,
    //     specular: new THREE.Color( 0.1, 0.1, 0.1 ),
    //     emissive: new THREE.Color( 0, 0, 0 ),
    //     shininess: 200, 
    //     transparent : true, 
    //     //opacity: 1, 
    //     precision: "highp" ,
    //     wireframe : false,
    //     flatShading: false
    // });

      // var material = new THREE.MeshLambertMaterial({
      //   color: new THREE.Color( 0.4, 0.4, 1.0),
      //   vertexColors: THREE.FaceColors,
      //   emissive: new THREE.Color( 0, 0, 0 ),
      //   transparent : true, 
      //   //opacity: 1, 
      //   precision: "highp" ,
      //   wireframe : false,
      //   flatShading: false
      // });

       var material = new THREE.MeshLambertMaterial({
        color: new THREE.Color( 1.0, 1.0, 1.0),
        vertexColors: THREE.VertexColors,
        emissive: new THREE.Color( 0, 0, 0 ),
        transparent : true, 
        //opacity: 1, 
        precision: "highp" ,
        wireframe : false,
        flatShading: false
      });
      regularGeometry = new THREE.Geometry().fromBufferGeometry( Geometry );
      //creo la maya geometria vs material
      
      // mesh = new THREE.Mesh(regularGeometry, material);
      // actualizacion de colores de un geometry
      // window.console.log(regularGeometry);
      // var varianza = 1000;
      // var med = 2500;
      // // faces are indexed using characters
      // var faceIndices = [ 'a', 'b', 'c', 'd' ];
      
      // var color, f, p, vertexIndex;
      // for ( var i = 0; i < regularGeometry.faces.length; i ++ ) {
      //   f  = regularGeometry.faces[ i ];
      //   var red = 0.0;
      //   var green = 0.0;
      //   var blue = 1200*(1/(varianza*Math.sqrt(2*3.141592))) * Math.exp(-0.5*Math.pow((i-med)/varianza, 2.0));
      //   for ( var j = 0; j < 3; j ++ ) {
      //     vertexIndex = f[ faceIndices[ j ] ];
      //     p = regularGeometry.vertices[ vertexIndex ];

      //     color = new THREE.Color( 0xffffff );
      //     color.setRGB(red,green,blue);
      //     f.vertexColors[ j ] = color;
      //   }
      // }
      // regularGeometry.colorsNeedUpdate= true;

      //modo 2: actualizacion de colores de un buffer
      // mesh = new THREE.Mesh(Geometry, material);
      // colors2 = new Float32Array(Geometry.attributes.position.count*3);
      // var varianza = 1000;
      // var med = 2500;
      // //window.console.log(Geometry.attributes.position.count);
      // for ( var i = 0; i < 5000; i ++ ) {
      //   var x = 0;
      //   var y = 0;
      //   var z = 1200*(1/(varianza*Math.sqrt(2*3.141592))) * Math.exp(-0.5*Math.pow((i-med)/varianza, 2.0));
      //   colors2[ i * 3 ] = ( x / r )  ;
      //   colors2[ i * 3 + 1 ] = ( y / r ) ;
      //   colors2[ i * 3 + 2 ] = z;//+.05;
      //   //window.console.log( z);
      // }

      // for ( var i = 5000; i < 10016; i ++ ) {
      //   colors2[ i * 3 ] = 1.0 ;
      //   colors2[ i * 3 + 1 ] = 1.0;
      //   colors2[ i * 3 + 2 ] = 1.0;
      // }
      // Geometry.addAttribute( "color", new THREE.BufferAttribute( colors2, 3 ) );
      // Geometry.colorsNeedUpdate= true;
      
      //modo 2b: actualizacion de colores de un buffer desde archivo 
      // Funcional!
      mesh = new THREE.Mesh(Geometry, material);
      var colors2;
      colors2 = new Float32Array(Geometry.attributes.position.count*3);
      
      window.console.log(colors2.length);
      for ( var i = 0; i < colorArray.length; i ++ ) {
        
        colors2[ i * 3 ] = colorArray[i].r;
        colors2[ i * 3 + 1 ] = colorArray[i].g;
        colors2[ i * 3 + 2 ] = colorArray[i].b;
        if (i == 8)
          window.console.log("r:"+colorArray[i].r + " g:"+colorArray[i].g+"b:"+colorArray[i].b);
      }
      Geometry.addAttribute( "color", new THREE.BufferAttribute( colors2, 3 ) );
      Geometry.colorsNeedUpdate= true;

      //modo 3: actualizacion de colores de un geometry
      // mesh = new THREE.Mesh(regularGeometry, material);
      // window.console.log(regularGeometry);
      // var varianza = 1000;
      // var med = 2500;
      // // faces are indexed using characters
      // var faceIndices = [ 'a', 'b', 'c', 'd' ];
      // var redColor= new THREE.Color( 1.0, 0.0, 0.0);
      // var greenColor= new THREE.Color( 0.0, 1.0, 0.0);
      // var blueColor= new THREE.Color( 0.0, 0.0, 1.0);

      // var pa = 1000;
      // var pb = 5000;
      // var pc = 9000;
      // var afz = 1000;
      // var color, f, p, vertexIndex;
      // for ( var i = 0; i < regularGeometry.faces.length; i ++ ) {
      //   if(i>pa-afz && i<pa+afz ){
      //     f  = regularGeometry.faces[ i ];
      //     for ( var j = 0; j < 3; j ++ ) {
      //       vertexIndex = f[ faceIndices[ j ] ];
      //       p = regularGeometry.vertices[ vertexIndex ];
      //       f.vertexColors[ j ] = redColor;
      //     }
      //   }
      //   if(i>pb-afz && i<pb+afz ){
      //     f  = regularGeometry.faces[ i ];
      //     for ( var j = 0; j < 3; j ++ ) {
      //       vertexIndex = f[ faceIndices[ j ] ];
      //       p = regularGeometry.vertices[ vertexIndex ];
      //       f.vertexColors[ j ] = greenColor;
      //     }
      //   }

      //   if(i>pc-afz && i<pc+afz ){
      //     f  = regularGeometry.faces[ i ];
      //     for ( var j = 0; j < 3; j ++ ) {
      //       vertexIndex = f[ faceIndices[ j ] ];
      //       p = regularGeometry.vertices[ vertexIndex ];
      //       f.vertexColors[ j ] = blueColor;
      //     }
      //   }
        
      // }
      // regularGeometry.colorsNeedUpdate= true;

      /// modo 4: actualizacion de colores de un geometry
      // mesh = new THREE.Mesh(regularGeometry, material);
      // window.console.log(regularGeometry);
      // var varianza = 1000;
      // var med = 2500;
      // // faces are indexed using characters
      // var faceIndices = [ 'a', 'b', 'c', 'd' ];
      // var redColor= new THREE.Color( 1.0, 0.0, 0.0);
      // var greenColor= new THREE.Color( 0.0, 1.0, 0.0);
      // var blueColor= new THREE.Color( 0.0, 0.0, 1.0);

      // var pa = 1000;
      // var pb = 5000;
      // var pc = 9000;
      // var afz = 1000;
      // var color, f, p, vertexIndex;
      // for ( var i = 0; i < regularGeometry.faces.length; i ++ ) {
        
      //   f  = regularGeometry.faces[ i ];
      //   for ( var j = 0; j < 3; j ++ ) {
      //     vertexIndex = f[ faceIndices[ j ] ];
      //     p = regularGeometry.vertices[ vertexIndex ];
      //     if (j==0)
      //       f.vertexColors[ j ] = redColor;
      //     if (j==1)
      //       f.vertexColors[ j ] = greenColor;
      //     if (j==2)
      //       f.vertexColors[ j ] = blueColor;
      //   }
      // }
      // window.console.log(regularGeometry.faces.length);
      // regularGeometry.colorsNeedUpdate= true;

      //modo 5: actualizacion desde archivo no funciona!!!
      // mesh = new THREE.Mesh(regularGeometry, material);
      // window.console.log(regularGeometry);
      // // faces are indexed using characters
      // var faceIndices = [ 'a', 'b', 'c', 'd' ];
      // var color, f, p, vertexIndex;
      // // 1. first, assign colors to vertices as desired
      // for ( var i = 1; i < regularGeometry.vertices.length; i++ ) 
      // {
      //   color = new THREE.Color( 0xffffff );
      //   color.setRGB(colorArray[i].r,colorArray[i].g,colorArray[i].b);
      //   regularGeometry.colors[i] = color; // use this array for convenience
      // }
      // // 2. copy the colors to corresponding positions 
      // //     in each face's vertexColors array.
      // for ( var i = 0; i < regularGeometry.faces.length; i++ ) 
      // {
      //   face = regularGeometry.faces[ i ];
      //   numberOfSides = ( face instanceof THREE.Face3 ) ? 3 : 4;
      //   for( var j = 0; j < 3; j++ ) 
      //   {
      //     vertexIndex = face[ faceIndices[ j ] ];
      //     face.vertexColors[ j ] = regularGeometry.colors[ vertexIndex ];
      //   }
      // }
      // regularGeometry.colorsNeedUpdate= true;

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
  
  //addShadowedLight( 1, 1, 1, 0xffffff, 1.35 );
  
  addShadowedLight( 0.5, 1, -1,new THREE.Color( 0.5, 0.5, 0.5), 1.35 );
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
  // var directionalLight = new THREE.AmbientLight( color,intensity );
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
    //mesh.rotation.z += 0.01;
  //   geometry.colorsNeedUpdate= true;
  //    window.console.log('Ready to rock!!');
  // }
  controls.update();
  renderer.render( scene, camera );
}
