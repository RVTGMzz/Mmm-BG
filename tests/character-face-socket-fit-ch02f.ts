import assert from 'node:assert/strict';
import { FACE_SHAPE_PROBES_CH02F, faceFitStaysInsidePoseCh02f, fitFaceSourceToSocketCh02f } from '../src/core/characterFaceSocketFitCh02f';

const poseWidth = 1024;
const poseHeight = 1536;
const socket = { x: 0.5, y: 0.329, scale: 0.29, rotationDeg: 0, padding: 0.08 };

for (const probe of FACE_SHAPE_PROBES_CH02F) {
  const fit = fitFaceSourceToSocketCh02f({ width: probe.width * 1000, height: probe.height * 1000 }, socket, poseWidth, poseHeight);
  assert.equal(faceFitStaysInsidePoseCh02f(fit, poseWidth, poseHeight), true, `${probe.id} must stay inside pose canvas`);
  assert.equal(fit.width, poseWidth * socket.scale);
}

const round = fitFaceSourceToSocketCh02f({ width: 1000, height: 1000 }, socket, poseWidth, poseHeight);
const long = fitFaceSourceToSocketCh02f({ width: 780, height: 1150 }, socket, poseWidth, poseHeight);
assert.equal(round.width, long.width);
assert.ok(long.height > round.height);
assert.throws(() => fitFaceSourceToSocketCh02f({ width: 0, height: 100 }, socket, poseWidth, poseHeight), /positive/);
assert.throws(() => fitFaceSourceToSocketCh02f({ width: 100, height: 100 }, socket, 0, poseHeight), /positive/);
console.log('[character-face-socket-fit-ch02f] PASS one socket handles round/long/square/narrow head probes');