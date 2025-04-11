// This script sets the NODE_ENV and runs the app
process.env.NODE_ENV = 'development';
// Use the proper path separator based on the platform
const path = require('path');
const serverPath = path.join('server', 'index.ts');
require('tsx/dist/cli').main([serverPath]);