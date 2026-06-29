import { Asset } from 'expo-asset';
import { GLView, ExpoWebGLRenderingContext } from 'expo-gl';
import { useEffect, useMemo, useRef, useState } from 'react';
import {
  ActivityIndicator,
  Image,
  PanResponder,
  Pressable,
  StyleSheet,
  Text,
  View,
} from 'react-native';
import * as THREE from 'three';

import worldBoundaryLines from '../data/worldBoundaries.json';

import {
  GlobeSelection,
  findNearestMajorCity,
  formatCoordinate,
  normalizeLongitude,
} from '../utils/geo';

type AstrologicalGlobeProps = {
  initialLatitude?: number;
  initialLongitude?: number;
  onSelectionChange: (selection: GlobeSelection) => void;
  size: number;
};

type GestureState = {
  hasMoved: boolean;
  lastDistance: number;
  lastTime: number;
  lastX: number;
  lastY: number;
  velocityLatitude: number;
  velocityLongitude: number;
};

const MIN_CAMERA_DISTANCE = 1.18;
const MAX_CAMERA_DISTANCE = 4.2;
const INITIAL_CAMERA_DISTANCE = 3.15;

export function AstrologicalGlobe({
  initialLatitude = 20,
  initialLongitude = 10,
  onSelectionChange,
  size,
}: AstrologicalGlobeProps) {
  const latitude = useRef(initialLatitude);
  const longitude = useRef(initialLongitude);
  const cameraDistance = useRef(INITIAL_CAMERA_DISTANCE);
  const isDragging = useRef(false);
  const animationFrame = useRef<number | null>(null);
  const mounted = useRef(true);
  const lastFrameTime = useRef(Date.now());
  const lastSelectionTime = useRef(0);
  const gesture = useRef<GestureState>({
    hasMoved: false,
    lastDistance: 0,
    lastTime: 0,
    lastX: 0,
    lastY: 0,
    velocityLatitude: 0,
    velocityLongitude: 0,
  });
  const [renderError, setRenderError] = useState('');
  const [isReady, setIsReady] = useState(false);
  const [selection, setSelection] = useState<GlobeSelection | null>(null);

  useEffect(() => () => {
    mounted.current = false;
    if (animationFrame.current !== null) cancelAnimationFrame(animationFrame.current);
  }, []);

  function emitSelection(force = false) {
    const now = Date.now();
    if (!force && now - lastSelectionTime.current < 360) return;
    lastSelectionTime.current = now;
    const nextSelection = findNearestMajorCity(latitude.current, longitude.current);
    setSelection(nextSelection);
    onSelectionChange(nextSelection);
  }

  function changeZoom(delta: number) {
    cameraDistance.current = clamp(cameraDistance.current + delta, MIN_CAMERA_DISTANCE, MAX_CAMERA_DISTANCE);
  }

  const panResponder = useMemo(
    () => PanResponder.create({
      onMoveShouldSetPanResponder: (_event, state) => Math.abs(state.dx) > 2 || Math.abs(state.dy) > 2,
      onPanResponderGrant: (event) => {
        isDragging.current = true;
        const touches = event.nativeEvent.touches;
        const firstTouch = touches[0];
        gesture.current = {
          hasMoved: false,
          lastDistance: touches.length > 1 ? touchDistance(touches[0], touches[1]) : 0,
          lastTime: Date.now(),
          lastX: firstTouch?.pageX ?? event.nativeEvent.pageX,
          lastY: firstTouch?.pageY ?? event.nativeEvent.pageY,
          velocityLatitude: 0,
          velocityLongitude: 0,
        };
      },
      onPanResponderMove: (event) => {
        const touches = event.nativeEvent.touches;
        const now = Date.now();

        if (touches.length > 1) {
          const distance = touchDistance(touches[0], touches[1]);
          if (gesture.current.lastDistance > 0) {
            cameraDistance.current = clamp(
              cameraDistance.current - (distance - gesture.current.lastDistance) * 0.006,
              MIN_CAMERA_DISTANCE,
              MAX_CAMERA_DISTANCE,
            );
          }
          gesture.current.lastDistance = distance;
          gesture.current.hasMoved = true;
          return;
        }

        const touch = touches[0];
        if (!touch) return;
        const elapsed = Math.max(8, now - gesture.current.lastTime);
        const deltaX = touch.pageX - gesture.current.lastX;
        const deltaY = touch.pageY - gesture.current.lastY;
        const sensitivity = 0.32 * (cameraDistance.current / 2.65);
        const latitudeDelta = deltaY * sensitivity;
        const longitudeDelta = -deltaX * sensitivity;

        latitude.current = clamp(latitude.current + latitudeDelta, -89, 89);
        longitude.current = normalizeLongitude(longitude.current + longitudeDelta);
        gesture.current.velocityLatitude = latitudeDelta / elapsed;
        gesture.current.velocityLongitude = longitudeDelta / elapsed;
        gesture.current.lastTime = now;
        gesture.current.lastX = touch.pageX;
        gesture.current.lastY = touch.pageY;
        gesture.current.hasMoved = true;
        emitSelection();
      },
      onPanResponderRelease: () => {
        isDragging.current = false;
        if (!gesture.current.hasMoved) emitSelection(true);
      },
      onPanResponderTerminate: () => {
        isDragging.current = false;
        emitSelection(true);
      },
      onPanResponderTerminationRequest: () => false,
      onShouldBlockNativeResponder: () => true,
      onStartShouldSetPanResponder: () => true,
    }),
    [onSelectionChange],
  );

  async function createScene(gl: ExpoWebGLRenderingContext) {
    const renderer = createRenderer(gl);
    renderer.setClearColor(0x000000, 0);
    renderer.setPixelRatio(1);
    renderer.setSize(gl.drawingBufferWidth, gl.drawingBufferHeight, false);
    renderer.outputColorSpace = THREE.SRGBColorSpace;

    const scene = new THREE.Scene();
    const camera = new THREE.PerspectiveCamera(
      42,
      gl.drawingBufferWidth / gl.drawingBufferHeight,
      0.1,
      100,
    );
    camera.position.z = cameraDistance.current;

    const earthGroup = new THREE.Group();
    scene.add(earthGroup);

    const texture = await createExpoTexture(require('../../assets/earth-blue-marble.jpg'));
    texture.colorSpace = THREE.SRGBColorSpace;
    texture.anisotropy = Math.min(8, renderer.capabilities.getMaxAnisotropy());

    const earthGeometry = new THREE.SphereGeometry(1, 64, 48);
    const earthMaterial = new THREE.MeshStandardMaterial({
      map: texture,
      metalness: 0.02,
      roughness: 0.82,
    });
    earthGroup.add(new THREE.Mesh(earthGeometry, earthMaterial));

    const coordinateGeometry = new THREE.SphereGeometry(1.006, 36, 18);
    const coordinateMaterial = new THREE.MeshBasicMaterial({
      color: 0xc2a768,
      opacity: 0.075,
      transparent: true,
      wireframe: true,
    });
    earthGroup.add(new THREE.Mesh(coordinateGeometry, coordinateMaterial));

    const boundaryGeometry = createBoundaryGeometry();
    const boundaryMaterial = new THREE.LineBasicMaterial({
      color: 0xe0c27b,
      opacity: 0.78,
      transparent: true,
    });
    earthGroup.add(new THREE.LineSegments(boundaryGeometry, boundaryMaterial));

    const atmosphereGeometry = new THREE.SphereGeometry(1.055, 64, 48);
    const atmosphereMaterial = new THREE.ShaderMaterial({
      blending: THREE.AdditiveBlending,
      fragmentShader: `
        varying vec3 vertexNormal;
        void main() {
          float intensity = pow(max(0.0, 0.72 - dot(vertexNormal, vec3(0.0, 0.0, 1.0))), 2.2);
          gl_FragColor = vec4(0.22, 0.42, 0.65, 1.0) * intensity;
        }
      `,
      side: THREE.BackSide,
      transparent: true,
      vertexShader: `
        varying vec3 vertexNormal;
        void main() {
          vertexNormal = normalize(normalMatrix * normal);
          gl_Position = projectionMatrix * modelViewMatrix * vec4(position, 1.0);
        }
      `,
    });
    scene.add(new THREE.Mesh(atmosphereGeometry, atmosphereMaterial));

    scene.add(new THREE.AmbientLight(0x6f8090, 1.15));
    const keyLight = new THREE.DirectionalLight(0xfff2d0, 2.8);
    keyLight.position.set(-3, 2.4, 4);
    scene.add(keyLight);
    const rimLight = new THREE.DirectionalLight(0x5677a8, 1.3);
    rimLight.position.set(3, -1, -2);
    scene.add(rimLight);

    const front = new THREE.Vector3(0, 0, 1);
    const selectedPoint = new THREE.Vector3();
    const targetQuaternion = new THREE.Quaternion();
    lastFrameTime.current = Date.now();

    const render = () => {
      if (!mounted.current) return;
      const now = Date.now();
      const elapsed = Math.min(34, now - lastFrameTime.current);
      lastFrameTime.current = now;

      if (!isDragging.current) {
        const velocityMagnitude =
          Math.abs(gesture.current.velocityLatitude) + Math.abs(gesture.current.velocityLongitude);
        if (velocityMagnitude > 0.0008) {
          latitude.current = clamp(
            latitude.current + gesture.current.velocityLatitude * elapsed,
            -89,
            89,
          );
          longitude.current = normalizeLongitude(
            longitude.current + gesture.current.velocityLongitude * elapsed,
          );
          const damping = Math.pow(0.944, elapsed / 16.67);
          gesture.current.velocityLatitude *= damping;
          gesture.current.velocityLongitude *= damping;
          emitSelection();
        } else if (velocityMagnitude > 0) {
          gesture.current.velocityLatitude = 0;
          gesture.current.velocityLongitude = 0;
          emitSelection(true);
        }
      }

      latLonToVector(latitude.current, longitude.current, selectedPoint);
      targetQuaternion.setFromUnitVectors(selectedPoint, front);
      earthGroup.quaternion.copy(targetQuaternion);
      camera.position.z += (cameraDistance.current - camera.position.z) * 0.16;
      renderer.render(scene, camera);
      gl.endFrameEXP();
      animationFrame.current = requestAnimationFrame(render);
    };

    if (mounted.current) {
      setIsReady(true);
      render();
    }
  }

  async function handleContextCreate(gl: ExpoWebGLRenderingContext) {
    try {
      await createScene(gl);
    } catch (error) {
      console.warn('The 3D Earth renderer could not start.', error);
      if (mounted.current) setRenderError('EARTH RENDERER UNAVAILABLE');
    }
  }

  return (
    <View style={[styles.frame, { height: size, width: size }]}>
      <View style={styles.globeViewport}>
        <GLView msaaSamples={4} onContextCreate={(gl) => void handleContextCreate(gl)} style={StyleSheet.absoluteFill} />
        <View accessibilityLabel="Rotate and pinch the Earth" {...panResponder.panHandlers} style={StyleSheet.absoluteFill} />

        {!isReady ? (
          <View style={styles.loading}>
            {renderError ? null : <ActivityIndicator color="#c2a768" />}
            <Text style={styles.loadingText}>{renderError || 'INITIALIZING EARTH'}</Text>
          </View>
        ) : null}

        <View pointerEvents="none" style={styles.target}>
          <View style={styles.targetOuter} />
          <View style={styles.targetInner} />
          <View style={styles.targetHorizontal} />
          <View style={styles.targetVertical} />
          <View style={styles.targetCenter} />
        </View>

        <Text numberOfLines={1} pointerEvents="none" style={styles.attribution}>EARTH / NASA   BORDERS / NATURAL EARTH   CITIES / GEONAMES</Text>

        <View style={styles.zoomControls}>
          <Pressable accessibilityLabel="Zoom in" onPress={() => changeZoom(-0.35)} style={styles.zoomButton}>
            <Text style={styles.zoomButtonText}>+</Text>
          </Pressable>
          <View style={styles.zoomDivider} />
          <Pressable accessibilityLabel="Zoom out" onPress={() => changeZoom(0.35)} style={styles.zoomButton}>
            <Text style={styles.zoomButtonText}>−</Text>
          </Pressable>
        </View>
      </View>

      <View pointerEvents="none" style={styles.readout}>
        {selection ? (
          <>
            <Text style={styles.readoutLabel}>NEAREST MAJOR CITY</Text>
            <Text numberOfLines={1} style={styles.readoutCity}>
              {selection.city.name}, {selection.city.country}
            </Text>
            <Text style={styles.readoutCoordinates}>
              {formatCoordinate(selection.latitude, 'N', 'S')}  /  {formatCoordinate(selection.longitude, 'E', 'W')}
              {selection.distanceKm >= 25 ? `  ·  ${Math.round(selection.distanceKm)} KM` : ''}
            </Text>
          </>
        ) : (
          <>
            <Text style={styles.readoutLabel}>TARGET YOUR BIRTHPLACE</Text>
            <Text style={styles.readoutCoordinates}>DRAG TO ROTATE  ·  PINCH TO ZOOM</Text>
          </>
        )}
      </View>
    </View>
  );
}

