import convert from 'convert-seconds';

export const extract = (name) => {
    const matches = name.match(/\w+\-\w+/);
    return matches ? matches[0] : '';
};

export const changeOffset = (dateTime) => {
    const split = dateTime.split('+');
    split[1] = split[1].replace(':', '');
    return split.join('+');
};

export const convertFromSeconds = (seconds) => {
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
};

export const sleep = (ms) => {
    return new Promise(resolve => setTimeout(resolve, ms));
};
