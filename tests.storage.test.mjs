import test from 'node:test';
import assert from 'node:assert/strict';

const makeLocalStorage = () => {
  const store = new Map();
  return {
    get length() { return store.size; },
    key(i) { return Array.from(store.keys())[i] ?? null; },
    getItem(k) { return store.has(k) ? store.get(k) : null; },
    setItem(k, v) { store.set(String(k), String(v)); },
    removeItem(k) { store.delete(String(k)); },
    clear() { store.clear(); },
  };
};

globalThis.localStorage = makeLocalStorage();

const storage = await import('./src/storage.js');

test('createProfile sanitizes unsafe profile name', () => {
  const profile = storage.createProfile('<script>Bad & Name</script>', '⚾');
  assert.equal(profile.name.includes('<'), false);
  assert.equal(profile.name.includes('&'), false);
  assert.ok(profile.name.length <= 40);
});

test('importProfileData sanitizes record and eggroll payload', () => {
  const payload = {
    profile: { name: 'Imported', avatar: '😀' },
    data: {
      gameRecords: {
        1: {
          attended: 'yes',
          result: 'INVALID',
          section: '123456789012345',
          row: 'ABCDEFGHIJKL',
          seat: 'seat-seat-seat',
          promoCollected: 1,
          who: 'x'.repeat(250),
          food: 'y'.repeat(250),
          notes: 'z'.repeat(1200),
          costTickets: -99,
          costFood: '12.5',
          costParking: -1,
          costMerch: '4.5',
          totalCost: '17.0',
        },
      },
      eggrollLog: {
        key1: {
          logged: true,
          flavor: 'f'.repeat(140),
          rating: 999,
          notes: 'n'.repeat(600),
          date: 'not-a-date',
        },
      },
    },
  };

  const profile = storage.importProfileData(JSON.stringify(payload));
  const data = storage.getUserData(profile.id);
  const record = data.gameRecords['1'];
  const eggroll = data.eggrollLog.key1;

  assert.equal(record.result, '');
  assert.equal(record.section.length <= 10, true);
  assert.equal(record.row.length <= 10, true);
  assert.equal(record.seat.length <= 10, true);
  assert.equal(record.who.length <= 200, true);
  assert.equal(record.food.length <= 200, true);
  assert.equal(record.notes.length <= 1000, true);
  assert.equal(record.costTickets, 0);
  assert.equal(record.costParking, 0);

  assert.equal(eggroll.flavor.length <= 100, true);
  assert.equal(eggroll.rating, 5);
  assert.equal(eggroll.notes.length <= 500, true);
  assert.equal(eggroll.date, '');
});

test('getStorageInfo reports available storage shape', () => {
  const info = storage.getStorageInfo();
  assert.equal(typeof info.available, 'boolean');
  assert.equal(typeof info.usedBytes, 'number');
  assert.equal(info.limitBytes, 5_242_880);
});
