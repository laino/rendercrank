const path = require('path');

module.exports = {
    entry: './lib/index.ts',
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
    },
};
