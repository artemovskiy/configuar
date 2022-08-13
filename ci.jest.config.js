const common = require('./jest.config');

/**
 * Jest config for running unit-test in gitlab CI
 * */
module.exports = {
  ...common,
  /**
   * text-summary is for gitlab coverage parser
   * cobertura is for covered/not covered lines highlight in MR diff view
   */
  coverageReporters: ['text-summary', 'text', 'cobertura'],
  /**
   * junit for GitLab test results report
   */
  reporters: ['default', 'jest-junit'],
};
