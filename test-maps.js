require('dotenv').config({path: '.env.local'});
const apiKey = process.env.NEXT_PUBLIC_GOOGLE_MAPS_API_KEY;
const lat = 17.6868;
const lng = 83.2185;
const url = `https://maps.googleapis.com/maps/api/geocode/json?latlng=${lat},${lng}&key=${apiKey}`;
fetch(url).then(r => r.json()).then(console.log).catch(console.error);
