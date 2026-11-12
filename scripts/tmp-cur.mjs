const url = process.argv[2];
const res = await fetch(url, {
  headers: { 'User-Agent': 'Mozilla/5.0 Chrome/131.0.0.0 Safari/537.36' },
});
const html = await res.text();
const ad = JSON.parse(
  html.match(/<script id="__NEXT_DATA__"[^>]*>([\s\S]*?)<\/script>/)[1]
).props.pageProps.ad;

console.log('ad.price      :', JSON.stringify(ad.price));
console.log('ad.features   :', JSON.stringify(ad.features));
console.log('featuresWithoutCategory:', JSON.stringify(ad.featuresWithoutCategory));
console.log('breadcrumbs   :', JSON.stringify(ad.breadcrumbs));
console.log('imagini       :', ad.images.length);
console.log('toate large urls distincte:', new Set(ad.images.map((i) => i.large)).size);
