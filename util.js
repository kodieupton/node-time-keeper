const convert = require('convert-seconds');

module.exports = {
    extract: (name) => {
        const matches = name.match(/\w+\-\w+/);
        return matches ? matches[0] : '';
    },
    
    changeOffset: (dateTime) => {
        const split = dateTime.split('+');
        split[1] = split[1].replace(':', '');
        return split.join('+');
    },
    
    convertFromSeconds: (seconds) => {
        const readable = convert(seconds);
        let formattedTime = '';
    
        if(readable.hours > 0) {
            formattedTime += `${readable.hours}h`;
        }
    
        if(readable.minutes > 0) {
            if(formattedTime !== ''){
                formattedTime += ', ';
            }
    
            formattedTime += `${readable.minutes}m`;
        }
    
        return formattedTime;
    },
    
    sleep: (ms) => {
        return new Promise(resolve => setTimeout(resolve, ms));
    }
}
