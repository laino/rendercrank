const path = require('path');
const webpack = require('webpack');

const mode = process.env['NODE_ENV'] || 'development';

module.exports = {
    entry: './index.ts',
    mode,
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
        filename: `rendercrank.${mode}.js`,
        path: path.resolve(__dirname, 'build'),
        library: {
            name: 'RenderCrank',
            type: 'umd'
        }
    }
};
