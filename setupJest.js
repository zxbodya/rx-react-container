/* eslint-disable @typescript-eslint/no-var-requires */
// setup file
const { configure } = require('enzyme');
const Adapter = require('enzyme-adapter-react-17-updated');

configure({ adapter: new Adapter() });
