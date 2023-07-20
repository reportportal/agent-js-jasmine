### Fixed
- Send error logs only in case when the test case has been marked as `failed` by the test runner.
### Changed
- `token` configuration option was renamed to `apiKey` to maintain common convention.
- `@reportportal/client-javascript` bumped to version `5.0.12`.
- Readme file updated.

## [5.0.1] - 2023-04-18
### Fixed
- Potential security vulnerabilities in dependencies.
- [#64](https://github.com/reportportal/agent-js-jasmine/issues/64) Fixed error when cannot read property 'replace' of undefined while iterating over describe block
- [#69](https://github.com/reportportal/agent-js-jasmine/issues/69) Fixed error `Value is not allowed for field 'status'`. Thanks to [NanoTechnolog3000](https://github.com/NanoTechnolog3000)

### Changed
- Package size reduced

## [5.0.0] - 2020-06-18
### Added
- Full compatibility with ReportPortal version 5.* (see [reportportal releases](https://github.com/reportportal/reportportal/releases))

### Deprecated
- Previous package version (`reportportal-agent-jasmine`) will no longer supported by reportportal.io
