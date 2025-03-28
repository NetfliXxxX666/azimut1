// Сохранение настроек отеля
function saveHotelSettings() {
    const name = document.getElementById('hotel-name-input').value;
    const address = document.getElementById('hotel-address').value;
    const phone = document.getElementById('hotel-phone').value;
    const email = document.getElementById('hotel-email').value;
    
    if (!name) {
        alert('Название отеля обязательно для заполнения!');
        return;
    }
    
    hotelName = name;
    document.getElementById('hotel-name').textContent = name;
    
    // В реальном приложении сохраняли бы и другие настройки
    saveToLocalStorage();
    alert('Настройки отеля успешно сохранены!');
}

// Сохранение личных настроек пользователя
function saveUserSettings() {
    const fullname = document.getElementById('user-fullname').value;
    const email = document.getElementById('user-email').value;
    const phone = document.getElementById('user-phone').value;
    
    if (!fullname) {
        alert('ФИО обязательно для заполнения!');
        return;
    }
    
    const userIndex = staff.findIndex(u => u.id === currentUser.id);
    if (userIndex === -1) return;
    
    staff[userIndex].fullname = fullname;
    staff[userIndex].email = email || '';
    staff[userIndex].phone = phone || '';
    
    // Обновляем текущего пользователя
    currentUser = staff[userIndex];
    
    // Обновляем отображение в интерфейсе
    document.getElementById('current-user-name').textContent = fullname;
    
    saveToLocalStorage();
    alert('Личные настройки сохранены!');
}

// Показать модальное окно смены пароля
function showChangePasswordModal() {
    // Очистка формы
    document.getElementById('current-password').value = '';
    document.getElementById('new-password').value = '';
    document.getElementById('confirm-password').value = '';
    
    showModal('changePasswordModal');
}

// Смена пароля пользователя
function changePassword() {
    const currentPassword = document.getElementById('current-password').value;
    const newPassword = document.getElementById('new-password').value;
    const confirmPassword = document.getElementById('confirm-password').value;
    
    if (!currentPassword || !newPassword || !confirmPassword) {
        alert('Пожалуйста, заполните все поля!');
        return;
    }
    
    if (newPassword !== confirmPassword) {
        alert('Новый пароль и подтверждение не совпадают!');
        return;
    }
    
    if (currentUser.password !== currentPassword) {
        alert('Текущий пароль введен неверно!');
        return;
    }
    
    const userIndex = staff.findIndex(u => u.id === currentUser.id);
    if (userIndex === -1) return;
    
    staff[userIndex].password = newPassword;
    currentUser.password = newPassword;
    
    saveToLocalStorage();
    closeModal('changePasswordModal');
    alert('Пароль успешно изменен!');
}

// Сохранение системных настроек
function saveSystemSettings() {
    const backupFrequency = document.getElementById('backup-frequency').value;
    const invoicePrefix = document.getElementById('invoice-prefix').value;
    
    // Здесь можно добавить сохранение других системных настроек
    alert('Системные настройки сохранены!');
}

// Создание резервной копии данных
function createBackup() {
    const backupData = {
        hotelName: hotelName,
        rooms: rooms,
        guests: guests,
        bookings: bookings,
        staff: staff,
        services: services,
        roomTypes: roomTypes,
        serviceCategories: serviceCategories,
        backupDate: new Date().toISOString()
    };
    
    const blob = new Blob([JSON.stringify(backupData, null, 2)], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `hotel_backup_${new Date().toISOString().split('T')[0]}.json`;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
    
    alert('Резервная копия успешно создана и загружена!');
}