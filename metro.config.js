// Learn more https://docs.expo.dev/guides/customizing-metro
const { getDefaultConfig } = require('expo/metro-config');

/** @type {import('expo/metro-config').MetroConfig} */
const config = getDefaultConfig(__dirname);

// Ensure proper module resolution
config.resolver.sourceExts.push('jsx', 'js', 'ts', 'tsx', 'json');

module.exports = config;

