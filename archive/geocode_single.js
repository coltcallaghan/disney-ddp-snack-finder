// geocode_single.js
const fetch = (...args) => import('node-fetch').then(({default: fetch}) => fetch(...args));

(async () => {
  const name = 'Aloha Isle, Walt Disney World, Florida';
  const url = `https://nominatim.openstreetmap.org/search?q=${encodeURIComponent(name)}&format=json&limit=1&addressdetails=0`;
  const res = await fetch(url, {
    headers: { 'User-Agent': 'DisneyGeoScript/1.0 (contact: your-email@example.com)' }
  });
  const text = await res.text();
  try {
    const data = JSON.parse(text);
    if (data.length) {
      console.log({ name: data[0].display_name, lat: data[0].lat, lng: data[0].lon });
    } else {
      console.log('NOT FOUND');
    }
  } catch (e) {
    console.error('Response was not JSON. Raw response:');
    console.error(text);
  }
})();
