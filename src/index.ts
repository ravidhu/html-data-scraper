export * from './interfaces/CustomConfigurations';
export * from './interfaces/PageResult';

import * as os from 'os';
import defaultConfiguration from './configurations/defaultConfiguration';
import initBrowser from './library/initBrowser';
import CustomConfigurations from './interfaces/CustomConfigurations';
import PageResult from './interfaces/PageResult';

export default function htmlDataScraper(
    urls: string[],
    customConfigurations: CustomConfigurations|null = null
): Promise<PageResult[]> {
    
    if (urls.length === 0) return Promise.reject(new Error('urlListIsEmpty'));
    
    if (customConfigurations === null) {
        customConfigurations = {};
    }

    const configuration: CustomConfigurations = {
        ...defaultConfiguration,
        ...customConfigurations,
    };
    
    if (!customConfigurations.hasOwnProperty('maxSimultaneousBrowser')){
        const cpuCoreCount = os.cpus().length;
        configuration.maxSimultaneousBrowser = cpuCoreCount > 2 ? cpuCoreCount - 1 : 1;
    }

    if (!configuration.maxSimultaneousBrowser) return Promise.reject(new Error('maxSimultaneousBrowserNotSet'));

    const urlSets = [];
    const urlCountPerSet = Math.ceil(urls.length / configuration.maxSimultaneousBrowser);

    for (let i = 0; i < urls.length; i += urlCountPerSet) {
        urlSets.push(
            urls.slice(i, i + urlCountPerSet)
        );
    }

    const urlSetsProcess = urlSets.map((urlSet: string[], index) => {
        return initBrowser(urlSet, configuration, index);
    });

    return Promise.all(urlSetsProcess).then(results => results.reduce((acc, current) => {
        acc.push(...current);
        return acc;
    }, []));

};