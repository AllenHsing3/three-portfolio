import "./style.css";
import * as THREE from "three";
import { GLTFLoader } from "three/examples/jsm/loaders/GLTFLoader.js";
import { gsap } from "gsap";
import {
  DirectionalLight,
  DoubleSide,
  PlaneBufferGeometry,
  Raycaster,
  Vector2,
  Vector3,
} from "three";
import { RenderPass } from "three/examples/jsm/postprocessing/RenderPass.js";
import { EffectComposer } from "three/examples/jsm/postprocessing/EffectComposer.js";
import { GlitchPass } from "three/examples/jsm/postprocessing/GlitchPass.js";
import { RectAreaLightHelper } from "three/examples/jsm/helpers/RectAreaLightHelper.js";
import { RectAreaLightUniformsLib } from "three/examples/jsm/lights/RectAreaLightUniformsLib.js";

const cSound = new Audio("/audio/c.mp3");
const eSound = new Audio("/audio/e.mp3");
const gSound = new Audio("/audio/g.mp3");
/**
 * Params
 */

const params = {
  shadows: true,
  exposure: 0.68,
  bulbPower: 800,
  hemiIrradiance: 0.001,
};
/**
 * Loaders and setup
 */

// Only display html if scene is ready
const startButton = document.getElementById("start-btn");
const helperText = document.getElementById('helper')

const startPage = () => {
  window.setTimeout(() => {
    // Animate overlay
    gsap.to(overlayMaterial.uniforms.uAlpha, {
      duration: 3,
      value: 0,
      delay: 1,
    });
  }, 500);
  window.setTimeout(() => {
    sceneIsReady = true;
    helperText.classList.add('visible')
}, 2000);
  startButton.remove()
  canvas.classList.add("no-cursor");

  window.setTimeout(() => {
    helperText.classList.remove('visible')
}, 8000);
};
let sceneIsReady = false;
startButton.addEventListener("click", startPage);
const loadingBarElement = document.querySelector(".loading-bar");
const loadingManager = new THREE.LoadingManager(
  // Loaded
  () => {
    startButton.classList.add("visible");
    // Update loadingBarElement
    loadingBarElement.classList.add("ended");
    loadingBarElement.style.transform = "";
  },

  // Progress
  (itemUrl, itemsLoaded, itemsTotal) => {
    // Calculate the progress and update the loadingBarElement
    const progressRatio = itemsLoaded / itemsTotal;
    loadingBarElement.style.transform = `scaleX(${progressRatio})`;
  }
);
const gltfLoader = new GLTFLoader(loadingManager);
const textureLoader = new THREE.TextureLoader(loadingManager);
const fontLoader = new THREE.FontLoader();
const textMatCap = textureLoader.load("/textures/matcaps/3.png");
/**
 * Base
 */
// Debug
const debugObject = {};

// Canvas
const canvas = document.querySelector("canvas.webgl");

// Scene
const scene = new THREE.Scene();

/**
 * Overlay
 */
const overlayGeometry = new THREE.PlaneGeometry(2, 2, 1, 1);
const overlayMaterial = new THREE.ShaderMaterial({
  // wireframe: true,
  transparent: true,
  uniforms: {
    uAlpha: { value: 1 },
  },
  vertexShader: `
        void main()
        {
            gl_Position = vec4(position, 1.0);
        }
    `,
  fragmentShader: `
        uniform float uAlpha;

        void main()
        {
            gl_FragColor = vec4(0.0, 0.0, 0.0, uAlpha);
        }
    `,
});
const overlay = new THREE.Mesh(overlayGeometry, overlayMaterial);
scene.add(overlay);

/**
 * Objects
 */

// Contact Floor
const planeGeometry = new THREE.PlaneBufferGeometry(5, 5, 5, 100, 100);
const planeMaterial = new THREE.MeshStandardMaterial({
  transparent: false,
  metalness: 0,
  roughness: 0,
  color: 0xffffff,
  side: DoubleSide,
});

const aboutWall = new THREE.Mesh(planeGeometry, planeMaterial);
aboutWall.position.set(0, 0, -16);
aboutWall.scale.set(14, 8, 8);
aboutWall.receiveShadow = true;
scene.add(aboutWall);

const contactFloor = new THREE.Mesh(planeGeometry, planeMaterial);
contactFloor.position.set(0, -103, 0);
contactFloor.rotation.x += Math.PI * 0.5;
contactFloor.scale.set(8, 5, 5);
scene.add(contactFloor);

