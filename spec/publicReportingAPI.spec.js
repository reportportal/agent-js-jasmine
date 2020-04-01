const ClientPublicReportingAPI = require('reportportal-client/lib/publicReportingAPI');
const PublicReportingAPI = require('../lib/publicReportingAPI');

describe('PublicReportingAPI', function() {
    it('should call clientPublicReportingApi.addAttributes method with attributes as parameter', function() {
        spyOn(ClientPublicReportingAPI, 'addAttributes').and.returnValue(() => {});

        PublicReportingAPI.addAttributes([{ key: 'key', value: 'value' }]);

        expect(ClientPublicReportingAPI.addAttributes).toHaveBeenCalledWith([{ key: 'key', value: 'value' }]);
    });

    it('should call clientPublicReportingApi.addDescription method with text and undefined as parameters, if suite doesn\'t set', function() {
        spyOn(ClientPublicReportingAPI, 'addDescription').and.returnValue(() => {});

        PublicReportingAPI.setDescription('text');

        expect(ClientPublicReportingAPI.addDescription).toHaveBeenCalledWith('text', undefined);
    });

    it('should call clientPublicReportingApi.addDescription method with text and suite as parameters', function() {
        spyOn(ClientPublicReportingAPI, 'addDescription').and.returnValue(() => {});

        PublicReportingAPI.setDescription('text', 'suite');

        expect(ClientPublicReportingAPI.addDescription).toHaveBeenCalledWith('text', 'suite');
    });
});
