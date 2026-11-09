/* eslint-disable no-undef */
/// <reference path="./types/index.d.ts" />
require("global-jsdom/register")

// const { JSDOM } = require('jsdom');

// const dom = new JSDOM('', {
//   url: 'http://localhost'
// });
// Object.assign(globalThis, {
//   window: dom.window,
//   document: dom.window.document,
//   localStorage: dom.window.localStorage
// });

exports.mochaGlobalSetup = async function () {
  // // fixtures can go here
  // this.server = await startSomeServer({ port: process.env.TEST_PORT });
  // console.log(`server running on port ${this.server.port}`);
};
