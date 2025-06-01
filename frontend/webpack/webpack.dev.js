const webpack = require("webpack");

module.exports = {
  mode: "development",
  devtool: 'eval-source-map',
  devServer: {
    historyApiFallback: true,
    hot: true,
    open: true,
    port: 8081,
  },
  plugins: [
    new webpack.DefinePlugin({
      'process.env': JSON.stringify(
        Object.fromEntries(
          Object.entries(process.env).filter(([key]) => key.startsWith('REACT_APP_'))
        )
      )
    }),
  ],
  stats: {
    all: false,
    errors: true, // Mostra apenas os erros
    errorDetails: true, // Exibe detalhes dos erros
    warnings: true, // Opcional: exibe avisos
  },
};