const randnum = (min, max) => Math.round(Math.random() * (max - min) + min);

//=========================================================================================== scene
var scene = new THREE.Scene();

//=========================================================================================== camera
var camera = new THREE.PerspectiveCamera(45, window.innerWidth / window.innerHeight, 1, 10000);


//=========================================================================================== canvas
renderer = new THREE.WebGLRenderer({
    alpha: true,
    antialias: true
});
renderer.setSize(window.innerWidth, window.innerHeight);
renderer.shadowMapEnabled = true; //Shadow
renderer.shadowMapSoft = true; // Shadow
renderer.shadowMapType = THREE.PCFShadowMap; //Shadow
document.body.appendChild(renderer.domElement);

//=========================================================================================== add VR
renderer.setPixelRatio(window.devicePixelRatio); //VR
var effect = new THREE.StereoEffect(renderer); //VR
effect.setSize(window.innerWidth, window.innerHeight); //VR
var VR = false;

function toggleVR() {
    if (VR) {
        VR = false;
        camera.rotation.reorder('ZYX');
        camera.lookAt(0, 0, 0);
    } else {
        VR = true;
        controls = new THREE.DeviceOrientationControls(camera);
        requestFullscreen(document.documentElement);
    }
    renderer.setSize(window.innerWidth, window.innerHeight);
}



//=========================================================================================== post processing
/* var renderScene = new THREE.RenderPass(scene, camera);

  var effectFXAA = new THREE.ShaderPass(THREE.FXAAShader);
  effectFXAA.uniforms['resolution'].value.set(1 / window.innerWidth, 1 / window.innerHeight );

  var copyShader = new THREE.ShaderPass(THREE.CopyShader);
  copyShader.renderToScreen = true;
  

  //var bloomStrength = 2;
  //var bloomRadius = 5;
  //var bloomThreshold = 0.4;
  var bloomStrength = 1;
  var bloomRadius = 0;
  var bloomThreshold = .5;
  var bloomPass = new THREE.UnrealBloomPass(new THREE.Vector2(window.innerWidth, window.innerHeight),bloomStrength, bloomRadius, bloomThreshold);
  
  var composer = new THREE.EffectComposer(renderer);
  composer.setSize(window.innerWidth, window.innerHeight);
  composer.addPass(renderScene);
  composer.addPass(effectFXAA);
  composer.addPass(bloomPass);
  composer.addPass(copyShader);
*/
//=========================================================================================== resize
window.addEventListener("resize", function() {
    let width = window.innerWidth;
    let height = window.innerHeight;
    renderer.setSize(width, height);
    camera.aspect = width / height;
    camera.updateProjectionMatrix();
});


//=========================================================================================== fog
scene.fog = new THREE.FogExp2(new THREE.Color("black"), 0.035);

//=========================================================================================== light
var sphereLight = new THREE.SphereGeometry(.05);
var sphereLightMaterial = new THREE.MeshBasicMaterial({
    color: new THREE.Color("white")
});
var sphereLightMesh = new THREE.Mesh(sphereLight, sphereLightMaterial);
sphereLightMesh.castShadow = true;
sphereLightMesh.position.set(0, 2.5, 0)
    //scene.add(sphereLightMesh);


var distance = 150;
var intensity = 1;


var pointLight = new THREE.PointLight(new THREE.Color('white'), intensity, distance);
pointLight.position.set(0, 5, -6);
scene.add(pointLight);


var pointLight3 = new THREE.PointLight(new THREE.Color('blue'), intensity / 1.25, distance);
pointLight3.position.set(0, 0, 0);
scene.add(pointLight3);





var spotLight = new THREE.SpotLight(0xffffff, 0, distance);
spotLight.position.set(0, 10, 0);

spotLight.castShadow = true;
scene.add(spotLight);



//=========================================================================================== floor
/*var groundMaterial = new THREE.MeshPhongMaterial({
  color: new THREE.Color('#fff'),
  specular: new THREE.Color('skyblue'),
  shininess: 50,
});
var groundGeo = new THREE.PlaneGeometry(200, 200);
var ground = new THREE.Mesh(groundGeo, groundMaterial);

ground.position.set(0, 0, 0);
ground.rotation.x = (-Math.PI / 2);
ground.receiveShadow = true;
scene.add(ground);
*/



//=========================================================================================== model
//3d
loader = new THREE.LegacyJSONLoader();
loader.load('/uploads/1911/hoop-goal.js', function(geometry, materials) {
    var wall = new THREE.Mesh(geometry, materials);
    wall.position.set(0, 0, 0);
    wall.rotateY(Math.PI);
    wall.scale.set(4, 4, 4);
    wall.castShadow = true;
    scene.add(wall);

});


