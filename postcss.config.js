const PROD = process.env.NODE_ENV === 'production'

module.exports = {
  plugins: {
    'postcss-import': {},
    'postcss-calc': {},
    'postcss-preset-env': {
      stage: 2,
      features: {
        'custom-media-queries': true,
        'custom-selectors': true
      }
    },
    'postcss-object-fit-images': {},
    'cssnano': PROD ? {} : false
  }
}
