(async function () {
  const parserName = process.argv[2];
  const params = {};
  try {
    const parser = require(`./parsers/${parserName}`);
    const data = await parser(params);
    console.log(data);
  } catch (err) {
    console.log(err);
  }
})();
