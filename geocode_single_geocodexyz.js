// geocode_single_geocodexyz.js
const fetch = (...args) => import('node-fetch').then(({default: fetch}) => fetch(...args));

(async () => {
  const name = 'Aloha Isle, Walt Disney World, Florida';
  const url = `https://geocode.xyz/${encodeURIComponent(name)}?json=1`;
  const res = await fetch(url);
  const text = await res.text();
  try {
    const data = JSON.parse(text);
    if (data.latt && data.longt) {
      console.log({ name: data.standard && data.standard.addresst, lat: data.latt, lng: data.longt });
    } else {
      console.log('NOT FOUND');
    }
  } catch (e) {
    console.error('Response was not JSON. Raw response:');
    console.error(text);
  }
})();
