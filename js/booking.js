// Глобальные переменные для бронирований
let bookings = [];

// Загрузка списка бронирований
function loadBookings() {
    const tbody = document.getElementById('bookingsList');
    tbody.innerHTML = '';
    
    bookings.forEach(booking => {
        const guest = guests.find(g => g.id === booking.guestId);
        const room = rooms.find(r => r.number === booking.roomNumber);
        const roomType = room ? roomTypes.find(t => t.id === room.typeId) : null;
        
        let statusClass = '';
        let statusText = '';
        switch(booking.status) {
            case 'confirmed':
                statusClass = 'status-confirmed';
                statusText = 'Подтверждено';
                break;
            case 'checked-in':
                statusClass = 'status-checked-in';
                statusText = 'Заселен';
                break;
            case 'checked-out':
                statusClass = 'status-checked-out';
                statusText = 'Выселен';
                break;
            case 'cancelled':
                statusClass = 'status-cancelled';
                statusText = 'Отменено';
                break;
        }
        
        const row = document.createElement('tr');
        row.innerHTML = `
            <td>${booking.id}</td>
            <td>${guest?.name || 'Неизвестно'}</td>
            <td>${booking.roomNumber} (${roomType?.name || 'Неизвестно'})</td>
            <td>${booking.checkIn} - ${booking.checkOut}</td>
            <td>${booking.totalPrice} ₽</td>
            <td><span class="booking-status ${statusClass}">${statusText}</span></td>
            <td>${booking.createdAt}</td>
            <td>
                <button onclick="showBookingDetails(${booking.id})">Подробнее</button>
                ${currentUser.role !== 'staff' ? `<button onclick="editBookingStatus(${booking.id})">Изменить статус</button>` : ''}
                ${currentUser.role === 'admin' ? `<button onclick="cancelBooking(${booking.id})" class="danger">Отменить</button>` : ''}
            </td>
        `;
        tbody.appendChild(row);
    });
}

// Показать модальное окно для нового бронирования
function showAddBookingModal() {
    // Очистка формы
    document.getElementById('booking-guest').value = '';
    document.getElementById('booking-room').value = '';
    document.getElementById('booking-checkin').value = '';
    document.getElementById('booking-checkout').value = '';
    
    // Заполнение выпадающих списков
    const guestSelect = document.getElementById('booking-guest');
    guestSelect.innerHTML = '';
    guests.forEach(guest => {
        const option = document.createElement('option');
        option.value = guest.id;
        option.textContent = guest.name;
        guestSelect.appendChild(option);
    });
    
    const roomSelect = document.getElementById('booking-room');
    roomSelect.innerHTML = '';
    rooms.filter(r => r.status === 'available').forEach(room => {
        const roomType = roomTypes.find(t => t.id === room.typeId);
        const option = document.createElement('option');
        option.value = room.number;
        option.textContent = `${room.number} (${roomType?.name || 'Неизвестно'}) - ${roomType?.basePrice || '0'} ₽/ночь`;
        roomSelect.appendChild(option);
    });
    
    // Установка дат по умолчанию
    const today = new Date().toISOString().split('T')[0];
    const tomorrow = new Date();
    tomorrow.setDate(tomorrow.getDate() + 1);
    const tomorrowStr = tomorrow.toISOString().split('T')[0];
    
    document.getElementById('booking-checkin').value = today;
    document.getElementById('booking-checkout').value = tomorrowStr;
    
    showModal('addBookingModal');
}

