import * as fs from 'fs';
import { expect } from 'chai';
import {Browser, Page} from 'puppeteer';
import * as puppeteer from 'puppeteer';

import 'mocha';

import htmlDataScraper from '../src/index';
import initBrowser from '../src/library/initBrowser';
import pageProcessor from '../src/library/pageProcessor';
import defaultConfiguration from '../src/configurations/defaultConfiguration';
import PageResult from '../src/interfaces/PageResult';

describe('htmlDataScraper',  () => {

    it('No urls',async () => {

        try {
            await htmlDataScraper([], {
                maxSimultaneousBrowser : 1,
            });
        } catch (error: any){
            expect(error.message).to.equal( 'urlListIsEmpty');
        }

    });

    it('No max simultaneous browser option',async () => {

        try {
            await htmlDataScraper(['https://www.bbc.com'], {
                maxSimultaneousBrowser : null,
            });
        } catch (error: any){
            expect(error.message).to.equal( 'maxSimultaneousBrowserNotSet');
        }

    });

    it('No configuration',async () => {

        const results: PageResult[]  = await htmlDataScraper(['https://www.bbc.com'], null);
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

        const results: PageResult[] = await htmlDataScraper([
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

    it('Distribute urls to multiple browsers',async () => {

        const progress: Record<string, string[]> = {};

        const urls = [];
        const urlNumber = 7;
        const maxSimultaneousBrowser = 3;

        for (let i = 0; i < urlNumber; i++) {
            urls.push('https://fr.wikipedia.org/wiki/World_Wide_Web');
        }

        await htmlDataScraper(urls, {
            maxSimultaneousBrowser,
            onProgress: (resultNumber: number, totalNumber: number, internalBrowserIndex: number) => {
                const status = resultNumber + '/' + totalNumber;
                if (progress[internalBrowserIndex]){
                    progress[internalBrowserIndex].push(status);
                } else {
                    progress[internalBrowserIndex] = [status];
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
    it('run solo', async () => {

        const progress: string[] = [];

        await initBrowser([
            'https://www.bbc.com',
            'https://www.lemonde.fr',
            'https://fr.wikipedia.org',
        ], {
            maxSimultaneousBrowser: 1,
            onProgress: (resultNumber: number, totalNumber: number, internalBrowserIndex: number) => {
                progress.push(resultNumber + '/' + totalNumber);
            },
        });

        expect(progress).to.deep.equal([ '1/3', '2/3', '3/3' ]);

    });

    it('No urls',  async () => {

        try {
            await initBrowser([], {});
        } catch (error: any){
            expect(error.message).to.equal( 'urlListIsEmpty');
        }

    });

    it('run with additional wait seconds (3s)', async () => {

        await initBrowser([
            'https://www.bbc.com',
        ], {
            additionalWaitSeconds: 3,
        });

    });

    it('onProgress throw error', async () => {

        try {
            await initBrowser([
                'https://www.bbc.com',
                'https://www.lemonde.fr',
                'https://www.lefigaro.fr',
            ], {
                maxSimultaneousBrowser: 1,
                onProgress: (resultNumber: number, totalNumber: number, internalBrowserIndex: number) => {
                    throw new Error('test');
                },
            });
        } catch (error: any){
            expect(error.message).to.equal( 'test');
        }

    });
});

describe('pageProcess', () => {

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