//===================================================== add model
var loader = new THREE.LegacyJSONLoader();
loader.load("/uploads/1911/court.js", function(geometry, materials) {
    var obj = new THREE.Mesh(geometry, materials);
    obj.scale.set(1, 1, 1);
    obj.receiveShadow = true;
    obj.position.set(0, .2, -40);
    /*  obj.rotateY(-Math.PI);*/
    scene.add(obj);

});




//===================================================== add group
var lightGroup = new THREE.Group();
lightGroup.position.set(-25, 0, -40);
scene.add(lightGroup);

lightGroup2 = lightGroup.clone();
lightGroup2.position.set(25, 0, 0);
lightGroup2.rotateY(Math.PI);
scene.add(lightGroup2);



lightGroup3 = lightGroup.clone();
lightGroup3.position.set(-15, 0, 8);
scene.add(lightGroup3);



//===================================================== add model
var loader = new THREE.LegacyJSONLoader();
loader.load("/uploads/1911/bleachers.js", function(geometry, materials) {

    new Array(5).fill(null).map((d, i) => {
        var obj = new THREE.Mesh(geometry, materials);
        obj.scale.set(.5, .5, .5);
        obj.castShadow = true;
        obj.position.set(0, 0, i * 10);
        /*obj.rotateY(Math.PI);*/
        lightGroup.add(obj);
    });



    new Array(5).fill(null).map((d, i) => {
        var obj = new THREE.Mesh(geometry, materials);
        obj.scale.set(.5, .5, .5);
        obj.castShadow = true;
        obj.position.set(0, 0, i * 10);
        /*    obj.rotateY(-Math.PI);*/
        lightGroup2.add(obj);
    });



    new Array(4).fill(null).map((d, i) => {
        var obj = new THREE.Mesh(geometry, materials);
        obj.scale.set(.5, .5, .5);
        obj.castShadow = true;
        obj.position.set(i * 10, 0, 0);
        obj.rotateY(Math.PI / 2);
        lightGroup3.add(obj);
    });



});



//===================================================== add model
var loader = new THREE.LegacyJSONLoader();
loader.load("/uploads/1911/gym-ceiling.js", function(geometry, materials) {


    var matt = new THREE.MeshPhongMaterial({
        color: new THREE.Color('gray'),
        side: THREE.DoubleSide
    });

    var obj = new THREE.Mesh(geometry, matt);
    obj.scale.set(5, 5, 5);
    obj.castShadow = true;
    obj.position.set(0, 10, 0);
    obj.rotateY(Math.PI / 2);
    scene.add(obj);

});





//===================================================== shapes
var buffgeoSphere = new THREE.BufferGeometry();
buffgeoSphere.fromGeometry(new THREE.SphereGeometry(1, 20, 10));

var buffgeoBox = new THREE.BufferGeometry();
buffgeoBox.fromGeometry(new THREE.BoxGeometry(1, 1, 1));

var matSphere = new THREE.MeshPhongMaterial({
    color: new THREE.Color('blue'),
    side: THREE.DoubleSide
});
var matBox = new THREE.MeshPhongMaterial({
    color: new THREE.Color('white'),
    side: THREE.DoubleSide,
    transparent: true,
    opacity: 0
});
var matHit = new THREE.MeshPhongMaterial({
    color: new THREE.Color('red'),
    side: THREE.DoubleSide,
    transparent: true,
    opacity: .25
});



//===================================================== physics
world = new OIMO.World({
    info: true,
    worldscale: 10,
    gravity: [0, -9.8, 0]
});
meshs = [];
bodys = [];


//add ground
var ground = world.add({
    size: [100, 40, 100],
    pos: [0, -20, 0]
});
var cube = new THREE.Mesh(new THREE.BoxGeometry(100, 40, 100), new THREE.MeshBasicMaterial({
    color: new THREE.Color('teal'),
    side: THREE.DoubleSide
}));
cube.position.set(0, -20, 0);
cube.castShadow = true;
cube.receiveShadow = true;
//scene.add( cube );




var body = world.add({
    size: [3, 2, 1],
    pos: [0, 5.5, -2.5],
    rot: [0, 0, 0],
    move: false,
    noSleep: true,
    name: 'box'
});
var mesh = new THREE.Mesh(buffgeoBox, matBox);
mesh.scale.set(3, 2, 1);
mesh.position.set(0, 5.5, -2.5);
bodys.push(body);
meshs.push(mesh);
scene.add(mesh);


