app.constant('constants', {
    formatDate: (rawDate, addTime) => {
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
    
        let dateString = `${day} ${monthNames[monthIndex]} ${year}`;
    
        if (addTime)
            dateString = `${dateString} ${hour}:${minute < 10 ? '0'.concat(minute) : minute}`
    
        return dateString;
    }
});