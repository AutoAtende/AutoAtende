const path = require("path");
const HtmlWebpackPlugin = require("html-webpack-plugin");
const dotenv = require("dotenv");
const webpack = require("webpack");
const CopyPlugin = require('copy-webpack-plugin');
const { CleanWebpackPlugin } = require('clean-webpack-plugin');

dotenv.config();

module.exports = {
    entry: path.resolve(__dirname, "..", "./src/index.jsx"),
    resolve: {
        extensions: [".tsx", ".ts", ".js", ".jsx", ".mjs"],
        alias: {
            "react/jsx-dev-runtime.js": "react/jsx-dev-runtime",
            "react/jsx-runtime.js": "react/jsx-runtime",
        },
        // Adicionar fallbacks para polyfills
        fallback: {
            "buffer": require.resolve("buffer/"),
            "stream": require.resolve("stream-browserify"),
            "crypto": require.resolve("crypto-browserify"),
            "process": require.resolve("process/browser"),
            "zlib": require.resolve("browserify-zlib"),
            "util": require.resolve("util/"),
            "assert": require.resolve("assert/"),
            "fs": false,
            "tls": false,
            "net": false,
            "path": false,
            "os": false,
            "http": require.resolve("stream-http"),
            "https": require.resolve("https-browserify"),
            "constants": false
        }
    },
    module: {
        strictExportPresence: false,
        rules: [
            {
                test: /\.(js|jsx|ts|tsx)$/,
                exclude: /node_modules/,
                use: {
                    loader: 'babel-loader',
                    options: {
                        presets: [
                            ['@babel/preset-env', {
                                targets: {
                                    node: 'current'
                                }
                            }],
                            ['@babel/preset-react', {
                                runtime: 'automatic'
                            }]
                        ],
                        plugins: ['@babel/plugin-transform-runtime']
                    }
                },
            },
            {
                test: /\.m?js$/,
                resolve: {
                    fullySpecified: false
                },
            },
            {
                test: /\.css$/,
                use: ["style-loader", "css-loader", "postcss-loader"],
            },
            {
                test: /\.(s(a|c)ss)$/,
                use: ["style-loader", "css-loader", "sass-loader"],
            },
            {
                test: /\.(?:ico|gif|png|jpg|jpeg)$/i,
                type: "asset/resource",
            },
            {
                test: /\.(png|jpe?g|gif|xlsx|mp3|ogg|pdf|zip|wav|flac|m4a|aac|mp4|webm|ogv|avi|mov|wmv|mpg|mpeg|3gp|flv|mkv|ts|m3u8|doc|docx|xls|ppt|pptx|txt|csv|xml)$/i,
                type: "asset/resource",
            },
            {
                test: /\.(woff(2)?|eot|ttf|otf|svg|)$/,
                type: "asset/inline",
            },
        ],
    },
    output: {
        path: path.resolve(__dirname, "..", "./build"),
        filename: '[name].[contenthash].js',
        chunkFilename: '[name].[contenthash].chunk.js',
        clean: true,
        publicPath: '/'
    },
    plugins: [
        new CleanWebpackPlugin(),
        new CopyPlugin({
            patterns: [
                { from: "./public/offline.html", to: "." },
                { from: "./public/offline.css", to: "." },
                { from: "./public/service-worker.js", to: "." },
                { from: "./public/manifest.json", to: "." },
                { from: "./public/favicon.ico", to: "." },
                { from: "./public/favicon.png", to: "." },
                { from: "./public/favicon-16x16.png", to: "." },
                { from: "./public/favicon-32x32.png", to: "." },
                { from: "./public/nopicture.png", to: "." },
                { from: "./public/mstile-150x150.png", to: "." },
                { from: "./public/android-chrome-192x192.png", to: "." },
                { from: "./public/apple-touch-icon.png", to: "." },
                { from: path.resolve(__dirname, "..", "./public/assets"), to: "assets/" },
                { from: path.resolve(__dirname, "..", "./public/ogv"), to: "ogv/" }
            ],
        }),
        // Atualizar ProvidePlugin com todos os polyfills necessários
        new webpack.ProvidePlugin({
            process: 'process/browser',
            Buffer: ['buffer', 'Buffer'],
            React: 'react'
        }),
        new webpack.DefinePlugin({
            'process.env': JSON.stringify(
              Object.fromEntries(
                Object.entries(process.env).filter(([key]) => key.startsWith('REACT_APP_'))
              )
            )
          }),
        // Adicionar plugin para polyfills globais
        new webpack.ProvidePlugin({
            process: 'process/browser',
            Buffer: ['buffer', 'Buffer']
        }),
        new HtmlWebpackPlugin({
            alwaysWriteToDisk: true,
            template: path.resolve(__dirname, "..", "./public/index.html"),
            favicon: "./public/favicon.ico",
            filename: "index.html",
            inject: 'body',
            hash: true,
        }),
    ],
    optimization: {
        moduleIds: 'deterministic',
        runtimeChunk: 'single',
        splitChunks: {
            cacheGroups: {
                vendor: {
                    test: /[\\/]node_modules[\\/]/,
                    name: 'vendors',
                    chunks: 'all',
                },
            },
        },
    },
    stats: "errors-only",
};