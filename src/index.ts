import os from 'os';
import initBrowser from './library/initBrowser';
import CustomConfigurations from './interfaces/CustomConfigurations';
import PageResult from './interfaces/PageResult';

const cpuCount = os.cpus().length;

export default function htmlDataScraper(
    urls: string[] = [],
    customConfigurations: CustomConfigurations|Record<any, any> = {}
): Promise<PageResult[]> {
    
    if (urls.length === 0) return Promise.reject(new Error('NO_URLS'));

    const configuration: CustomConfigurations = {
        simultaneousBrowser     : cpuCount > 2 ? cpuCount - 1 : 1,
        additionalWaitSeconds   : 1,
        noRawHtml               : false,
        puppeteerOptions        : {
            browser : {
                args : [
                    '--no-sandbox',
                    '--disable-setuid-sandbox',
                    '--disable-dev-shm-usage',
                    '--shm-size=1gb',
                ],
            },
            pageGoTo : { waitUntil: 'networkidle2' },
        },
        onRawHtmlForEachUrlLoad : null,
        onEvaluateForEachUrl    : null,
        onProgress              : null,
        ...customConfigurations,
    };

    const urlSets = [];
    const urlCountPerSet = Math.ceil(urls.length / (configuration.simultaneousBrowser || 1));

    for (let i = 0; i < urls.length; i += urlCountPerSet) {
        urlSets.push(
            urls.slice(i, i + urlCountPerSet)
        );
    }

    const urlSetsProcess = urlSets.map((urlSet: string[], index) => {
        return initBrowser(urls, configuration, index);
    });

    return Promise.all(urlSetsProcess).then(results => results.reduce((acc, current) => {
        acc.push(...current);
        return acc;
    }, []));

};