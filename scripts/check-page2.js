const fs = require('fs');

// Read page 2 data
const page2Data = JSON.parse(fs.readFileSync('/tmp/storia_page2_new.json', 'utf8'));
const items = page2Data.props.pageProps.searchAds.items || [];

console.log(`Found ${items.length} properties on page 2:\n`);

items.forEach((item, index) => {
  console.log(`${index + 1}. ${item.title}`);
  console.log(`   ID: ${item.id}`);
  console.log(`   Type: ${item.estate} | Transaction: ${item.transaction}`);
  console.log(`   Price: €${item.totalPrice?.value || item.rentPrice?.value || 0}`);
  console.log(`   Area: ${item.areaInSquareMeters}m²`);
  console.log('');
});

// Save item IDs to compare with page 1
const itemIds = items.map(item => item.id);
console.log('Item IDs:', itemIds.join(', '));