var body = world.add({
    size: [.05, .05, .05],
    pos: [0, 4.5, -4],
    rot: [0, 0, 0],
    move: false,
    noSleep: false,
    name: 'collision'
});
var collision = new THREE.Mesh(buffgeoBox, matHit);
collision.scale.set(.05, .05, .05);
collision.position.set(0, 4.5, -4);
bodys.push(body);
meshs.push(collision);
scene.add(collision);









//===================================================== Circle Curve
let segmentCount = 20;
let radius = .4;
let c = new THREE.Geometry();
let xyzArray = new Array(segmentCount)
    .fill(null)
    .map(
        (d, i) =>
        new THREE.Vector3(
            Math.cos(i / segmentCount * Math.PI * 2) * radius,
            0,
            Math.sin(i / segmentCount * Math.PI * 2) * radius
        )
    );
let curve = new THREE.CatmullRomCurve3(xyzArray);
curve.closed = true;
let g = new THREE.Geometry();
g.vertices = curve.getPoints(segmentCount); //how many corners do you want the shape to have
let m = new THREE.LineBasicMaterial({
    color: new THREE.Color("red")
});
let curveObject = new THREE.Line(g, m);
//scene.add(curveObject);




//===================================================== add boxes on the curve points
for (var i = 0; i < curve.points.length; i++) {

    var x = curve.points[i].x
    var y = curve.points[i].y;
    var z = curve.points[i].z;

    //create box. then add to array. move = false will hold it's place
    var body = world.add({
        size: [.25, .025, .25],
        pos: [x, y + 5, z - 4],
        rot: [0, 0, 0],
        move: false,
        noSleep: true,
        name: 'box'
    });
    var mesh = new THREE.Mesh(buffgeoBox, matBox);
    mesh.scale.set(.25, .025, .25);
    bodys.push(body);
    meshs.push(mesh);
    scene.add(mesh);
}





/*    var body = world.add({size:[50, 15, 1], pos:[0,0,15], rot:[0,0,0], move:false, noSleep:true, name:'box' });
    var mesh = new THREE.Mesh( buffgeoBox, matBox );
    mesh.scale.set(50, 15, 1 );
    mesh.position.set(0, 0, 15 );
    mesh.castShadow = true;
    mesh.receiveShadow = true;
    bodys.push(body);
    meshs.push(mesh);
    scene.add( mesh );*/




//===================================================== update physics
function updateOimoPhysics() {
    if (world == null) return;
    world.step();

    var i = bodys.length;
    var x = -150;
    var z = -100 + Math.random() * 200;
    var y = 0;

    while (i--) {
        var body = bodys[i];
        var mesh = meshs[i];

        //links three.js meshes with oimi shapes
        mesh.position.copy(body.getPosition());
        mesh.quaternion.copy(body.getQuaternion());




        // reset oimi shapes position.
        if (mesh.position.y < 0) {
            //body.name == "box" ? body.resetPosition(x,y,z) : body.resetPosition(camera.position.x + 25, camera.position.y+5, camera.position.z);
            if (body.name == "box") {
                body.resetPosition(x, y, z)
            } else {
                world.removeRigidBody(body);
                scene.remove(mesh);



            }

        }

    }

    // contact test
    if (world.checkContact('collision', 'sphere')) {
        //meshs[bodys.length-1].material = matHit;
        count += 1;
        document.querySelector('small').innerHTML = count;
    }
}





//===================================================== shoot
var shootDirection = new THREE.Vector3();
var projector = new THREE.Projector();
var shootVelo = 5.75;
var canShoot = 0;

function getShootDir(targetVec) {
    var vector = targetVec;
    targetVec.set(0, 0, 1);
    vector.unproject(camera);
    var ray = new THREE.Ray(mesh.position, vector.sub(mesh.position).normalize());
    targetVec.copy(ray.direction);
}

function shoot() {
    //create sphere
    var body = world.add({
        type: 'sphere',
        size: [.2],
        pos: [camera.position.x, camera.position.y + 0.3, camera.position.z],
        move: true,
        name: 'sphere'
    });
    var mesh = bball.clone();
    mesh.scale.set(.2, .2, .2);



    bodys.push(body);
    meshs.push(mesh);
    scene.add(mesh);

    var x = mesh.position.x;
    var y = mesh.position.y;
    var z = mesh.position.z;

    getShootDir(shootDirection);
    body.linearVelocity.x = shootDirection.x * shootVelo;
    body.linearVelocity.y = shootDirection.y * shootVelo + 3.25;
    body.linearVelocity.z = shootDirection.z * shootVelo;
    body.angularVelocity.x = -Math.PI * 2;

    x += shootDirection.x;
    y += shootDirection.y;
    z += shootDirection.z;
    mesh.position.set(x, y, z);
}



