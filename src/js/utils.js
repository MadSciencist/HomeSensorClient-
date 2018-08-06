const formatDate = function (rawDate, addTime) {
    let date = new Date(rawDate);

    const monthNames = [
        "Styczeń", "Luty", "Marzec",
        "Kwiecień", "Maj", "Czerwiec", "Lipiec",
        "Sierpień", "Wrzesień", "Październik",
        "Listopad", "Grudzień"
    ];

    const day = date.getDate();
    const monthIndex = date.getMonth();
    const year = date.getFullYear();
    const hour = date.getHours();
    const minute = date.getMinutes();

    let dateString = day + ' ' + monthNames[monthIndex] + ' ' + year;

    if (addTime)
        dateString = dateString.concat(' ').concat(hour).concat(':').concat(minute);

    return dateString;
};

const roleLookUpTable = function (roleId) {
    const roles = ['Sensor', 'Viewer', 'Manager', 'Admin'];
    if (roleId >= 0 && roleId <= (roles.length + 1))
    return roles[roleId];
};