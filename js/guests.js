function loadGuests() {
    const tbody = document.getElementById('guestsList');
    tbody.innerHTML = '';
    
    guests.forEach(guest => {
        const guestBookings = bookings.filter(b => guest.bookings.includes(parseInt(b.roomNumber)));
        const currentBooking = guestBookings.find(b => b.status === 'checked-in');
        
        const row = document.createElement('tr');
        row.innerHTML = `
            <td>${guest.id}</td>
            <td>${guest.name}</td>
            <td>${guest.phone}</td>
            <td>${guest.email || '-'}</td>
            <td>${currentBooking ? currentBooking.roomNumber : '-'}</td>
            <td>${currentBooking ? currentBooking.checkIn : '-'}</td>
            <td>${currentBooking ? currentBooking.checkOut : '-'}</td>
            <td>${currentBooking ? 'Проживает' : 'Не в отеле'}</td>
            <td>
                <button onclick="showEditGuestModal(${guest.id})">Просмотр</button>
                ${currentUser.role !== 'staff' ? `<button onclick="showAddBookingForGuestModal(${guest.id})" class="success">Бронировать</button>` : ''}
                ${currentUser.role === 'admin' ? `<button onclick="deleteGuest(${guest.id})" class="danger">Удалить</button>` : ''}
            </td>
        `;
        tbody.appendChild(row);
    });
}

function showAddGuestModal() {
    document.getElementById('guest-name').value = '';
    document.getElementById('guest-phone').value = '';
    document.getElementById('guest-email').value = '';
    document.getElementById('guest-passport').value = '';
    document.getElementById('guest-country').value = '';
    document.getElementById('guest-notes').value = '';
    
    showModal('addGuestModal');
}

function addGuest() {
    const name = document.getElementById('guest-name').value;
    const phone = document.getElementById('guest-phone').value;
    const email = document.getElementById('guest-email').value;
    const passport = document.getElementById('guest-passport').value;
    const country = document.getElementById('guest-country').value;
    const notes = document.getElementById('guest-notes').value;
    
    if (!name || !phone || !passport || !country) {
        alert('Пожалуйста, заполните все обязательные поля!');
        return;
    }
    
    const newId = guests.length > 0 ? Math.max(...guests.map(g => g.id)) + 1 : 1;
    
    guests.push({
        id: newId,
        name: name,
        phone: phone,
        email: email || '',
        passport: passport,
        country: country,
        notes: notes || '',
        bookings: []
    });
    
    saveToLocalStorage();
    closeModal('addGuestModal');
    loadGuests();
    alert('Гость успешно добавлен!');
}

function showEditGuestModal(id) {
    const guest = guests.find(g => g.id === id);
    if (!guest) return;
    
    document.getElementById('edit-guest-id').value = guest.id;
    document.getElementById('edit-guest-name').value = guest.name;
    document.getElementById('edit-guest-phone').value = guest.phone;
    document.getElementById('edit-guest-email').value = guest.email || '';
    document.getElementById('edit-guest-passport').value = guest.passport;
    document.getElementById('edit-guest-country').value = guest.country;
    document.getElementById('edit-guest-notes').value = guest.notes || '';
    
    showModal('editGuestModal');
}

function updateGuest() {
    const id = parseInt(document.getElementById('edit-guest-id').value);
    const name = document.getElementById('edit-guest-name').value;
    const phone = document.getElementById('edit-guest-phone').value;
    const email = document.getElementById('edit-guest-email').value;
    const passport = document.getElementById('edit-guest-passport').value;
    const country = document.getElementById('edit-guest-country').value;
    const notes = document.getElementById('edit-guest-notes').value;
    
    if (!name || !phone || !passport || !country) {
        alert('Пожалуйста, заполните все обязательные поля!');
        return;
    }
    
    const guestIndex = guests.findIndex(g => g.id === id);
    if (guestIndex === -1) return;
    
    guests[guestIndex] = {
        ...guests[guestIndex],
        name: name,
        phone: phone,
        email: email || '',
        passport: passport,
        country: country,
        notes: notes || ''
    };
    
    saveToLocalStorage();
    closeModal('editGuestModal');
    loadGuests();
    alert('Данные гостя успешно обновлены!');
}

function deleteGuest(id) {
    if (confirm('Вы уверены, что хотите удалить этого гостя? Все связанные бронирования также будут удалены.')) {
        const guestBookings = guests.find(g => g.id === id)?.bookings || [];
        bookings = bookings.filter(b => !guestBookings.includes(parseInt(b.roomNumber)));
        
        guests = guests.filter(guest => guest.id !== id);
        
        saveToLocalStorage();
        loadGuests();
        loadBookings();
    }
}

function searchGuests() {
    const input = document.getElementById('guestSearch').value.toLowerCase();
    const rows = document.querySelectorAll('#guestsList tr');
    
    rows.forEach(row => {
        const name = row.cells[1].textContent.toLowerCase();
        const phone = row.cells[2].textContent.toLowerCase();
        const email = row.cells[3].textContent.toLowerCase();
        
        if (name.includes(input) || phone.includes(input) || email.includes(input)) {
            row.style.display = '';
        } else {
            row.style.display = 'none';
        }
    });
}

function exportGuestsToPDF() {
    const doc = new jsPDF();
    doc.text('Список гостей отеля', 10, 10);
    
    const headers = [['ID', 'ФИО', 'Телефон', 'Email', 'Статус']];
    const data = guests.map(guest => {
        const hasBooking = bookings.some(b => guest.bookings.includes(parseInt(b.roomNumber)) && b.status === 'checked-in');
        return [
            guest.id.toString(),
            guest.name,
            guest.phone,
            guest.email || '-',
            hasBooking ? 'Проживает' : 'Не в отеле'
        ];
    });
    
    doc.autoTable({
        head: headers,
        body: data,
        startY: 20,
        styles: { fontSize: 8 },
        headStyles: { fillColor: [52, 152, 219] }
    });
    
    doc.save(`Гости_отеля_${new Date().toISOString().split('T')[0]}.pdf`);
}