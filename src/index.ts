export * from './interfaces/CustomConfigurations';
export * from './interfaces/PageResult';

import * as os from 'os';
import {Browser} from 'puppeteer';
import defaultConfiguration from './configurations/defaultConfiguration';
import initBrowser from './library/initBrowser';
import initPage from './library/initPage';
import CustomConfigurations from './interfaces/CustomConfigurations';
import PageResult from './interfaces/PageResult';

export * from './library/initBrowser';

export default async function htmlDataScraper(
    urls: string[],
    customConfigurations: CustomConfigurations|null = null,
    customBrowser: Browser = null
): Promise<{results:PageResult[], browserInstance: Browser}> {

    if (urls.length === 0) return Promise.reject(new Error('urlListIsEmpty'));

    if (customConfigurations === null) {
        customConfigurations = {};
    }

    const configuration: CustomConfigurations = {
        ...defaultConfiguration,
        ...customConfigurations,
    };

    if (!customConfigurations.hasOwnProperty('maxSimultaneousPages')){
        const cpuCoreCount = os.cpus().length;
        configuration.maxSimultaneousPages = cpuCoreCount > 2 ? cpuCoreCount - 1 : 1;
    }

    if (!configuration.maxSimultaneousPages) return Promise.reject(new Error('maxSimultaneousPagesNotSet'));

    const urlSets = [];
    const urlCountPerSet = Math.ceil(urls.length / configuration.maxSimultaneousPages);

    for (let i = 0; i < urls.length; i += urlCountPerSet) {
        urlSets.push(
            urls.slice(i, i + urlCountPerSet)
        );
    }

    const browser = customBrowser ? customBrowser : await initBrowser(configuration);

    const urlSetsProcess = urlSets.map((urlSet: string[], index) => {
        return initPage(urlSet, browser, configuration, index);
    });

    const results = await Promise.all(urlSetsProcess);

    return Promise.resolve(
        {
            results: results.reduce((acc, current) => {
                acc.push(...current);
                return acc;
            }, []),
            browserInstance: browser,
        }
    );

}
