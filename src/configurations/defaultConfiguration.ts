import CustomConfigurations from '../interfaces/CustomConfigurations';

const defaultConfiguration: CustomConfigurations = {
    maxSimultaneousPages  : 1,
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
};

export default defaultConfiguration;
