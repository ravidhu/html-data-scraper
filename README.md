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
* `urls` <string[]> An array of urls
* `configurations` [CustomConfigurations](#customconfigurations)
* returns: <Promise<PageResults[]>> Promise which resolves an array of [PageResult](#pageresult) objects 

This main function will split the urls to distribute the scraping process on each cpu core.
So if the computer have 4 cores :
- to scrap 1 url, it will use 1 core
- to scrap 2 url, it will use 1 core ()
- to scrap 3 or more than 3 urls, it will use 3 cores


#### CustomConfigurations

This object is use to setup Puppeteer and the scraping process itself. 
The following object show the default values :

```javascript
const configurations = {
    maxSimultaneousBrowser  : cpuCoreCount > 2 ? cpuCoreCount - 1 : 1,
    additionalWaitSeconds   : 1,
    puppeteerOptions        : {
        browser : {
            args : [
                '--no-sandbox',
                '--disable-setuid-sandbox',
                '--disable-dev-shm-usage',
                '--shm-size=1gb',
            ],
        },
        pageGoTo : { waitUntil: 'networkidle2' },
    },
    onPageLoadedForEachUrl  : null,
    onEvaluateForEachUrl    : null,
    onProgress              : null,
}
```
#### PageResult


## Usage


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