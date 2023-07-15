//@ts-nocheck
import { createEffect, onCleanup, createSignal } from 'solid-js';
import * as THREE from 'three';
import { useAudioContext } from '../contexts/AudioContext';
import { useWebSocketContext } from '../contexts/WebSocketContext';
import {
  updateSize,
  pointPositions
} from '../helpers/animationHelperFunctions';

const AudioComponent = () => {
  const {
    recordingState,
    setRecordingState,
    audio,
    setAudio,
    audioChunks,
    setAudioChunks
  } = useAudioContext();
  const { sendData } = useWebSocketContext();
  let audioRef;
  let rotationTween;
  let colourTween;
  let scaleTween;
  let mouseEdge = 160;
  let mousePos = 0;

  const [distance, setDistance] = createSignal<integer>(0);
  const [boop, setBoop] = createSignal<Boolean>(false);
  const [containerRef, setContainerRef] = createSignal<HTMLDivElement>();
  const [isScaleTweenActive, setIsScaleTweenActive] =
    createSignal<String>('no');
  const [particlesRef, setParticlesRef] =
    createSignal<THREE.Points<THREE.BufferGeometry>>();
  const [renderingParentRef, setRenderingParentRef] =
    createSignal<THREE.Group>();
  let initialRotation = { x: 0, y: 0 };
  const [animProps, setAnimProps] = createSignal({
    scale: 1,
    xRot: 0,
    yRot: 0
  });

  createEffect(() => {
    const chunks = audioChunks();
    if (chunks?.size > 0) {
      console.log('Setting data: ', chunks.length);
      sendData(chunks);
    }
    setAudioChunks(null);
  });

  createEffect(() => {
    const container = containerRef();
    const scene = new THREE.Scene();
    const camera = new THREE.PerspectiveCamera(
      100,
      window.innerWidth / window.innerHeight,
      0.1,
      1000
    );

    const renderer = new THREE.WebGLRenderer();
    camera.aspect = 1; // window.innerWidth - 100 / window.innerHeight - 100;
    camera.updateProjectionMatrix();
    // renderer.setSize(window.innerWidth, window.innerHeight);
    container?.appendChild(renderer.domElement);

    updateSize(camera, renderer);

    window.addEventListener('resize', updateSize);

    const distance = Math.min(150, window.innerWidth / 4);
    const geometry = new THREE.BufferGeometry();

    const positions = pointPositions(distance);

    geometry.setAttribute(
      'position',
      new THREE.Float32BufferAttribute(positions, 3)
    );
    const material = new THREE.PointsMaterial({
      color: 0xff44ff,
      size: 2
    });
    const particles = new THREE.Points(geometry, material);

    var dotGeometry = new THREE.BufferGeometry();

    dotGeometry.setAttribute(
      'position',
      new THREE.Float32BufferAttribute([0, 0, 0], 3)
    );

    var dotMaterial = new THREE.PointsMaterial({
      color: 0x00ff00,
      size: 5
    });

    var dot = new THREE.Points(dotGeometry, dotMaterial);
    particles.geometry.center();

    scene.add(particles);
    scene.add(dot);

    camera.position.z = 400;

    const render = () => {
      renderer.render(scene, camera);
    };

    gsap.ticker.add(render);

    rotationTween = gsap.to(animProps(), {
      duration: 15,
      xRot: Math.PI * 2,
      yRot: Math.PI * 8,
      repeat: -1,
      yoyo: false,
      ease: 'none',
      onUpdate: () => {
        particles.rotation.set(animProps().xRot, animProps().yRot, 0);
      }
    });

    const onMouseMove = (event) => {
      const vec = new THREE.Vector3(); // create once and reuse
      const pos = new THREE.Vector3(); // create once and reuse

      vec.set(
        (event.clientX / window.innerWidth) * 2 - 1,
        -(event.clientY / window.innerHeight) * 2 + 1,
        0.5
      );
      vec.unproject(camera);
      vec.sub(camera.position).normalize();
      const distance = -camera.position.z / vec.z;

      pos.copy(camera.position).add(vec.multiplyScalar(distance));

      mousePos = Math.sqrt(Math.pow(pos.x, 2) + Math.pow(pos.y, 2));
      if (mousePos < mouseEdge + 10) {
        if (animProps().name !== 'active') {
          colourTween?.kill();
          colourTween = gsap.to(animProps(), {
            name: 'active',
            onStart: () => {
              material.color.set(0x00ffff);
            }
          });
          rotationTween.timeScale(3);
        }
      } else {
        if (animProps().name !== 'inactive') {
          if (scaleTween?.isActive()) {
            setIsScaleTweenActive('ready');
            return;
          }
          colourTween?.kill();
          colourTween = gsap.to(animProps(), {
            name: 'inactive',
            onStart: () => {
              material.color.set(0xff44ff);
            }
          });
          rotationTween.timeScale(1);
        }
      }
    };
    const onMouseClick = (event) => {
      if (
        scaleTween &&
        mousePos > mouseEdge + 20 &&
        isScaleTweenActive() === 'ready'
      ) {
        setRecordingState('stop');
        setIsScaleTweenActive('yes');
        material.color.set(0xff44ff);
        return;
      }
      if (scaleTween?.isActive()) return;
      if (animProps().name === 'active') {
        setRecordingState('start');
        scaleTween = gsap.to(animProps(), {
          duration: 1,
          scale: 1.5,
          repeat: -1,
          yoyo: true,
          yoyoEase: CustomEase.create(
            'custom',
            'M0,0,C0.084,0.61,0.58,0.888,0.646,0.942,0.722,1.004,0.74,1,1,1'
          ),
          ease: CustomEase.create(
            'custom',
            'M0,0,C0.084,0.61,0.58,0.888,0.646,0.942,0.722,1.004,0.74,1,1,1'
          ),
          onUpdate: () => {
            particles.scale.set(
              animProps().scale,
              animProps().scale,
              animProps().scale
            );
          }
        });
      }
    };
    document.addEventListener('click', onMouseClick);

    createEffect(() => {
      if (isScaleTweenActive() === 'yes') {
        setIsScaleTweenActive('no');
        scaleTween.pause();

        gsap.to(animProps(), {
          duration: 1,
          scale: 1,
          repeat: 0,
          yoyo: false,
          onUpdate: () => {
            particles.scale.set(
              animProps().scale,
              animProps().scale,
              animProps().scale
            );
          }
        });

        scaleTween.kill();
      }
    });

    document.addEventListener('mousemove', onMouseMove);

    onCleanup(() => {
      window.removeEventListener('resize', updateSize);
      gsap.ticker.remove(render);
      // rotationTimeline.kill();
      document.removeEventListener('mousemove', onMouseMove);
      container.removeChild(renderer.domElement);
    });
  });

  createEffect(() => {
    if (audio()) {
      audioRef.src = audio();
    }
  });

  function handleEnded() {
    audioRef.pause();
    audioRef.currentTime = 0;
    audioRef.src = null;
  }

  return (
    <>
      <audio
        onEnded={handleEnded}
        ref={audioRef}
        autoplay
        style="display: none;"
      ></audio>
      <div ref={setContainerRef}></div>
    </>
  );
};

export default AudioComponent;
