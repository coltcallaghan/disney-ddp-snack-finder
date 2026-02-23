// geocode_single_photon.js
const fetch = (...args) => import('node-fetch').then(({default: fetch}) => fetch(...args));

(async () => {
  const name = 'Aloha Isle';
  const url = `https://photon.komoot.io/api/?q=${encodeURIComponent(name)}&limit=1`;
  const res = await fetch(url);
  const text = await res.text();
  try {
    const data = JSON.parse(text);
    if (data.features && data.features.length) {
      const feat = data.features[0];
      console.log({ name: feat.properties.name, lat: feat.geometry.coordinates[1], lng: feat.geometry.coordinates[0] });
    } else {
      console.log('NOT FOUND');
    }
  } catch (e) {
    console.error('Response was not JSON. Raw response:');
    console.error(text);
  }
})();
