const { getGSecYield } = require('./src/data/market');

async function testFetch() {
  console.log("Testing G-Sec Fetch...");
  const data = await getGSecYield();
  console.log("Result:", data);
}

testFetch();
