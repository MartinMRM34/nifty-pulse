const https = require('https');

async function testLiveFetch() {
  console.log("--- Testing G-Sec Live Fetcher ---");
  
  const url = "https://tradingeconomics.com/india/government-bond-yield";
  const options = {
    headers: {
      "User-Agent": "Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/91.0.4472.114 Safari/537.36",
    }
  };

  https.get(url, options, (res) => {
    let data = '';
    res.on('data', (chunk) => { data += chunk; });
    res.on('end', () => {
      console.log(`HTTP Status: ${res.statusCode}`);
      
      const match = data.match(/"value":\s*([0-9]\.[0-9]{2,4})/i) || 
                    data.match(/TEForecast\s*=\s*\[\s*([0-9]\.[0-9]{2,4})/i) ||
                    data.match(/"last":\s*([0-9]\.[0-9]{2,4})/i) ||
                    data.match(/India 10Y Bond Yield was ([0-9]\.[0-9]{2,3})/i);

      if (match && match[1]) {
        console.log(`SUCCESS! Extracted Yield: ${match[1]}%`);
      } else {
        console.log("FAILED! No match found in HTML.");
        // Log a snippet for debugging if it fails
        console.log("HTML Snippet:", data.substring(0, 500));
      }
    });
  }).on('error', (err) => {
    console.error("Fetch Error:", err.message);
  });
}

testLiveFetch();
