const ClientPublicReportingAPI = require('reportportal-client/lib/publicReportingAPI');
const PublicReportingAPI = require('../lib/publicReportingAPI');

describe('PublicReportingAPI', function() {
    it('should call clientPublicReportingApi.addAttributes method with attributes and undefined as parameter, if suite doesn\'t set', function() {
        spyOn(ClientPublicReportingAPI, 'addAttributes').and.returnValue(() => {});

        PublicReportingAPI.addAttributes([{ key: 'key', value: 'value' }]);

        expect(ClientPublicReportingAPI.addAttributes).toHaveBeenCalledWith([{ key: 'key', value: 'value' }], undefined);
    });

    it('should call clientPublicReportingApi.addAttributes method with attributes and suite as parameter', function() {
        spyOn(ClientPublicReportingAPI, 'addAttributes').and.returnValue(() => {});

        PublicReportingAPI.addAttributes([{ key: 'key', value: 'value' }], 'suite');

        expect(ClientPublicReportingAPI.addAttributes).toHaveBeenCalledWith([{ key: 'key', value: 'value' }], 'suite');
    });

    it('should call clientPublicReportingApi.setDescription method with text and undefined as parameters, if suite doesn\'t set', function() {
        spyOn(ClientPublicReportingAPI, 'setDescription').and.returnValue(() => {});

        PublicReportingAPI.setDescription('text');

        expect(ClientPublicReportingAPI.setDescription).toHaveBeenCalledWith('text', undefined);
    });

    it('should call clientPublicReportingApi.setDescription method with text and suite as parameters', function() {
        spyOn(ClientPublicReportingAPI, 'setDescription').and.returnValue(() => {});

        PublicReportingAPI.setDescription('text', 'suite');

        expect(ClientPublicReportingAPI.setDescription).toHaveBeenCalledWith('text', 'suite');
    });
});
