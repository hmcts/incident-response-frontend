const path = require('path');
const CopyWebpackPlugin = require('copy-webpack-plugin');

const allJs = require.resolve('govuk-frontend');

const root = path.resolve(allJs, '..');
const sass = path.resolve(root, 'all.scss');
const javascript = allJs;
const components = path.resolve(root, 'components');
const assets = path.resolve(root, 'assets');
const images = path.resolve(assets, 'images');
const fonts = path.resolve(assets, 'fonts');

const copyGovukTemplateAssets = new CopyWebpackPlugin({
  patterns: [
  { from: images, to: 'assets/images' },
  { from: fonts, to: 'assets/fonts' },
]});

module.exports = {
  paths: { template: root, components, sass, javascript, assets },
  plugins: [copyGovukTemplateAssets],
};
