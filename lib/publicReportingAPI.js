const ClientPublicReportingAPI = require('reportportal-client/lib/publicReportingAPI');

const PublicReportingAPI = {
    addAttributes: (attributes, suite) =>
        ClientPublicReportingAPI.addAttributes(attributes, suite),
    setDescription: (text, suite) =>
        ClientPublicReportingAPI.setDescription(text, suite),
};

module.exports = PublicReportingAPI;