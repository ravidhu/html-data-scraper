import {EvaluateFn} from 'puppeteer';

export interface EvaluateForEachUrlConfigurations {
    [k: string]: EvaluateFn;
}

export interface EvaluateForEachUrlData {
    [k: string]: any;
}