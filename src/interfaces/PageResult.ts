import {EvaluateForEachUrlData} from './EvaluateForEachUrl';

export default interface PageResult{
    rawHtml: string;
    evaluates: EvaluateForEachUrlData | null;
}