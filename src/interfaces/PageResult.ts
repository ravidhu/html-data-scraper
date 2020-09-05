import {EvaluateForEachUrlData} from './EvaluateForEachUrl';

export default interface PageResult{
    pageData: any;
    evaluates: EvaluateForEachUrlData | null;
}