// Project Websites
const cyclopsMap = new THREE.TextureLoader().load(
  "textures/websites/cyclops.png"
);
const alchemyMap = new THREE.TextureLoader().load(
  "textures/websites/alchemy.png"
);

const cyclopsMaterial = new THREE.MeshPhysicalMaterial({
  transparent: false,
  metalness: 0,
  roughness: 0.9,
  // color: 0x111111,
  map: cyclopsMap,
});
const alchemyMaterial = new THREE.MeshPhysicalMaterial({
  transparent: false,
  metalness: 0,
  roughness: 0.9,
  // color: 0xffffff,
  map: alchemyMap,
});
const projectPlane1 = new THREE.Mesh(planeGeometry, cyclopsMaterial);
projectPlane1.position.set(-4, -50, -8);
projectPlane1.rotation.y += Math.PI * 0.1;
projectPlane1.scale.set(1.5, 1.2, 1);

const projectPlane2 = new THREE.Mesh(planeGeometry, alchemyMaterial);

projectPlane2.position.set(4, -50, -8);
projectPlane2.rotation.y -= Math.PI * 0.1;
projectPlane2.scale.set(1.5, 1.2, 1);
scene.add(projectPlane1, projectPlane2);

// Text
const aboutText = new THREE.Group();
const contactText = new THREE.Group();
const contactBullets = new THREE.Group();
const contactTextMaterial = new THREE.MeshStandardMaterial({
  color: 0xffffff,
  roughness: 0,
  metalness: 0,
});
fontLoader.load("/fonts/helvetiker_regular.typeface.json", (font) => {
  const aboutTitleGeometry = new THREE.TextGeometry(
    "Hello, my name is Allen.",
    {
      font: font,
      size: 0.4,
      height: 0.01,
      curveSegments: 12,
      bevelEnabled: true,
      bevelThickness: 0.03,
      bevelSize: 0.02,
      bevelOffset: 0,
      bevelSegments: 3,
    }
  );
  const aboutLine1Geometry = new THREE.TextGeometry(
    "I am a front end developer",
    {
      font: font,
      size: 0.3,
      height: 0.01,
      curveSegments: 12,
      bevelEnabled: true,
      bevelThickness: 0.03,
      bevelSize: 0.02,
      bevelOffset: 0,
      bevelSegments: 3,
    }
  );
  const aboutLine2Geometry = new THREE.TextGeometry(
    `with a passion for creating awesome websites.`,
    {
      font: font,
      size: 0.3,
      height: 0.01,
      curveSegments: 12,
      bevelEnabled: true,
      bevelThickness: 0.03,
      bevelSize: 0.02,
      bevelOffset: 0,
      bevelSegments: 3,
      color: 0x990000,
    }
  );
  const aboutLine3Geometry = new THREE.TextGeometry(
    `Let's create something amazing.`,
    {
      font: font,
      size: 0.4,
      height: 0.01,
      curveSegments: 12,
      bevelEnabled: true,
      bevelThickness: 0.03,
      bevelSize: 0.02,
      bevelOffset: 0,
      bevelSegments: 3,
      color: 0x990000,
    }
  );

  const contactEmailGeometry = new THREE.TextGeometry(`allen.hsing@gmail.com`, {
    font: font,
    size: 0.4,
    height: 0.1,
    curveSegments: 12,
    bevelEnabled: true,
    bevelThickness: 0.03,
    bevelSize: 0.02,
    bevelOffset: 0,
    bevelSegments: 3,
    color: 0x999999,
  });

  const contactLinkedInGeometry = new THREE.TextGeometry(`LinkedIn`, {
    font: font,
    size: 0.4,
    height: 0.1,
    curveSegments: 12,
    bevelEnabled: true,
    bevelThickness: 0.03,
    bevelSize: 0.02,
    bevelOffset: 0,
    bevelSegments: 3,
    color: 0x990000,
  });

  const contactTwitterGeometry = new THREE.TextGeometry(`Twitter`, {
    font: font,
    size: 0.4,
    height: 0.1,
    curveSegments: 12,
    bevelEnabled: true,
    bevelThickness: 0.03,
    bevelSize: 0.02,
    bevelOffset: 0,
    bevelSegments: 3,
    color: 0x990000,
  });

  const textMaterial = new THREE.MeshPhongMaterial({
    shininess: 50,
    specular: new THREE.Color(0xff0000),
    color: 0x111111,
  });

  const matcapTexture = textureLoader.load("textures/matcaps/3.png");
  const textMatCapMaterial = new THREE.MeshMatcapMaterial({
    matcap: matcapTexture,
  });

  const aboutTitleText = new THREE.Mesh(aboutTitleGeometry, textMatCapMaterial);
  aboutTitleText.castShadow = true;
  const aboutLine1Text = new THREE.Mesh(aboutLine1Geometry, textMaterial);
  aboutLine1Text.castShadow = true;

  const aboutLine2Text = new THREE.Mesh(aboutLine2Geometry, textMaterial);
  aboutLine2Text.castShadow = true;

  const aboutLine3Text = new THREE.Mesh(aboutLine3Geometry, textMaterial);
  aboutLine3Text.castShadow = true;

  const contactTextMesh = new THREE.Mesh(
    contactEmailGeometry,
    contactTextMaterial
  );
  const contactLinkedInMesh = new THREE.Mesh(
    contactLinkedInGeometry,
    contactTextMaterial
  );
  const contactTwitterMesh = new THREE.Mesh(
    contactTwitterGeometry,
    contactTextMaterial
  );

  aboutTitleText.position.set(-3.7, 1.5, -4);
  aboutLine1Text.position.set(-2.6, 0.5, -3.2);
  aboutLine2Text.position.set(-4, 0, -5);
  aboutLine3Text.position.set(-4, -1, -4);

  aboutText.add(aboutTitleText, aboutLine1Text, aboutLine2Text, aboutLine3Text);

  contactText.add(contactTextMesh, contactLinkedInMesh, contactTwitterMesh);

  contactTwitterMesh.position.set(-0.885, -97.5, -6);
  contactLinkedInMesh.position.set(-0.95, -101, -6);
  contactTextMesh.position.set(-2.83, -99.25, -6);
});
// Contact Bullets
const contactTorusGeometry = new THREE.TorusKnotGeometry(0.15, 0.05, 200, 16);
const contactTorus1 = new THREE.Mesh(contactTorusGeometry, contactTextMaterial);
const contactTorus2 = new THREE.Mesh(contactTorusGeometry, contactTextMaterial);

