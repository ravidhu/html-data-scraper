<h1 align="center">Welcome to html-data-scraper 👋</h1>
<p>
  <img alt="Version" src="https://img.shields.io/badge/version-1.0.0-blue.svg?cacheSeconds=2592000" />
  <a href="#" target="_blank">
    <img alt="License: MIT" src="https://img.shields.io/badge/License-MIT-yellow.svg" />
  </a>
</p>

> An efficient wrapper around puppeteer for data scraping web pages. 

## Install

```sh
yarn add html-data-scraper
```
Or
```sh
npm install html-data-scraper
```

## API

### htmlDataScraper(urls, configurations)
* `urls: string[]` An array of urls
* `configurations: CustomConfigurations` An [CustomConfigurations](#customconfigurations) object to configure everything. 
* **returns** `Promise<PageResults[]>` Promise which resolves an array of [PageResult](#pageresult) objects. 

This main function will distribute the scraping process on all minus one cpu cores available 
( if the computer have 4 cores, it will distribute on 3 cores ).

#### Usage 
```typescript
import htmlDataScraper, {PageResult} from 'html-data-scraper';    

const progress: Record<string, string[]> = {};

const urls = [];
const urlNumber = 7;
const maxSimultaneousBrowser = 3;

for (let i = 0; i < urlNumber; i++) {
    urls.push('https://fr.wikipedia.org/wiki/World_Wide_Web');
}

htmlDataScraper(urls, {
    maxSimultaneousBrowser,
    onEvaluateForEachUrl: {
        title: (): string => {
            const titleElement: HTMLElement | null = document.getElementById('firstHeading');
            const innerElement: HTMLCollectionOf<HTMLElement> | null = titleElement.getElementsByTagName('span');
            return innerElement && innerElement.length ? innerElement[0].innerText : '';
        },
    },
    onProgress: (resultNumber: number, totalNumber: number, internalBrowserIndex: number) => {
        console.log('Scraping brownser n°',internalBrowserIndex, '->' , resultNumber + '/' + totalNumber);
    },
})
    .then((results: PageResult[]) => {

        console.log(results);
        // [
        //    {
        //        pageData: '<!DOCTYPE html>.....',
        //        evaluates: { 
        //            title: 'World Wide Web'
        //        }
        //    },
        //    ...
        // ]


    });
```

#### CustomConfigurations

This object is use to setup the scraping process and puppeteer itself. 
The following object show the default values :
```javascript
const configurations = {
    maxSimultaneousBrowser  : 1,
    additionalWaitSeconds   : 1,
    puppeteerOptions        : {
        browser : {
            args : [
                '--no-sandbox',
                '--disable-setuid-sandbox',
                '--disable-dev-shm-usage',
            ],
        },
        pageGoTo : { waitUntil: 'networkidle2' },
    },
}
```
if `maxSimultaneousBrowser` is not set during the initialization, it will use all available core minus one :
```javascript
if (!customConfigurations.hasOwnProperty('maxSimultaneousBrowser')){
    const cpuCoreCount = os.cpus().length;
    configuration.maxSimultaneousBrowser = cpuCoreCount > 2 ? cpuCoreCount - 1 : 1;
}
```

Additionally you can use the following keys:

##### onPageLoadedForEachUrl
`onPageLoadedForEachUrl: (puppeteerPage, currentUrl) => {}`
* `puppeteerPage: Page` A reference to the current puppeteer [Page](https://github.com/puppeteer/puppeteer/blob/v5.2.1/docs/api.md#class-page).
* `currentUrl: string` The current url of the page.
* **return** `any` You can return whatever you need.

The returned value is set in PageResult.pageData for each url.
If this function is not set, by default PageResult.pageData is set with `page.content()`.

##### onEvaluateForEachUrl
`onEvaluateForEachUrl: {}`

This key contain an object that register functions. Those functions are use by 
[page.evaluate](https://github.com/puppeteer/puppeteer/blob/v5.2.1/docs/api.md#pageevaluatepagefunction-args). 
Each function return is set to the corresponding name in [PageResult.evaluates](#evaluates) :
```typescript
import htmlDataScraper, {PageResult} from 'html-data-scraper';    

htmlDataScraper([
    'https://www.bbc.com',
], {
    onEvaluateForEachUrl: {
        title: (): string => {
            const titleElement: HTMLElement | null = document.getElementById('page-title');
            return titleElement ? titleElement.innerText : '';
        },
    },
})
.then((pageResults: PageResult[]) => {
    console.log(pageResults[0]);
    // {
    //     pageData: "....",
    //     evaluates: {
    //         title: "..." 
    //     } 
    // }
});
```

##### onProgress
`onProgress: (resultNumber, totalNumber, internalBrowserIndex) => {}`:
* `resultNumber: number` The number of processed pages.
* `totalNumber: number` The total number of page to process.
* `internalBrowserIndex: number` An index representing the browser that process pages.
* **return** `void` No return needed.

This function is run each time a page processing finish.

```typescript
import htmlDataScraper from 'html-data-scraper';    

const progress: Record<string,string[]> = {};

htmlDataScraper([
    // ...
], {
    onProgress: (resultNumber: number, totalNumber: number, internalBrowserIndex: number) => {
        const status = resultNumber + '/' + totalNumber;
        if (progress[internalBrowserIndex]){
            progress[internalBrowserIndex].push(status);
        } else {
            progress[internalBrowserIndex] = [status];
        }
    },
})
```

#### PageResult

```typescript
interface PageResult{
    pageData: any;
    evaluates: null | {
        [k: string]: any;
    };
}
```
##### pageData
This key will contain the html content of the webpage. But if you set the `onPageLoadedForEachUrl`, this will contain de returned value on the function.

##### evaluates
This key contain the result of `onEvaluateForEachUrl` functions.

## Development

### Setup

1) Clone this repository
2) `yarn install`

### Run tests

```sh
yarn test
```

## Author

👤 **Ravidhu Dissanayake**

* Website: ravidhu.com
* Github: [@ravidhu](https://github.com/ravidhu)
* LinkedIn: [@ravidhu](https://linkedin.com/in/ravidhu)

## Show your support

Give a ⭐️ if this project helped you!