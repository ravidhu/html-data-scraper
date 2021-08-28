import {
    LaunchOptions,
    Page,
    EvaluateFn,
    BrowserLaunchArgumentOptions, BrowserConnectOptions,
    HTTPRequest, WaitForOptions,
} from 'puppeteer';

type OnProgressFunction = (
    resultNumber: number,
    totalNumber: number,
    internalBrowserIndex: number
) => void;

type OnRawHtmlForEachUrlLoadFunction = (page: Page, currentUrl: string) => any;

export interface PuppeteerBrowserOptions extends LaunchOptions, BrowserLaunchArgumentOptions, BrowserConnectOptions{}

export default interface CustomConfigurations {
    maxSimultaneousBrowser?: number;
    additionalWaitSeconds?: number;
    puppeteerOptions?: {
        browser?: PuppeteerBrowserOptions;
        pageGoTo?: WaitForOptions;
    };
    onPageRequest?: (request: HTTPRequest) => void;
    onPageLoadedForEachUrl?: OnRawHtmlForEachUrlLoadFunction | null;
    onEvaluateForEachUrl?: null | {
        [k: string]: EvaluateFn;
    };
    onProgress?: OnProgressFunction | null;
}