function latLonToVector(latitude: number, longitude: number, target: THREE.Vector3) {
  const latitudeRadians = THREE.MathUtils.degToRad(latitude);
  const longitudeRadians = THREE.MathUtils.degToRad(longitude);
  const latitudeCosine = Math.cos(latitudeRadians);
  target.set(
    latitudeCosine * Math.cos(longitudeRadians),
    Math.sin(latitudeRadians),
    -latitudeCosine * Math.sin(longitudeRadians),
  );
  return target.normalize();
}

function touchDistance(
  first: { pageX: number; pageY: number },
  second: { pageX: number; pageY: number },
) {
  return Math.hypot(second.pageX - first.pageX, second.pageY - first.pageY);
}

function clamp(value: number, minimum: number, maximum: number) {
  return Math.max(minimum, Math.min(maximum, value));
}

function createBoundaryGeometry() {
  const positions: number[] = [];
  const start = new THREE.Vector3();
  const end = new THREE.Vector3();

  for (const line of worldBoundaryLines as number[][]) {
    for (let index = 0; index <= line.length - 4; index += 2) {
      latLonToVector(line[index + 1] / 100, line[index] / 100, start).multiplyScalar(1.012);
      latLonToVector(line[index + 3] / 100, line[index + 2] / 100, end).multiplyScalar(1.012);
      positions.push(start.x, start.y, start.z, end.x, end.y, end.z);
    }
  }

  const geometry = new THREE.BufferGeometry();
  geometry.setAttribute('position', new THREE.Float32BufferAttribute(positions, 3));
  return geometry;
}

