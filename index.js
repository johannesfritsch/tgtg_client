const fetch = require('node-fetch');

const userId = process.env.TGTG_USER_ID;
const userToken = process.env.TGTG_USER_TOKEN;
const gmApiKey = process.env.GM_API_KEY;

const main = async () => {
  const geocodeResponse = await fetch(`https://maps.googleapis.com/maps/api/geocode/json?address=${process.argv[2]}&key=${gmApiKey}`);
  if (geocodeResponse.status > 300) throw new Error('could not get geocode response');
  const geocode = await geocodeResponse.json();

  if (geocode.results.length < 1) throw new Error('could not get geocode response');

  const geocodeResults = geocode.results[0].geometry.location;

  const bearerToken = Buffer.from(`ACCESS:${userId}:${userToken}`).toString('base64');
  console.log('bearerToken:', bearerToken);
  const response = await fetch(`https://apptoogoodtogo.com/index.php/api_tgtg/list_businessv5`, {
    method: 'POST',
    headers: {
      'accept': 'application/json',
      'content-type': 'application/x-www-form-urlencoded; charset=utf-8',
      'accept-language': 'de-DE;q=1.0, en-DE;q=0.9',
      'user-agent': 'TooGoodToGo/18.12.1 (637) (iPhone/Unknown; iOS 12.1; Scale/3.00)',
      'authorization': `Bearer ${bearerToken}`,
    },
    body: `category=0&filter_end=24%3A00%3A00&filter_start=00%3A00%3A00&filter_type=1&isOnline=0&is_favorite=0&latitude=${geocodeResults.lat}&limit=20&localtime=14%3A20%3A06&longitude=${geocodeResults.lng}&page_no=1&user_id=${userId}&user_token=${userToken}`,
    compress: true,
  });

  const json = await response.json();

  console.log('json', JSON.stringify(json, undefined, 2));

  for(const business of json.info) {
    console.log('-', business['business_name']);
  }
}

main();
