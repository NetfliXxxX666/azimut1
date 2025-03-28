function loadRooms() {
    const tbody = document.getElementById('roomsList');
    tbody.innerHTML = '';
    
    const roomTypeSelect = document.getElementById('room-type');
    roomTypeSelect.innerHTML = '';
    roomTypes.forEach(type => {
        const option = document.createElement('option');
        option.value = type.id;
        option.textContent = `${type.name} (${type.basePrice} ₽)`;
        roomTypeSelect.appendChild(option);
    });
    
    rooms.forEach(room => {
        const type = roomTypes.find(t => t.id === room.typeId);
        
        let statusClass = '';
        let statusText = '';
        switch(room.status) {
            case 'available':
                statusClass = 'status-available';
                statusText = 'Свободен';
                break;
            case 'occupied':
                statusClass = 'status-occupied';
                statusText = 'Занят';
                break;
            case 'maintenance':
                statusClass = 'status-maintenance';
                statusText = 'На обслуживании';
                break;
            case 'reserved':
                statusClass = 'status-reserved';
                statusText = 'Забронирован';
                break;
        }
        
        const row = document.createElement('tr');
        row.innerHTML = `
            <td>${room.number}</td>
            <td>${type?.name || 'Неизвестно'}</td>
            <td>${room.floor}</td>
            <td><span class="status-badge ${statusClass}">${statusText}</span></td>
            <td>${type?.basePrice || '0'} ₽</td>
            <td>${type?.capacity || '2'}</td>
            <td>${room.features}</td>
            <td>
                <button onclick="showRoomDetails('${room.number}')">Подробнее</button>
                ${currentUser.role !== 'staff' ? `<button onclick="showEditRoomModal('${room.number}')">Изменить</button>` : ''}
                ${room.status === 'available' ? `<button onclick="bookRoom('${room.number}')" class="success">Забронировать</button>` : ''}
            </td>
        `;
        tbody.appendChild(row);
    });
    
    updateRoomStatusChart();
}

function showAddRoomModal() {
    document.getElementById('room-number').value = '';
    document.getElementById('room-floor').value = '1';
    document.getElementById('room-status').value = 'available';
    document.getElementById('room-features').value = '';
    document.getElementById('room-notes').value = '';
    
    const roomTypeSelect = document.getElementById('room-type');
    roomTypeSelect.innerHTML = '';
    roomTypes.forEach(type => {
        const option = document.createElement('option');
        option.value = type.id;
        option.textContent = `${type.name} (${type.basePrice} ₽)`;
        roomTypeSelect.appendChild(option);
    });
    
    showModal('addRoomModal');
}

function saveRoom() {
    const number = document.getElementById('room-number').value;
    const typeId = parseInt(document.getElementById('room-type').value);
    const floor = parseInt(document.getElementById('room-floor').value);
    const status = document.getElementById('room-status').value;
    const features = document.getElementById('room-features').value;
    const notes = document.getElementById('room-notes').value;
    
    if (!number || !typeId || !floor) {
        alert('Пожалуйста, заполните все обязательные поля!');
        return;
    }
    
    if (rooms.some(r => r.number === number)) {
        alert('Номер с таким номером уже существует!');
        return;
    }
    
    rooms.push({
        number: number,
        typeId: typeId,
        floor: floor,
        status: status,
        features: features || '',
        notes: notes || ''
    });
    
    saveToLocalStorage();
    closeModal('addRoomModal');
    loadRooms();
    alert('Номер успешно добавлен!');
}

function showRoomTypesModal() {
    loadRoomTypes();
    showModal('roomTypesModal');
}

function loadRoomTypes() {
    const tbody = document.getElementById('roomTypesList');
    tbody.innerHTML = '';
    
    roomTypes.forEach(type => {
        const row = document.createElement('tr');
        row.innerHTML = `
            <td>${type.id}</td>
            <td>${type.name}</td>
            <td>${type.description}</td>
            <td>${type.basePrice} ₽</td>
            <td>${type.capacity}</td>
            <td>
                <button onclick="showEditRoomTypeModal(${type.id})">Изменить</button>
                <button onclick="deleteRoomType(${type.id})" class="danger">Удалить</button>
            </td>
        `;
        tbody.appendChild(row);
    });
}

function showAddRoomTypeModal() {
    document.getElementById('room-type-name').value = '';
    document.getElementById('room-type-desc').value = '';
    document.getElementById('room-type-price').value = '';
    document.getElementById('room-type-capacity').value = '2';
    
    showModal('addRoomTypeModal');
}

function saveRoomType() {
    const name = document.getElementById('room-type-name').value;
    const description = document.getElementById('room-type-desc').value;
    const price = parseFloat(document.getElementById('room-type-price').value);
    const capacity = parseInt(document.getElementById('room-type-capacity').value);
    
    if (!name || !description || isNaN(price) || isNaN(capacity)) {
        alert('Пожалуйста, заполните все поля корректно!');
        return;
    }
    
    const newId = roomTypes.length > 0 ? Math.max(...roomTypes.map(t => t.id)) + 1 : 1;
    
    roomTypes.push({
        id: newId,
        name: name,
        description: description,
        basePrice: price,
        capacity: capacity
    });
    
    saveToLocalStorage();
    closeModal('addRoomTypeModal');
    loadRoomTypes();
    alert('Тип номера успешно добавлен!');
}

function updateRoomStatusChart() {
    const ctx = document.getElementById('roomChart').getContext('2d');
    
    const statusCounts = {
        available: 0,
        occupied: 0,
        maintenance: 0,
        reserved: 0
    };
    
    rooms.forEach(room => {
        statusCounts[room.status]++;
    });
    
    if (roomChart) {
        roomChart.destroy();
    }
    
    roomChart = new Chart(ctx, {
        type: 'doughnut',
        data: {
            labels: ['Свободны', 'Заняты', 'На обслуживании', 'Забронированы'],
            datasets: [{
                data: [
                    statusCounts.available,
                    statusCounts.occupied,
                    statusCounts.maintenance,
                    statusCounts.reserved
                ],
                backgroundColor: [
                    '#2ecc71',
                    '#e74c3c',
                    '#f39c12',
                    '#3498db'
                ],
                borderWidth: 1
            }]
        },
        options: {
            responsive: true,
            plugins: {
                legend: {
                    position: 'bottom',
                },
                title: {
                    display: true,
                    text: 'Статусы номеров'
                }
            }
        }
    });
}