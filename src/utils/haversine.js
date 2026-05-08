export function calculateSpeed(pos1, pos2, timeDiffSeconds) {
  const R = 6371; // Earth's radius in km [cite: 3]
  const toRad = (deg) => deg * (Math.PI / 180); // [cite: 4]
  const dLat = toRad(pos2.lat - pos1.lat); // [cite: 5, 7]
  const dLon = toRad(pos2.lng - pos1.lng); // [cite: 6, 8]
  const a = Math.sin(dLat / 2) * Math.sin(dLat / 2) + 
            Math.cos(toRad(pos1.lat)) * Math.cos(toRad(pos2.lat)) * Math.sin(dLon / 2) * Math.sin(dLon / 2); // [cite: 9, 10, 11]
  const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a)); // [cite: 12]
  const distance = R * c; // distance in km [cite: 13]
  const speedKmh = (distance / timeDiffSeconds) * 3600; // [cite: 14]
  return speedKmh; // [cite: 15]
}
