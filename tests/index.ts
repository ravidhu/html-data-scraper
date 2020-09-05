import htmlDataScraper from '../src/index';
import { expect } from 'chai';
import 'mocha';
import PageResult from '../src/interfaces/PageResult';
import {Page} from 'puppeteer';

import * as fs from 'fs';
import initBrowser from '../src/library/initBrowser';
import pageProcessor from '../src/library/pageProcessor';

describe('Scraping',  () => {

    it('No urls',(done) => {

        htmlDataScraper([], {
            maxSimultaneousBrowser : 1,
        }).catch((error) => {
            expect(error.message).to.equal( 'urlListIsEmpty');
            done();
        });

    });

    it('No max simultaneous browser option',(done) => {

        htmlDataScraper(['https://www.bbc.com'], {
            maxSimultaneousBrowser : null,
        }).catch((error) => {
            expect(error.message).to.equal( 'maxSimultaneousBrowserNotSet');
            done();
        });

    });

    it('Get bbc.com screenshot', async () => {

        await htmlDataScraper([
            'https://www.bbc.com',
        ], {
            onPageLoadedForEachUrl: async (page: Page) => {

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

});

describe('initBrowser', () => {
    it('run solo', (done) => {

        const progress: string[] = [];

        initBrowser([
            'https://www.bbc.com',
            'https://www.lemonde.fr',
            'https://www.lefigaro.fr',
        ], {
            maxSimultaneousBrowser: 1,
            onProgress: (resultNumber: number, totalNumber: number, internalBrowserIndex: number) => {
                progress.push(resultNumber + '/' + totalNumber);
            },
        })
            .then(() => {
                expect(progress).to.deep.equal([ '1/3', '2/3', '3/3' ]);
                done();
            });
    });

    it('No urls',  (done) => {

        initBrowser([], {}).catch((error) => {
            expect(error.message).to.equal( 'urlListIsEmpty');
            done();
        });

    });

    it('onProgress throw error', (done) => {

        initBrowser([
            'https://www.bbc.com',
            'https://www.lemonde.fr',
            'https://www.lefigaro.fr',
        ], {
            maxSimultaneousBrowser: 1,
            onProgress: (resultNumber: number, totalNumber: number, internalBrowserIndex: number) => {
                throw new Error('test');
            },
        })
            .catch((error) => {
                expect(error.message).to.equal( 'test');
                done();
            });
    });
});

describe('pageProcess', () => {
    it('Handle errors', async () => {

        try {
            await pageProcessor('https://www.bbc.com', null, {});
        } catch (error) {
            expect(error.message).to.match( /Cannot read property/ig);
        }
    });
});
