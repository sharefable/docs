module.exports = {
  presets: [
    ["@babel/preset-env", { targets: { esmodules: false, node: "current" } } ],
    "@babel/preset-typescript"
  ],
  plugins: [
    "@babel/plugin-transform-modules-commonjs",
    ["@babel/plugin-proposal-decorators", { legacy: true }],
    "@babel/plugin-proposal-class-properties",
    "@babel/plugin-transform-private-methods"
  ]
};
