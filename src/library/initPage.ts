import puppeteer, {Browser} from 'puppeteer';
import controlledPromiseList, {PromiseFunction} from 'controlled-promise-list';

import PageResult from '../interfaces/PageResult';
import CustomConfigurations from '../interfaces/CustomConfigurations';
import pageProcessor from './pageProcessor';

export default async function initPage(
    urls: string[],
    browser: Browser,
    configuration: CustomConfigurations,
    internalPageIndex = 0
): Promise<PageResult[]> {

    if (urls.length === 0) throw new Error('urlListIsEmpty');

    try {

        const context = await browser.createIncognitoBrowserContext();
        const page = await context.newPage();

        if (configuration.onPageRequest){
            await page.setRequestInterception(true);
            page.on('request', configuration.onPageRequest);
        }

        const results: PageResult[] = [];

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
                        configuration.onProgress(responsesNumber, totalNumber, internalPageIndex);
                    }
                }
            )
        );

        await page.close();

        return results;

    } catch (error) {
        throw error;
    }
}
