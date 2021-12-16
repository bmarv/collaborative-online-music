exports.getDateTimeString = () => {
    const currentDate = new Date();
    const cDate = currentDate.getFullYear() + '-' + (currentDate.getMonth() + 1) + '-' + currentDate.getDate();
    const cTime = currentDate.getHours() + "-" + currentDate.getMinutes() + "-" + currentDate.getSeconds();
    const dateTime = cDate + '_' + cTime;
    return dateTime;
}