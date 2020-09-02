import {NavigationOptions, Page} from 'puppeteer';

import CustomConfigurations from '../interfaces/CustomConfigurations';
import PageResult from '../interfaces/PageResult';

export default async function pageProcess(
    url: string,
    page: Page,
    configuration: CustomConfigurations
): Promise<PageResult> {

    const pageOptions: NavigationOptions|undefined = configuration.puppeteerOptions && configuration.puppeteerOptions.pageGoTo
        ? configuration.puppeteerOptions.pageGoTo
        : undefined;

    await page.goto(url, pageOptions);

    const result: PageResult = {
        rawHtml: '',
        evaluates: null,
    };

    try {

        if (configuration.additionalWaitSeconds){
            await page.waitFor(configuration.additionalWaitSeconds * 1000);
        }

        if (!configuration.noRawHtml){
            result.rawHtml = await page.content();

            if (configuration.onRawHtmlForEachUrlLoad){
                configuration.onRawHtmlForEachUrlLoad(result.rawHtml);
            }
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