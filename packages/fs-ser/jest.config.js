const config = {
  transform: {
    "^.+\\.[t|j]sx?$": "babel-jest"
  },
  transformIgnorePatterns: [],
  moduleNameMapper: {
    "estree-walker": "<rootDir>/node_modules/estree-walker/src/index.js",
    periscopic: "<rootDir>/node_modules/periscopic/src/index.js",
    "is-reference": "<rootDir>/node_modules/is-reference/src/index.js",
  }
};

export default config;