contactTorus2.position.set(0, -99.87, -6);
contactTorus1.position.set(0, -98.14, -6);
scene.add(aboutText, contactText, contactTorus1, contactTorus2);
contactText.scale.set(0, 0, 0);
contactTorus1.scale.set(0, 0, 0);
contactTorus2.scale.set(0, 0, 0);

/**
 * Raycaster
 */
const mouseRaycaster = new THREE.Raycaster();
const mouse = new THREE.Vector2();

document.addEventListener("click", onClick);

function onClick(event) {
  event.preventDefault();
  mouse.x = (event.clientX / window.innerWidth) * 2 - 1;
  mouse.y = -(event.clientY / window.innerHeight) * 2 + 1;

  mouseRaycaster.setFromCamera(mouse, camera);

  const mouseIntersects = mouseRaycaster.intersectObjects([
    ...contactText.children,
    projectPlane1,
    projectPlane2,
  ]);

  if (mouseIntersects[0] != undefined) {
    switch (mouseIntersects[0].object.id) {
      case 44:
        window.open("https://twitter.com/AllenHsing");
        break;
      case 43:
        window.open("https://www.linkedin.com/in/allen-hsing/");
        break;
      case 42:
        var copyText = document.getElementById("myInput");
        copyText.select();
        copyText.setSelectionRange(0, 99999);
        document.execCommand("copy");
        var alerter = document.getElementById("alerter");
        alerter.classList.add("visible");
        window.setTimeout(() => {
          alerter.classList.remove("visible");
        }, 3000);
        break;
      case 11:
        window.open("http://www.cyclops.watch/");
        break;
      case 12:
        window.open("http://www.alchemyga.me/");
        break;

      default:
        break;
    }
  }
}

/**
 * Lights
 */
const mouseBulb = new THREE.PointLight(0xffffff, 20, 0, 3);

const lightGeometry = new THREE.SphereGeometry(0.05, 16, 8);
const lightMaterial = new THREE.MeshStandardMaterial({
  emissive: 0xffffee,
  emissiveIntensity: 1,
  color: 0x000000,
});

mouseBulb.add(new THREE.Mesh(lightGeometry, lightMaterial));
mouseBulb.visible = true;
mouseBulb.castShadow = true;

