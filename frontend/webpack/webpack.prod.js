const webpack = require("webpack");
const { SwcMinifyWebpackPlugin } = require('swc-minify-webpack-plugin');

module.exports = {
  mode: "production",
  devtool: 'source-map', // Gera source maps separados para produção
  plugins: [
    new webpack.DefinePlugin({
      'process.env': JSON.stringify(
        Object.fromEntries(
          Object.entries(process.env).filter(([key]) => key.startsWith('REACT_APP_'))
        )
      )
    }),
  ],
  optimization: {
    minimize: true,
    minimizer: [new SwcMinifyWebpackPlugin({
      compress: true,
      mangle: true
  })],
  },
  performance: {
    hints: 'warning', // Avisa sobre assets grandes
    maxAssetSize: 512000, // Tamanho máximo de um asset individual (em bytes)
    maxEntrypointSize: 512000, // Tamanho máximo de um entrypoint (em bytes)
  },
  stats: {
    all: false,
    errors: true, // Mostra apenas os erros
    errorDetails: true, // Exibe detalhes dos erros
    warnings: true, // Opcional: exibe avisos
  },
};