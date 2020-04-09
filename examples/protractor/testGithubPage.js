const fs = require('fs');
const path = require('path');
const PublicReportingAPI = require('../../lib/publicReportingAPI');

const attachments = [
    {
        filename: 'test.jpg',
        type: 'image/jpg',
    },
    {
        filename: 'test.png',
        type: 'image/png',
    },
    {
        filename: 'test.html',
        type: 'text/html',
    },
    {
        filename: 'test.json',
        type: 'application/json',
    },
    {
        filename: 'test.css',
        type: 'application/css',
    },
    {
        filename: 'test.mp4',
        type: 'video/mp4',
    },
];

describe('github homepage', function() {
    PublicReportingAPI.launchLog('INFO', 'info launch log, github homepage');
    PublicReportingAPI.launchInfo('info launch log');
    PublicReportingAPI.launchDebug('debug launch log');
    PublicReportingAPI.launchTrace('trace launch log');
    PublicReportingAPI.launchWarn('warn launch log');
    PublicReportingAPI.launchError('error launch log');
    PublicReportingAPI.launchFatal('fatal launch log');
    PublicReportingAPI.debug('debug log, github homepage', null, 'github homepage');
    PublicReportingAPI.info('debug log, github homepage', null, 'github homepage');
    PublicReportingAPI.trace('trace log, github homepage', null, 'github homepage');
    PublicReportingAPI.warn('warning, github homepage', null, 'github homepage');
    PublicReportingAPI.error('error log, github homepage', null, 'github homepage');
    PublicReportingAPI.fatal('fatal log, github homepage',null,  'github homepage');

    it('test with logs and attachments', async function() {
        PublicReportingAPI.debug('debug log');
        PublicReportingAPI.trace('trace log');
        PublicReportingAPI.warn('warning');
        PublicReportingAPI.error('error log');
        PublicReportingAPI.fatal('fatal log');
        expect(true).toEqual(true);
        const readFilesPromises = attachments.map(
            ({ filename, type }) =>
                new Promise((resolve) =>
                    fs.readFile(path.resolve(__dirname, './attachments', filename), (err, data) => {
                        if (err) {
                            throw err;
                        }
                        const attachment = {
                            name: filename,
                            type,
                            content: data.toString('base64'),
                        };
                        PublicReportingAPI.info('info log with attachment', attachment);
                        resolve();
                    }),
                ),
        );
        await Promise.all(readFilesPromises);
    });

    it('should have a title', function() {
        browser.get('http://github.com/');
        PublicReportingAPI.info('info log, should have a title');
        expect(browser.getTitle()).toContain('GitHub');
    });
});