function createRenderer(gl: ExpoWebGLRenderingContext) {
  const canvas = {
    addEventListener: () => undefined,
    clientHeight: gl.drawingBufferHeight,
    height: gl.drawingBufferHeight,
    removeEventListener: () => undefined,
    style: {},
    width: gl.drawingBufferWidth,
  } as unknown as HTMLCanvasElement;

  return new THREE.WebGLRenderer({
    alpha: true,
    antialias: true,
    canvas,
    context: gl as unknown as WebGLRenderingContext,
  });
}

async function createExpoTexture(moduleReference: number) {
  const asset = Asset.fromModule(moduleReference);
  if (!asset.localUri) await asset.downloadAsync();
  const uri = asset.localUri ?? asset.uri;
  const dimensions = await new Promise<{ height: number; width: number }>((resolve, reject) => {
    Image.getSize(uri, (width, height) => resolve({ height, width }), reject);
  });
  const texture = new THREE.Texture();
  texture.image = {
    data: asset,
    height: dimensions.height,
    width: dimensions.width,
  };
  (texture as THREE.Texture & { isDataTexture: boolean }).isDataTexture = true;
  texture.needsUpdate = true;
  return texture;
}

const styles = StyleSheet.create({
  frame: { alignSelf: 'center', backgroundColor: 'transparent', overflow: 'hidden', position: 'relative' },
  globeViewport: { flex: 1, overflow: 'hidden', position: 'relative' },
  loading: { ...StyleSheet.absoluteFillObject, alignItems: 'center', backgroundColor: 'rgba(6,7,8,0.82)', justifyContent: 'center' },
  loadingText: { color: '#66635b', fontSize: 7, fontWeight: '800', letterSpacing: 1.5, marginTop: 10 },
  target: { alignItems: 'center', height: 80, justifyContent: 'center', left: '50%', marginLeft: -40, marginTop: -40, position: 'absolute', top: '50%', width: 80 },
  targetOuter: { borderColor: 'rgba(219,188,113,0.55)', borderRadius: 30, borderWidth: 1, height: 60, position: 'absolute', width: 60 },
  targetInner: { borderColor: '#d9bb73', borderRadius: 12, borderWidth: 1, height: 24, position: 'absolute', width: 24 },
  targetHorizontal: { backgroundColor: '#d9bb73', height: 1, position: 'absolute', width: 80 },
  targetVertical: { backgroundColor: '#d9bb73', height: 80, position: 'absolute', width: 1 },
  targetCenter: { backgroundColor: '#f0d99d', borderRadius: 2, height: 4, position: 'absolute', width: 4 },
  attribution: { color: 'rgba(218,205,174,0.42)', fontSize: 5, fontWeight: '800', left: 10, letterSpacing: 0.8, position: 'absolute', top: 10 },
  zoomControls: { backgroundColor: 'rgba(6,7,8,0.82)', borderColor: 'rgba(255,255,255,0.16)', borderWidth: 1, position: 'absolute', right: 10, top: 10 },
  zoomButton: { alignItems: 'center', height: 34, justifyContent: 'center', width: 34 },
  zoomButtonText: { color: '#c7ae70', fontFamily: 'Georgia', fontSize: 20, fontWeight: '300', lineHeight: 22 },
  zoomDivider: { backgroundColor: 'rgba(255,255,255,0.12)', height: 1, marginHorizontal: 6 },
  readout: { backgroundColor: 'rgba(6,7,8,0.48)', borderTopColor: 'rgba(224,194,123,0.22)', borderTopWidth: 1, minHeight: 66, paddingHorizontal: 13, paddingVertical: 10 },
  readoutLabel: { color: '#77736a', fontSize: 6, fontWeight: '800', letterSpacing: 1.45 },
  readoutCity: { color: '#eee9df', fontFamily: 'Georgia', fontSize: 17, marginTop: 2 },
  readoutCoordinates: { color: '#8d7b51', fontSize: 7, fontWeight: '700', letterSpacing: 0.75, marginTop: 3 },
});