// Добавить новое бронирование
function addBooking() {
    const guestId = parseInt(document.getElementById('booking-guest').value);
    const roomNumber = document.getElementById('booking-room').value;
    const checkIn = document.getElementById('booking-checkin').value;
    const checkOut = document.getElementById('booking-checkout').value;
    
    if (!guestId || !roomNumber || !checkIn || !checkOut) {
        alert('Пожалуйста, заполните все поля!');
        return;
    }
    
    if (new Date(checkOut) <= new Date(checkIn)) {
        alert('Дата выезда должна быть позже даты заезда!');
        return;
    }
    
    const room = rooms.find(r => r.number === roomNumber);
    const roomType = roomTypes.find(t => t.id === room.typeId);
    
    if (!room || !roomType) {
        alert('Ошибка при выборе номера!');
        return;
    }
    
    // Проверка доступности номера на выбранные даты
    const isAvailable = !bookings.some(b => 
        b.roomNumber === roomNumber && 
        b.status !== 'cancelled' && 
        ((new Date(checkIn) >= new Date(b.checkIn) && new Date(checkIn) < new Date(b.checkOut)) ||
         (new Date(checkOut) > new Date(b.checkIn) && new Date(checkOut) <= new Date(b.checkOut)) ||
         (new Date(checkIn) <= new Date(b.checkIn) && new Date(checkOut) >= new Date(b.checkOut)))
    );
    
    if (!isAvailable) {
        alert('Номер уже забронирован на выбранные даты!');
        return;
    }
    
    const nights = Math.ceil((new Date(checkOut) - new Date(checkIn)) / (1000 * 60 * 60 * 24));
    const totalPrice = nights * roomType.basePrice;
    
    const newId = bookings.length > 0 ? Math.max(...bookings.map(b => b.id)) + 1 : 1;
    
    bookings.push({
        id: newId,
        guestId: guestId,
        roomNumber: roomNumber,
        checkIn: checkIn,
        checkOut: checkOut,
        status: 'confirmed',
        totalPrice: totalPrice,
        createdAt: new Date().toISOString().split('T')[0],
        createdBy: currentUser.id
    });
    
    // Обновить статус номера
    const roomIndex = rooms.findIndex(r => r.number === roomNumber);
    if (roomIndex !== -1) {
        rooms[roomIndex].status = 'reserved';
    }
    
    // Добавить бронирование в профиль гостя
    const guestIndex = guests.findIndex(g => g.id === guestId);
    if (guestIndex !== -1) {
        if (!guests[guestIndex].bookings) guests[guestIndex].bookings = [];
        guests[guestIndex].bookings.push(parseInt(roomNumber));
    }
    
    saveToLocalStorage();
    closeModal('addBookingModal');
    loadBookings();
    loadRooms();
    loadGuests();
    alert('Бронирование успешно создано!');
}

// Изменить статус бронирования
function editBookingStatus(bookingId) {
    const booking = bookings.find(b => b.id === bookingId);
    if (!booking) return;
    
    const statusSelect = document.getElementById('edit-booking-status');
    statusSelect.innerHTML = '';
    
    const statuses = [
        { value: 'confirmed', text: 'Подтверждено' },
        { value: 'checked-in', text: 'Заселен' },
        { value: 'checked-out', text: 'Выселен' },
        { value: 'cancelled', text: 'Отменено' }
    ];
    
    statuses.forEach(status => {
        const option = document.createElement('option');
        option.value = status.value;
        option.textContent = status.text;
        if (booking.status === status.value) option.selected = true;
        statusSelect.appendChild(option);
    });
    
    document.getElementById('edit-booking-id').value = booking.id;
    showModal('editBookingStatusModal');
}

// Обновить статус бронирования
function updateBookingStatus() {
    const bookingId = parseInt(document.getElementById('edit-booking-id').value);
    const newStatus = document.getElementById('edit-booking-status').value;
    
    const bookingIndex = bookings.findIndex(b => b.id === bookingId);
    if (bookingIndex === -1) return;
    
    const oldStatus = bookings[bookingIndex].status;
    bookings[bookingIndex].status = newStatus;
    
    // Обновить статус номера при необходимости
    const roomIndex = rooms.findIndex(r => r.number === bookings[bookingIndex].roomNumber);
    if (roomIndex !== -1) {
        if (newStatus === 'checked-in') {
            rooms[roomIndex].status = 'occupied';
        } else if (newStatus === 'checked-out' || newStatus === 'cancelled') {
            rooms[roomIndex].status = 'available';
        }
    }
    
    saveToLocalStorage();
    closeModal('editBookingStatusModal');
    loadBookings();
    loadRooms();
    alert('Статус бронирования обновлен!');
}

// Отменить бронирование
function cancelBooking(bookingId) {
    if (confirm('Вы уверены, что хотите отменить это бронирование?')) {
        const bookingIndex = bookings.findIndex(b => b.id === bookingId);
        if (bookingIndex === -1) return;
        
        bookings[bookingIndex].status = 'cancelled';
        
        // Обновить статус номера
        const roomIndex = rooms.findIndex(r => r.number === bookings[bookingIndex].roomNumber);
        if (roomIndex !== -1) {
            rooms[roomIndex].status = 'available';
        }
        
        saveToLocalStorage();
        loadBookings();
        loadRooms();
        alert('Бронирование отменено!');
    }
}

// Поиск бронирований
function searchBookings() {
    const input = document.getElementById('bookingSearch').value.toLowerCase();
    const rows = document.querySelectorAll('#bookingsList tr');
    
    rows.forEach(row => {
        const guestName = row.cells[1].textContent.toLowerCase();
        const roomNumber = row.cells[2].textContent.toLowerCase();
        
        if (guestName.includes(input) || roomNumber.includes(input)) {
            row.style.display = '';
        } else {
            row.style.display = 'none';
        }
    });
}

// Показать календарь бронирований
function showCalendarView() {
    // Здесь должна быть реализация календарного представления
    alert('Календарное представление будет реализовано в следующей версии!');
}