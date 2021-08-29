import 'mocha';
import * as fs from 'fs';
import { expect } from 'chai';
import {Browser, Page} from 'puppeteer';
import * as puppeteer from 'puppeteer';

import htmlDataScraper from '../src/index';
import initBrowser from "../src/library/initBrowser";
import initPage from '../src/library/initPage';
import pageProcessor from '../src/library/pageProcessor';
import defaultConfiguration from '../src/configurations/defaultConfiguration';
import PageResult from '../src/interfaces/PageResult';

describe('htmlDataScraper',  () => {

    it('No urls',async () => {

        try {
            await htmlDataScraper([], {
                maxSimultaneousPages : 1,
            });
        } catch (error: any){
            expect(error.message).to.equal( 'urlListIsEmpty');
        }

    });

    it('No max simultaneous browser option',async () => {

        try {
            await htmlDataScraper(['https://www.bbc.com'], {
                maxSimultaneousPages : null,
            });
        } catch (error: any){
            expect(error.message).to.equal( 'maxSimultaneousPagesNotSet');
        }

    });

    it('No configuration',async () => {

        const {results}: {results: PageResult[]}  = await htmlDataScraper(['https://www.bbc.com'], null);
        expect(results.length).to.equal( 1);

    });

    it('Get bbc.com screenshot', async () => {

        await htmlDataScraper([
            'https://www.bbc.com',
        ], {
            onPageLoadedForEachUrl: async (page: Page): Promise<null> => {

                await page.screenshot({
                    path: 'test.png', // Image Dimensions : 1920 x 1080
                });

                return null;
            },
        });

        expect(fs.existsSync('test.png')).to.equal(true);
        fs.unlinkSync('test.png');

    });

    it('Get bbc.com title', async () => {

        const {results}: {results: PageResult[]} = await htmlDataScraper([
            'https://www.bbc.com',
        ], {
            onEvaluateForEachUrl: {
                title: (): string => {
                    const titleElement: HTMLElement | null = document.getElementById('page-title');
                    return titleElement ? titleElement.innerText : '';
                },
            },
        });

        const pageResult: PageResult = results[0];

        expect(pageResult.evaluates.title).to.be.an('string');

    });

    it('Get bbc.com title with custom browser', async () => {

        const browser = await initBrowser({});

        const {results}: {results: PageResult[]} = await htmlDataScraper([
            'https://www.bbc.com',
        ], {
            onEvaluateForEachUrl: {
                title: (): string => {
                    const titleElement: HTMLElement | null = document.getElementById('page-title');
                    return titleElement ? titleElement.innerText : '';
                },
            },
        }, browser);

        const pageResult: PageResult = results[0];

        expect(pageResult.evaluates.title).to.be.an('string');

    });

    it('Distribute urls to multiple pages',async () => {

        const progress: Record<string, string[]> = {};

        const urls = [];
        const urlNumber = 7;
        const maxSimultaneousPages = 3;

        for (let i = 0; i < urlNumber; i++) {
            urls.push('https://fr.wikipedia.org/wiki/World_Wide_Web');
        }

        await htmlDataScraper(urls, {
            maxSimultaneousPages,
            onProgress: (resultNumber: number, totalNumber: number, internalPageIndex: number) => {
                const status = resultNumber + '/' + totalNumber;
                if (progress[internalPageIndex]){
                    progress[internalPageIndex].push(status);
                } else {
                    progress[internalPageIndex] = [status];
                }
            },
        });

        expect(progress).to.deep.equal({
            '0': [ '1/3', '2/3', '3/3' ],
            '1': [ '1/3', '2/3', '3/3' ],
            '2': [ '1/1' ],
        });

    });

});

describe('initBrowser', () => {

    it('get new instance', async () => {

        const browser = await initBrowser({});
        expect(browser).to.not.equal(null);

    })

    it('get same instance', async () => {

        const browser1 = await initBrowser({});
        const browser2 = await initBrowser({});
        expect(browser1).to.equal(browser2);

    })

    it('get different instance', async () => {

        const browser1 = await initBrowser({
            puppeteerOptions: {
                browser : {
                    args : [
                        '--no-sandbox',
                    ],
                },
            }
        });
        const browser2 = await initBrowser({});
        expect(browser1).to.not.equal(browser2);
    })

    it('closing the browser set instance to null', async () => {

        const browser = await initBrowser({});
        await browser.close();
        expect(browser.isConnected()).to.equal(false);

    })

})

describe('initPage', () => {

    it('run solo', async () => {

        const progress: string[] = [];

        const browser = await initBrowser({});

        await initPage([
                'https://www.bbc.com',
                'https://www.lemonde.fr',
                'https://fr.wikipedia.org',
            ],
            browser,
            {
                maxSimultaneousPages: 1,
                onProgress: (resultNumber: number, totalNumber: number, internalPageIndex: number) => {
                    progress.push(internalPageIndex + '=>' + resultNumber + '/' + totalNumber);
                },
            }
        );

        expect(progress).to.deep.equal([ '0=>1/3', '0=>2/3', '0=>3/3' ]);

    });

    it('No urls',  async () => {

        try {
            const browser = await initBrowser({});
            await initPage([], browser, {});
        } catch (error: any){
            expect(error.message).to.equal( 'urlListIsEmpty');
        }

    });

    it('run with additional wait seconds (3s)', async () => {

        const browser = await initBrowser({});
        await initPage([
                'https://www.bbc.com',
            ],
            browser,
            {
                additionalWaitSeconds: 3,
            }
        );

    });

    it('onProgress throw error', async () => {

        try {
            const browser = await initBrowser({});
            await initPage([
                    'https://www.bbc.com',
                    'https://www.lemonde.fr',
                    'https://www.lefigaro.fr',
                ],
                browser,
                {
                    maxSimultaneousPages: 1,
                    onProgress: (resultNumber: number, totalNumber: number, internalPageIndex: number) => {
                        throw new Error('test');
                    },
                }
            );
        } catch (error: any){
            expect(error.message).to.equal( 'test');
        }

    });

    it('onPageRequest', async () => {
        let interceptedImageCount = 0;
        const browser = await initBrowser({});
        await initPage([
                'https://www.bbc.com',
            ],
            browser,
            {
                onPageRequest: (interceptedRequest) => {
                    if (
                        interceptedRequest.url().endsWith('.png') ||
                        interceptedRequest.url().endsWith('.jpg')
                    ){
                        ++interceptedImageCount;
                        interceptedRequest.abort();
                    } else {
                        interceptedRequest.continue();
                    }
                },
            }
        );

        expect(interceptedImageCount).to.be.above(0)

    });
});

describe('pageProcessor', () => {

    it('On Evaluate For an url',  async () => {
        // @ts-ignore
        const browser: Browser = await puppeteer.default.launch(defaultConfiguration.puppeteerOptions.browser);
        const page: Page = await browser.newPage();

        const pageResult: PageResult = await pageProcessor('https://www.bbc.com', page, {
            onEvaluateForEachUrl: {
                title: (): string => {
                    const titleElement: HTMLElement | null = document.getElementById('page-title');
                    return titleElement ? titleElement.innerText : '';
                },
            },
        });

        expect(pageResult.evaluates.title).to.be.an('string');

    });

    it('Handle errors',  async () => {

        try {
            await pageProcessor('https://www.bbc.com', null, {});
        } catch (error: any) {
            expect(error.message).to.match( /Cannot read property/ig);
        }

    });
});
