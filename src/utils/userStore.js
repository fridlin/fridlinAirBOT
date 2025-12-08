const store = new Map();
const TTL = 10 * 60 * 1000; // 10 minutes

function setUserData(userId, data) {
  store.set(userId, {
    data,
    timestamp: Date.now(),
  });
}

function getUserData(userId) {
  const entry = store.get(userId);
  if (!entry) return null;

  // Check TTL
  if (Date.now() - entry.timestamp > TTL) {
    store.delete(userId);
    return null;
  }

  return entry.data;
}

// Auto-clean every 1 minute
setInterval(() => {
  const now = Date.now();
  for (const [userId, entry] of store.entries()) {
    if (now - entry.timestamp > TTL) {
      store.delete(userId);
    }
  }
}, 60 * 1000);

module.exports = { setUserData, getUserData };
