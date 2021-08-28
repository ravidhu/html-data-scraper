import {WaitForOptions, Page} from 'puppeteer';

import CustomConfigurations from '../interfaces/CustomConfigurations';
import PageResult from '../interfaces/PageResult';

export default async function pageProcess(
    url: string,
    page: Page,
    configuration: CustomConfigurations
): Promise<PageResult> {

    const pageGoToOptions: WaitForOptions|undefined = (
        configuration.puppeteerOptions
        && configuration.puppeteerOptions.pageGoTo
            ? configuration.puppeteerOptions.pageGoTo
            : undefined
    );


    const result: PageResult = {
        pageData: null,
        evaluates: null,
    };

    try {

        await page.setViewport({
            width: 1920,
            height: 1080,
        });

        await page.goto(url, pageGoToOptions);

        if (configuration.additionalWaitSeconds){
            await page.waitForTimeout(configuration.additionalWaitSeconds * 1000);
        }

        if (configuration.onPageLoadedForEachUrl){
            result.pageData = await configuration.onPageLoadedForEachUrl(page, url);
        } else {
            result.pageData = await page.content();
        }

        if (configuration.onEvaluateForEachUrl){
            const evaluateKeys: string[] = Object.keys(configuration.onEvaluateForEachUrl);
            if (evaluateKeys.length){

                result.evaluates = evaluateKeys.reduce((final: Record<string, null>, current: string): Record<string, null> => {
                    final[current] = null;
                    return final;
                }, {});

                for (let i = 0; i < evaluateKeys.length; i++) {
                    const functionName = evaluateKeys[i];
                    result.evaluates[functionName] = await page.evaluate(configuration.onEvaluateForEachUrl[functionName]);
                }
            }
        }

        return result;

    } catch (error) {
        throw error;
    }

}
