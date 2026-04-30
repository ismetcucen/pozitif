const fetch = require('node-fetch');
async function test() {
  const apiKey = 'AIzaSyBdlSqug3kSptlBQdswS6n34zV-gXOAvUc';
  const url = "https://generativelanguage.googleapis.com/v1beta/models?key=" + apiKey;
  try {
    const res = await fetch(url);
    const data = await res.json();
    console.log(JSON.stringify(data, null, 2));
  } catch (err) {
    console.error(err);
  }
}
test();
