function openTab(tabName) {
    if (!currentUser) return;
    
    if ((tabName === 'settings' || tabName === 'staff') && currentUser.role !== 'admin') {
        alert('Доступ запрещен! Только для администраторов.');
        return;
    }
    
    if (tabName === 'reports' && currentUser.role === 'staff') {
        alert('Доступ запрещен! Только для менеджеров и администраторов.');
        return;
    }
    
    const tabs = document.getElementsByClassName('tab');
    for (let i = 0; i < tabs.length; i++) {
        tabs[i].classList.remove('active');
    }
    
    const tabContents = document.getElementsByClassName('tab-content');
    for (let i = 0; i < tabContents.length; i++) {
        tabContents[i].classList.remove('active');
    }
    
    const activeTab = document.querySelector(`.tab[onclick="openTab('${tabName}')"]`);
    if (activeTab) activeTab.classList.add('active');
    
    const activeContent = document.getElementById(tabName);
    if (activeContent) activeContent.classList.add('active');
    
    switch(tabName) {
        case 'guests':
            loadGuests();
            break;
        case 'rooms':
            loadRooms();
            break;
        case 'bookings':
            loadBookings();
            break;
        case 'staff':
            loadStaff();
            break;
        case 'services':
            loadServices();
            break;
        case 'dashboard':
            loadDashboard();
            break;
    }
}

function closeModal(modalId) {
    document.getElementById(modalId).style.display = 'none';
}

function showModal(modalId) {
    document.getElementById(modalId).style.display = 'block';
}

function loadDashboard() {
    const today = new Date().toISOString().split('T')[0];
    document.getElementById('today-guests').textContent = 
        bookings.filter(b => b.checkIn === today && b.status === 'checked-in').length;
    
    document.getElementById('occupied-rooms').textContent = 
        `${bookings.filter(b => b.status === 'checked-in').length}/${rooms.length}`;
    
    document.getElementById('today-revenue').textContent = 
        `${bookings.filter(b => b.checkIn === today).reduce((sum, b) => sum + b.totalPrice, 0)} ₽`;
    
    document.getElementById('avg-rating').textContent = '4.7';
    
    const recentBookingsBody = document.querySelector('#recent-bookings tbody');
    recentBookingsBody.innerHTML = '';
    
    bookings.slice(0, 5).forEach(booking => {
        const guest = guests.find(g => g.id === booking.guestId);
        const row = document.createElement('tr');
        row.innerHTML = `
            <td>${guest?.name || 'Неизвестно'}</td>
            <td>${booking.roomNumber}</td>
            <td>${booking.checkIn} - ${booking.checkOut}</td>
            <td>${getStatusText(booking.status)}</td>
        `;
        recentBookingsBody.appendChild(row);
    });
    
    const upcomingCheckoutsBody = document.querySelector('#upcoming-checkouts tbody');
    upcomingCheckoutsBody.innerHTML = '';
    
    const tomorrow = new Date();
    tomorrow.setDate(tomorrow.getDate() + 1);
    const tomorrowStr = tomorrow.toISOString().split('T')[0];
    
    const upcomingBookings = bookings.filter(b => 
        (b.checkOut === today || b.checkOut === tomorrowStr) && 
        b.status === 'checked-in'
    );
    
    upcomingBookings.forEach(booking => {
        const guest = guests.find(g => g.id === booking.guestId);
        const row = document.createElement('tr');
        row.innerHTML = `
            <td>${guest?.name || 'Неизвестно'}</td>
            <td>${booking.roomNumber}</td>
            <td>${booking.checkOut}</td>
            <td>
                <button onclick="checkOutGuest(${booking.id})" class="success">Оформить выезд</button>
            </td>
        `;
        upcomingCheckoutsBody.appendChild(row);
    });
    
    updateRoomStatusChart();
}

function getStatusText(status) {
    const statuses = {
        'confirmed': 'Подтверждено',
        'checked-in': 'Заселен',
        'checked-out': 'Выселен',
        'cancelled': 'Отменено'
    };
    return statuses[status] || status;
}

document.addEventListener('DOMContentLoaded', function() {
    initData();
    
    document.getElementById('report-period').addEventListener('change', function() {
        document.getElementById('custom-dates').style.display = 
            this.value === 'custom' ? 'flex' : 'none';
    });
    
    const today = new Date().toISOString().split('T')[0];
    document.getElementById('start-date').value = today;
    document.getElementById('end-date').value = today;
});