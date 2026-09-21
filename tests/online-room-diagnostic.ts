import assert from 'node:assert/strict';
import { MEMEME_ONLINE_BASE_URL } from '../src/core/onlineTransport0702';

const room = (process.env.MEMEME_DIAGNOSTIC_ROOM ?? '').trim();
assert.match(room, /^[A-Z0-9]{4,8}$/i, 'MEMEME_DIAGNOSTIC_ROOM must be 4-8 alphanumeric chars');

const base = (process.env.MEMEME_ONLINE_BASE_URL?.trim() || MEMEME_ONLINE_BASE_URL).replace(/\/+$/, '');
const response = await fetch(base + '/api/rooms/' + room.toUpperCase() + '/status', { cache: 'no-store' });
const text = await response.text();

console.log('[online-room-diagnostic] room=' + room.toUpperCase() + ' status=' + response.status);
console.log(text);

if (response.status === 404) {
  console.log('[online-room-diagnostic] room_not_found_or_recyclable');
}
