import puppeteer, {Browser} from 'puppeteer';
import CustomConfigurations, {PuppeteerBrowserOptions} from '../interfaces/CustomConfigurations';

let browser:Browser = null;
let currentBrowserOptions: PuppeteerBrowserOptions | undefined = undefined;

export default async function initBrowser(
    configuration: CustomConfigurations,
): Promise<Browser> {

    const browserOptions: PuppeteerBrowserOptions|undefined = configuration.puppeteerOptions && configuration.puppeteerOptions.browser
        ? configuration.puppeteerOptions.browser
        : undefined;

    const configurationIsSame = JSON.stringify({c:browserOptions}) === JSON.stringify({c:currentBrowserOptions});

    if (configurationIsSame && browser) {
        return Promise.resolve(browser);
    }

    currentBrowserOptions = browserOptions;
    browser = await puppeteer.launch(browserOptions);

    browser.on('disconnected', () => {
        browser = null;
        currentBrowserOptions = undefined;
    });

    return Promise.resolve(browser);
}
