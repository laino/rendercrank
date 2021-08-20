const path = require('path');
const webpack = require('webpack');

const mode = process.env['NODE_ENV'] || 'development';

const devtool = {
    'development': 'eval',
    'production': 'source-map'
}[mode];

module.exports = {
    entry: './index.ts',
    mode,
    devtool,
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
