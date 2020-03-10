const ClientPublicReportingAPI = require('reportportal-client/lib/publicReportingAPI');

const PublicReportingAPI = {
    addAttributes: (attributes) =>
        ClientPublicReportingAPI.addAttributes(attributes),
    addDescription: (description) =>
        ClientPublicReportingAPI.addDescription(description),
};

module.exports = PublicReportingAPI;