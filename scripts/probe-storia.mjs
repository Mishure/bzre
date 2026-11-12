// Fetches a Storia offer page and pulls the listing out of __NEXT_DATA__,
// without a headless browser. Used to diagnose imports and to confirm the
// field paths the importer relies on.
const url = process.argv[2];
const deep = process.argv.includes('--deep');
if (!url) {
  console.error('usage: node scripts/probe-storia.mjs <storia-url> [--deep]');
  process.exit(1);
}

const res = await fetch(url, {
  headers: {
    'User-Agent':
      'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/131.0.0.0 Safari/537.36',
    'Accept-Language': 'ro-RO,ro;q=0.9',
  },
});
const html = await res.text();
console.log(`HTTP ${res.status}  bytes ${html.length}`);

// Storia adds crossorigin="anonymous" to this tag, so match attributes loosely.
const m = html.match(/<script id="__NEXT_DATA__"[^>]*>([\s\S]*?)<\/script>/);
if (!m) {
  console.log('__NEXT_DATA__ NOT FOUND');
  process.exit(1);
}

const ad = JSON.parse(m[1])?.props?.pageProps?.ad;
if (!ad) {
  console.log('pageProps.ad absent');
  process.exit(1);
}

if (deep) {
  console.log('\n=== chei de nivel 1 pe `ad` ===');
  console.log(Object.keys(ad).join(', '));
  console.log('\n=== target ===');
  console.log(ad.target);
  console.log('\n=== location ===');
  console.log(JSON.stringify(ad.location, null, 2).slice(0, 2500));
  console.log('\n=== category ===');
  console.log(JSON.stringify(ad.category, null, 2));
  console.log('\n=== prima imagine ===');
  console.log(ad.images?.[0]);
  console.log('\n=== featuresByCategory ===');
  console.log(JSON.stringify(ad.featuresByCategory, null, 2)?.slice(0, 1500));
  console.log('\n=== description (primele 300) ===');
  console.log((ad.description ?? '').slice(0, 300));
  process.exit(0);
}

const chars = {};
for (const c of ad.characteristics ?? []) chars[c.key] = c.value ?? c.localizedValue;

console.log('\n=== oferta ===');
console.log('id      :', ad.id);
console.log('title   :', ad.title);
console.log('status  :', ad.status);
console.log('price   :', ad.target?.Price, chars.currency ?? '');
console.log('surface :', ad.target?.Area);
console.log('rooms   :', ad.target?.Rooms_num);
console.log('floor   :', ad.target?.Floor_no);
console.log('coords  :', ad.location?.coordinates);
console.log('images  :', (ad.images ?? []).length);
console.log('\n=== characteristics ===');
console.log(chars);
