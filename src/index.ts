import os from 'os';
import initBrowser from './library/initBrowser';
import CustomConfigurations from './interfaces/CustomConfigurations';
import PageResult from './interfaces/PageResult';

const cpuCoreCount = os.cpus().length;

export default function htmlDataScraper(
    urls: string[],
    customConfigurations: CustomConfigurations|undefined
): Promise<PageResult[]> {
    
    if (urls.length === 0) return Promise.reject(new Error('urlListIsEmpty'));

    const configuration: CustomConfigurations = {
        maxSimultaneousBrowser  : cpuCoreCount > 2 ? cpuCoreCount - 1 : 1,
        additionalWaitSeconds   : 1,
        puppeteerOptions        : {
            browser : {
                args : [
                    '--no-sandbox',
                    '--disable-setuid-sandbox',
                    '--disable-dev-shm-usage',
                ],
            },
            pageGoTo : { waitUntil: 'networkidle2' },
        },
        ...customConfigurations,
    };

    if (!configuration.maxSimultaneousBrowser) return Promise.reject(new Error('maxSimultaneousBrowserNotSet'));

    const urlSets = [];
    const urlCountPerSet = Math.ceil(urls.length / configuration.maxSimultaneousBrowser);

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