const config = {
  verbose: true,
  moduleDirectories: ["node_modules"],
  testMatch: ["**/?(*.)+(spec|test).js?(x)"],
  moduleFileExtensions: ["js", "json"],
  transform: {
    "^.+\\.(js|jsx)?$": "babel-jest",
  },
};

module.exports = config;