document.body.addEventListener('click', function() {
    if (canShoot <= 0) {
        canShoot = 10;
        shoot();
    }
});



//===================================================== add model
var bball = new THREE.Group();
bball.position.z = -5;
//scene.add(bball);

var loader = new THREE.LegacyJSONLoader();
loader.load("/uploads/1911/basketball.js", function(geometry, materials) {
    var obj = new THREE.Mesh(geometry, materials);
    obj.scale.set(.35, .35, .35);
    obj.castShadow = true;
    obj.position.set(0, 0, 0);
    obj.geometry.center();
    obj.rotateY(Math.PI / 2);
    bball.add(obj);
});



//=========================================================================================== full screen
var requestFullscreen = function(ele) {
    if (ele.requestFullscreen) {
        ele.requestFullscreen();
    } else if (ele.webkitRequestFullscreen) {
        ele.webkitRequestFullscreen();
    } else if (ele.mozRequestFullScreen) {
        ele.mozRequestFullScreen();
    } else if (ele.msRequestFullscreen) {
        ele.msRequestFullscreen();
    } else {
        console.log('Fullscreen API is not supported.');
    }
}
var exitFullscreen = function(ele) {
    if (ele.exitFullscreen) {
        ele.exitFullscreen();
    } else if (ele.webkitExitFullscreen) {
        ele.webkitExitFullscreen();
    } else if (ele.mozCancelFullScreen) {
        ele.mozCancelFullScreen();
    } else if (ele.msExitFullscreen) {
        ele.msExitFullscreen();
    } else {
        console.log('Fullscreen API is not supported.');
    }
}


//=========================================================================================== add tweening
//https://greensock.com/forums/topic/16993-threejs-properties/
Object.defineProperties(THREE.Object3D.prototype, {
    x: {
        get: function() {
            return this.position.x;
        },
        set: function(v) {
            this.position.x = v;
        }
    },
    y: {
        get: function() {
            return this.position.y;
        },
        set: function(v) {
            this.position.y = v;
        }
    },
    z: {
        get: function() {
            return this.position.z;
        },
        set: function(v) {
            this.position.z = v;
        }
    },
    rotationZ: {
        get: function() {
            return this.rotation.x;
        },
        set: function(v) {
            this.rotation.x = v;
        }
    },
    rotationY: {
        get: function() {
            return this.rotation.y;
        },
        set: function(v) {
            this.rotation.y = v;
        }
    },
    rotationX: {
        get: function() {
            return this.rotation.z;
        },
        set: function(v) {
            this.rotation.z = v;
        }
    }
});





//=========================================================================================== add Animation
let angle = 0,
    lastTime = null,
    u_frame = 0,
    clock = new THREE.Clock(),
    count = 0,
    prevTime = Date.now(),
    phase = 0;


function moveLights() {
    phase += 0.05;
    sphereLightMesh.position.z = 10 + (Math.cos(phase) * 10);
    sphereLightMesh.position.x = 10 + (Math.sin(phase) * 10);
    pointLight3.position.copy(sphereLightMesh.position);

}




//===================================================== mouse
var mouseX = 0;
var mouseY = 0;
var zoomIn = 200;
document.addEventListener('mousemove', onDocumentMouseMove, false);

function onDocumentMouseMove(event) {
    mouseX = (event.clientX - window.innerWidth / 2) / zoomIn;
    mouseY = (event.clientY - window.innerHeight / 2) / zoomIn;
}


(function animate() {
    updateOimoPhysics();
    //reset back to 0 to limit the number of bullets to shoot
    if (canShoot > 0) canShoot -= 1;



    //update models
    const delta = clock.getDelta();
    moveLights();






    //VR Mode
    if (VR) {
        effect.render(scene, camera);
        controls.update();
        document.querySelector('.btn-group').classList.add('hide');
    } else {
        renderer.render(scene, camera);
        //composer.render();
        camera.position.x += (mouseX - camera.position.x) * .05;
        camera.lookAt(scene.position);
        document.querySelector('.btn-group').classList.remove('hide');
    }

    requestAnimationFrame(animate);

})();



//set camera position
camera.position.y = 1.5;
camera.position.z = -25;
camera.position.x = 25;
