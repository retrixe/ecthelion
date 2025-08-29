module.exports = {
  output: process.env.NEXT_OUTPUT,
  basePath: require('./config.json').basePath || '',
}
