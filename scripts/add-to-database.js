const fs = require('fs');

// Read the properties
const allProperties = JSON.parse(fs.readFileSync('/tmp/all_storia_properties.json', 'utf8'));

// Deduplicate by title
const uniqueProperties = [];
const seenTitles = new Set();

allProperties.forEach(prop => {
  if (!seenTitles.has(prop.title)) {
    seenTitles.add(prop.title);
    uniqueProperties.push(prop);
  }
});

console.log(`Original: ${allProperties.length} properties`);
console.log(`After deduplication: ${uniqueProperties.length} unique properties\n`);

// Function to add property via API
async function addProperty(property) {
  const http = require('http');

  return new Promise((resolve, reject) => {
    const postData = JSON.stringify(property);

    const options = {
      hostname: 'localhost',
      port: 3000,
      path: '/api/properties',
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Content-Length': Buffer.byteLength(postData)
      }
    };

    const req = http.request(options, (res) => {
      let data = '';

      res.on('data', (chunk) => {
        data += chunk;
      });

      res.on('end', () => {
        if (res.statusCode === 200 || res.statusCode === 201) {
          resolve(JSON.parse(data));
        } else {
          reject(new Error(`HTTP ${res.statusCode}: ${data}`));
        }
      });
    });

    req.on('error', (error) => {
      reject(error);
    });

    req.write(postData);
    req.end();
  });
}

// Main function to add all properties
async function main() {
  console.log('Adding properties to database...\n');

  let successful = 0;
  let failed = 0;

  for (let i = 0; i < uniqueProperties.length; i++) {
    const prop = uniqueProperties[i];
    try {
      console.log(`${i + 1}/${uniqueProperties.length} Adding: ${prop.title.substring(0, 50)}...`);
      const result = await addProperty(prop);
      console.log(`   ✓ Success! ID: ${result.id}\n`);
      successful++;

      // Delay to avoid overwhelming the API
      await new Promise(resolve => setTimeout(resolve, 500));
    } catch (error) {
      console.log(`   ✗ Failed: ${error.message}\n`);
      failed++;
    }
  }

  console.log('\n=== Summary ===');
  console.log(`Total processed: ${uniqueProperties.length}`);
  console.log(`Successful: ${successful}`);
  console.log(`Failed: ${failed}`);
}

// Run
main().catch(console.error);
