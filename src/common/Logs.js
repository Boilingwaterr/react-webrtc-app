const textStyle = 'font-size: 20px; color: #555e70; font-weight: 600;'
const timeStyle = 'font-size: 18px; color: #9e9547; font-weight: 400;'
const nowStyle = 'font-size: 16px; color: #457745; font-weight: 200;'

const trace = (text, data) => {
    let nowDateTrace = new Date();
    text = text.trim();
    const now = (window.performance.now() / 1000).toFixed(3);
    let nowTimeTrace, hoursTrace, minutesTrace, secondsTrace;
    hoursTrace = nowDateTrace.getHours();
    minutesTrace = nowDateTrace.getMinutes();
    secondsTrace = nowDateTrace.getSeconds();
    nowTimeTrace = `${hoursTrace}:${minutesTrace}:${secondsTrace}`;
    switch (typeof data) {
        case 'undefined':
            data = ''
            sorted(text, data);
            break
        case 'object':
            sorted(text, '');
            console.table(data);
            break
        case 'number':
            sorted(text, data);
            break
        case 'string':
            sorted(text, data);
            break
        case 'null':
            console.log('Somthing went wrong.');
            break;
        default:
            break;
    }

    function sorted(text, data) {
        console.log(`%c${nowTimeTrace} %c${text} ${data} %c${now}`, timeStyle, textStyle, nowStyle);
    }
}

export default trace;