scene.add(mouseBulb);

RectAreaLightUniformsLib.init();
let lightsOn = false;
const rectGroup = new THREE.Group();
const rectLight1 = new THREE.RectAreaLight(0xff0000, 5, 4.5, 13);
rectLight1.position.set(-6, -100, -11);
rectLight1.rotation.y += Math.PI;
const rectLight2 = new THREE.RectAreaLight(0x00ff00, 5, 4.5, 13);
rectLight2.position.set(0, -100, -11);
rectLight2.rotation.y += Math.PI;

const rectLight3 = new THREE.RectAreaLight(0x0000ff, 5, 4.5, 13);
rectLight3.position.set(6, -100, -11);
rectLight3.rotation.y += Math.PI;

const rect1Helper = new RectAreaLightHelper(rectLight1);
const rect2Helper = new RectAreaLightHelper(rectLight2);
const rect3Helper = new RectAreaLightHelper(rectLight3);
rectLight1.intensity = 0;
rectLight2.intensity = 0;
rectLight3.intensity = 0;

scene.add(
  rect1Helper,
  rect2Helper,
  rect3Helper,
  rectLight1,
  rectLight2,
  rectLight3
);

const generateRectLights = () => {
  lightsOn = true;
  window.setTimeout(() => {
    rectLight1.intensity = 5;
    if (lightsOn == true) cSound.play();
  }, 2000);
  gsap.to(contactTorus1.scale, { delay: 1, duration: 3, z: 1, y: 1, x: 1 });
  gsap.to(contactTorus2.scale, { delay: 1, duration: 3, z: 1, y: 1, x: 1 });
  window.setTimeout(() => {
    rectLight3.intensity = 5;
    contactText.scale.set(1, 1, 1);
    if (lightsOn == true) eSound.play();
  }, 3200);
  window.setTimeout(() => {
    rectLight2.intensity = 5;
    if (lightsOn == true) gSound.play();
  }, 4400);
};

const removeRectLights = () => {
  rectLight1.intensity = 0;
  rectLight2.intensity = 0;
  rectLight3.intensity = 0;
  contactTorus1.scale.set(0, 0, 0);
  contactTorus2.scale.set(0, 0, 0);
  contactText.scale.set(0, 0, 0);

  lightsOn = false;
};

/**
 * Shadows
 */
aboutText.castShadow = true;

/**
 * Sizes
 */
const sizes = {
  width: window.innerWidth,
  height: window.innerHeight,
};

window.addEventListener("resize", () => {
  // Update sizes
  sizes.width = window.innerWidth;
  sizes.height = window.innerHeight;

  // Update camera
  camera.aspect = sizes.width / sizes.height;
  camera.updateProjectionMatrix();

  // Update renderer
  renderer.setSize(sizes.width, sizes.height);
  renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));

  // Update effect Composer
  effectComposer.setPixelRatio(Math.min(window.devicePixelRatio, 2));
  effectComposer.setSize(sizes.width, sizes.height);
});

/**
 * Camera
 */
// Base camera
const camera = new THREE.PerspectiveCamera(
  75,
  sizes.width / sizes.height,
  0.1,
  20
);
camera.position.set(0, 0, 0);

scene.add(camera);

// Controls

const switchScene = (event) => {
  //Scroll Down
  if (event.deltaY > 0) {
    if (displayedPlane == "contactScene") {
      gsap.to(camera.position, { duration: 1, y: 0 });
      gsap.to(mouseBulb.position, { duration: 1, y: 0 });
    } else {
      gsap.to(camera.position, { duration: 1, y: camera.position.y - 50 });
      gsap.to(mouseBulb.position, { duration: 1, y: camera.position.y - 50 });
    }
  } else {
    // Scroll Up
    if (displayedPlane == "aboutScene") {
      gsap.to(camera.position, { duration: 1, y: -100 });
      gsap.to(mouseBulb.position, { duration: 1, y: -100 });
    } else {
      gsap.to(camera.position, { duration: 1, y: camera.position.y + 50 });
      gsap.to(mouseBulb.position, { duration: 1, y: camera.position.y + 50 });
    }
  }
  document.onwheel = null;
  window.setTimeout(() => {
    document.onwheel = switchScene;
  }, 2000);
};
document.onwheel = switchScene;

/**
 * Renderer
 */
