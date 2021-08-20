const path = require('path');
const webpack = require('webpack');

module.exports = {
    entry: './lib/index.ts',
    mode: 'development',
    module: {
        rules: [
            {
                test: /\.tsx?$/,
                use: 'ts-loader',
                exclude: /node_modules/,
            },
        ],
    },
    resolve: {
        extensions: ['.tsx', '.ts', '.js'],
    },
    output: {
        filename: 'rendercrank.js',
        path: path.resolve(__dirname, 'build'),
        library: {
            name: 'RenderCrank',
            type: 'umd'
        }
    }
};