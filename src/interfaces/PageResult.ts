export default interface PageResult{
    pageData: any;
    evaluates: null | {
        [k: string]: any;
    };
}