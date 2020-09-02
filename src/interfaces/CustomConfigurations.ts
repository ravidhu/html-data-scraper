import {EvaluateForEachUrlConfigurations} from './EvaluateForEachUrl';
import {LaunchOptions, ChromeArgOptions, BrowserOptions, NavigationOptions} from 'puppeteer';

type OnProgressFunction = (
    resultNumber: number,
    totalNumber: number,
    internalBrowserIndex: number
) => void;

type OnRawHtmlForEachUrlLoadFunction = (rawHtml: string) => void;

export interface PuppeteerBrowserOptions extends LaunchOptions, ChromeArgOptions, BrowserOptions{}

export default interface CustomConfigurations {
    simultaneousBrowser?: number;
    additionalWaitSeconds?: number;
    noRawHtml?: boolean;
    puppeteerOptions?: {
        browser?: PuppeteerBrowserOptions;
        pageGoTo?: NavigationOptions;
    };
    onRawHtmlForEachUrlLoad?: OnRawHtmlForEachUrlLoadFunction | null;
    onEvaluateForEachUrl?: EvaluateForEachUrlConfigurations | null;
    onProgress?: OnProgressFunction | null;
}