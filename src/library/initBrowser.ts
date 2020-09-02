import puppeteer from 'puppeteer';
import controlledPromiseList, {PromiseFunction} from 'controlled-promise-list';

import PageResult from '../interfaces/PageResult';
import CustomConfigurations, {PuppeteerBrowserOptions} from '../interfaces/CustomConfigurations';
import pageProcessor from './pageProcessor';

export default async function initBrowser(
    urls: string[] = [],
    configuration: CustomConfigurations = {},
    internalBrowserIndex = 0
): Promise<PageResult[]> {

    const browserOptions: PuppeteerBrowserOptions|undefined = configuration.puppeteerOptions && configuration.puppeteerOptions.browser
        ? configuration.puppeteerOptions.browser
        : undefined;

    const browser = await puppeteer.launch(browserOptions);

    const page = await browser.newPage();

    try {

        if (!urls || urls.length === 0) throw new Error('NO_URLS');

        const results: PageResult[] = [];

        try {

            const promisesReadyToExecute: PromiseFunction[] = urls.map((url: string) => {
                return (resolve: any, reject: any): void => {
                    pageProcessor(url, page, configuration).then(resolve).catch(reject);
                };
            });

            results.push(
                ...await controlledPromiseList(
                    promisesReadyToExecute,
                    1,
                    (responsesNumber: number, totalNumber: number) => {
                        if (configuration.onProgress) {
                            configuration.onProgress(responsesNumber, totalNumber, internalBrowserIndex);
                        }
                    }
                )
            );

        } catch (error) {

            await page.close();
            await browser.close();

            throw error;
        }

        await page.close();
        await browser.close();

        return results;

    } catch (error) {
        throw error;
    }
}