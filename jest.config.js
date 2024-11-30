module.exports = {
  transformIgnorePatterns: [
    "node_modules/(?!(axios|@axios)/.*)"
  ],
  transform: {
    '^.+\\.(js|jsx|ts|tsx)$': 'babel-jest',
  },
  moduleNameMapper: {
    '^axios$': require.resolve('axios'),
  }
}; 