import {EvaluateForEachUrlConfigurations} from './EvaluateForEachUrl';
import {LaunchOptions, ChromeArgOptions, BrowserOptions, NavigationOptions, Page} from 'puppeteer';

type OnProgressFunction = (
    resultNumber: number,
    totalNumber: number,
    internalBrowserIndex: number
) => void;

type OnRawHtmlForEachUrlLoadFunction = (page: Page, currentUrl: string) => any;

export interface PuppeteerBrowserOptions extends LaunchOptions, ChromeArgOptions, BrowserOptions{}

export default interface CustomConfigurations {
    maxSimultaneousBrowser?: number;
    additionalWaitSeconds?: number;
    puppeteerOptions?: {
        browser?: PuppeteerBrowserOptions;
        pageGoTo?: NavigationOptions;
    };
    onPageLoadedForEachUrl?: OnRawHtmlForEachUrlLoadFunction | null;
    onEvaluateForEachUrl?: EvaluateForEachUrlConfigurations | null;
    onProgress?: OnProgressFunction | null;
}