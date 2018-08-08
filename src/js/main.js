var ChangeMainPanelName = function (name) {
    const names = [
        {
            id: 'charts',
            fullName: 'Wykresy z danych wszystkich czujników'
        },
        {
            id: 'control',
            fullName: 'Steruj swoimi urządzeniami'
        },

        {
            id: 'nodes',
            fullName: 'Zarządzaj swoimi urządzeniami'
        },
        {
            id: 'new-device-type',
            fullName: 'Zdefiniuj nowe urządzenie'
        },
        {
            id: 'users',
            fullName: 'Zarządzaj użytkownikami systemu'
        },
        {
            id: 'my-profile',
            fullName: 'Twoje dane'
        },
        {
            id: 'login',
            fullName: 'Zaloguj się'
        }];

    let fullName = names.filter(n => n.id === name)[0].fullName;

    $('#view-title').text(fullName);
};