const renderer = new THREE.WebGLRenderer({
  canvas: canvas,
  antialias: true,
});
renderer.physicallyCorrectLights = true;
renderer.outputEncoding = THREE.sRGBEncoding;
renderer.shadowMap.enabled = true;
renderer.toneMapping = THREE.ReinhardToneMapping;
renderer.toneMappingExposure = 3;
renderer.shadowMap.type = THREE.PCFSoftShadowMap;
renderer.setSize(sizes.width, sizes.height);
renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));

/**
 * Post Processing
 */

let RenderTargetClass = null;

if (renderer.getPixelRatio() === 1 && renderer.capabilities.isWebGL2) {
  RenderTargetClass = THREE.WebGLMultisampleRenderTarget;
} else {
  RenderTargetClass = THREE.WebGLRenderTarget;
}
// Render Target

const renderTarget = new THREE.WebGLRenderTarget(800, 600, {
  minFilter: THREE.LinearFilter,
  magFilter: THREE.LinearFilter,
  format: THREE.RGBAFormat,
  encoding: THREE.sRGBEncoding,
});
// Composer

const effectComposer = new EffectComposer(renderer, renderTarget);
effectComposer.setPixelRatio(Math.min(window.devicePixelRatio, 2));
effectComposer.setSize(sizes.width, sizes.height);

const renderPass = new RenderPass(scene, camera);
effectComposer.addPass(renderPass);

const glitchPass = new GlitchPass();
glitchPass.enabled = false;
effectComposer.addPass(glitchPass);

/**
 * Mouse Bulb Tracking
 */

document.addEventListener("mousemove", onMouseMove, false);
const target = new Vector2();
const mouseCamera = new Vector2();
const windowHalf = new THREE.Vector2(
  window.innerWidth / 2,
  window.innerHeight / 2
);
function onMouseMove(event) {
  // Update the mouse variable
  event.preventDefault();
  mouse.x = (event.clientX / window.innerWidth) * 2 - 1;
  mouse.y = -(event.clientY / window.innerHeight) * 2 + 1;
  mouseCamera.x = event.clientX - windowHalf.x;
  mouseCamera.y = event.clientY - windowHalf.x;

  // Make the sphere follow the mouse
  var vector = new THREE.Vector3(mouse.x, mouse.y, 0.5);
  vector.unproject(camera);
  var dir = vector.sub(camera.position).normalize();
  var distance = 3;
  var pos = camera.position.clone().add(dir.multiplyScalar(distance));
  mouseBulb.position.copy(pos);
}

/**
 * Animate
 */
const clock = new THREE.Clock();
let displayedPlane = "aboutScene";

const tick = () => {
  const elapsedTime = clock.getElapsedTime();
  // Go through each point
  if (sceneIsReady) {
    var cameraPostion = new THREE.Vector3();
    camera.getWorldPosition(cameraPostion);

    if (cameraPostion.y == 0) {
      displayedPlane = "aboutScene";
    } else if (cameraPostion.y == -50) {
      displayedPlane = "projectsScene";
    } else if (cameraPostion.y == -100) {
      displayedPlane = "contactScene";
    }
    switch (displayedPlane) {
      case "projectsScene":
        gsap.to(mouseBulb, { intensity: 100 });
        removeRectLights();
        break;
      case "aboutScene":
        removeRectLights();
        gsap.to(mouseBulb, { intensity: 40 });
        aboutText.rotation.y = Math.cos((Math.PI / 2) * elapsedTime * 1) * 0.01;
        aboutText.rotation.x = Math.cos((Math.PI / 2) * elapsedTime * 1) * 0.01;
        aboutText.rotation.x = Math.sin((Math.PI / 2) * elapsedTime * 1) * 0.01;
        break;
      case "contactScene":
        gsap.to(mouseBulb, { intensity: 0 });
        if (!lightsOn) generateRectLights();
        break;
      default:
        break;
    }
  }

  // Render
  effectComposer.render();
  contactTorus1.rotation.y = elapsedTime;
  contactTorus2.rotation.y = -elapsedTime;

  // Camera Pan
  target.x = (1 - mouseCamera.x) * 0.0002;
  target.y = (-350 - mouseCamera.y) * 0.0002;

  camera.rotation.x += 0.05 * (target.y - camera.rotation.x);
  camera.rotation.y += 0.05 * (target.x - camera.rotation.y);
  // Call tick again on the next frame
  window.requestAnimationFrame(tick);
};

tick();
