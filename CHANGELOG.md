
## [5.2.0] - 2024-10-03
### Changed
- **Breaking change** Drop support of Node.js 12. The version [5.1.0](https://github.com/reportportal/agent-js-jasmine/releases/tag/v5.1.0) is the latest that supports it.
- The agent now supports reporting the time for launches, test items and logs with microsecond precision in the ISO string format.
For logs, microsecond precision is available on the UI from ReportPortal [version 24.2](https://reportportal.io/docs/releases/Version24.2/#:~:text=import%20plugin.-,Microseconds,-added%20to%20timestamps).
- `@reportportal/client-javascript` bumped to version `5.3.0`.
### Security
- Updated versions of vulnerable packages (micromatch).

## [5.1.0] - 2024-07-16
### Added
- Logging link to the launch on its finish now available by default.
### Changed
- **Breaking change** Drop support of Node.js 10. The version [5.0.3](https://github.com/reportportal/agent-js-jasmine/releases/tag/v5.0.3) is the latest that supports it.
- `@reportportal/client-javascript` bumped to version `5.1.4`, new `launchUuidPrintOutput` types introduced: 'FILE', 'ENVIRONMENT'.
### Security
- Updated versions of vulnerable packages (braces).
### Deprecated
- Node.js 12 usage. This minor version is the latest that supports Node.js 12.

## [5.0.3] - 2024-01-19
### Changed
- `@reportportal/client-javascript` bumped to version `5.0.15`, `launchUuidPrint` and `launchUuidPrintOutput` configuration options introduced.
### Deprecated
- Node.js 10 usage. This minor version is the latest that supports Node.js 10.
### Fixed
- [#86](https://github.com/reportportal/agent-js-jasmine/issues/86) `DEBUG` mode has no effect.

## [5.0.2] - 2023-07-20
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
