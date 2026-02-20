const cache = new Map();

const set = (key, value, ttlMs = 300000) => {
  cache.set(key, { value, expiry: Date.now() + ttlMs });
};

const get = (key) => {
  const entry = cache.get(key);
  if (!entry) return null;
  if (Date.now() > entry.expiry) { cache.delete(key); return null; }
  return entry.value;
};

const del = (key) => cache.delete(key);
const clear = () => cache.clear();

module.exports = { set, get, del, clear };