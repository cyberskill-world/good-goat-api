const { copyFiles } = require('./build/shared/utils/copy-file');

const sourceDir = 'src';
const destDir = 'build';
const extension = '.graphql';

copyFiles(sourceDir, destDir, extension);

console.log('GraphQL files copied successfully!');
