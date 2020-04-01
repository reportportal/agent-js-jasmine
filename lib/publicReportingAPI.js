const ClientPublicReportingAPI = require('reportportal-client/lib/publicReportingAPI');

const PublicReportingAPI = {
    addAttributes: (attributes) =>
        ClientPublicReportingAPI.addAttributes(attributes),
    setDescription: (text, suite) =>
        ClientPublicReportingAPI.addDescription(text, suite),
};

module.exports = PublicReportingAPI;