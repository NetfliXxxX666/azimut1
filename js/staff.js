// Глобальные переменные для персонала
let staff = [];

// Загрузка списка персонала
function loadStaff() {
    const tbody = document.getElementById('staffList');
    tbody.innerHTML = '';
    
    staff.forEach(user => {
        let roleClass = '';
        let roleText = '';
        switch(user.role) {
            case 'admin':
                roleClass = 'role-admin';
                roleText = 'Админ';
                break;
            case 'manager':
                roleClass = 'role-manager';
                roleText = 'Менеджер';
                break;
            default:
                roleClass = 'role-staff';
                roleText = 'Сотрудник';
        }
        
        const row = document.createElement('tr');
        row.innerHTML = `
            <td>${user.id}</td>
            <td>${user.fullname}</td>
            <td>${user.position}</td>
            <td><span class="role-badge ${roleClass}">${roleText}</span></td>
            <td>${user.phone}<br>${user.email}</td>
            <td>${user.status === 'active' ? 'Активен' : 'Неактивен'}</td>
            <td>
                <button onclick="showEditStaffModal(${user.id})">Изменить</button>
                ${currentUser.role === 'admin' && user.id !== currentUser.id ? `<button onclick="deleteStaff(${user.id})" class="danger">Удалить</button>` : ''}
            </td>
        `;
        tbody.appendChild(row);
    });
}

// Показать модальное окно добавления сотрудника
function showAddStaffModal() {
    // Очистка формы
    document.getElementById('staff-username').value = '';
    document.getElementById('staff-password').value = '';
    document.getElementById('staff-fullname').value = '';
    document.getElementById('staff-role').value = 'staff';
    document.getElementById('staff-position').value = '';
    document.getElementById('staff-phone').value = '';
    document.getElementById('staff-email').value = '';
    
    showModal('addStaffModal');
}

// Добавить нового сотрудника
function addStaff() {
    const username = document.getElementById('staff-username').value;
    const password = document.getElementById('staff-password').value;
    const fullname = document.getElementById('staff-fullname').value;
    const role = document.getElementById('staff-role').value;
    const position = document.getElementById('staff-position').value;
    const phone = document.getElementById('staff-phone').value;
    const email = document.getElementById('staff-email').value;
    
    if (!username || !password || !fullname || !role || !position) {
        alert('Пожалуйста, заполните все обязательные поля!');
        return;
    }
    
    if (staff.some(u => u.username === username)) {
        alert('Пользователь с таким логином уже существует!');
        return;
    }
    
    const newId = staff.length > 0 ? Math.max(...staff.map(u => u.id)) + 1 : 1;
    
    staff.push({
        id: newId,
        username: username,
        password: password,
        fullname: fullname,
        role: role,
        position: position,
        phone: phone || '',
        email: email || '',
        status: 'active'
    });
    
    saveToLocalStorage();
    closeModal('addStaffModal');
    loadStaff();
    alert('Сотрудник успешно добавлен!');
}

// Показать модальное окно редактирования сотрудника
function showEditStaffModal(id) {
    const user = staff.find(u => u.id === id);
    if (!user) return;
    
    document.getElementById('edit-staff-id').value = user.id;
    document.getElementById('edit-staff-username').value = user.username;
    document.getElementById('edit-staff-fullname').value = user.fullname;
    document.getElementById('edit-staff-role').value = user.role;
    document.getElementById('edit-staff-position').value = user.position;
    document.getElementById('edit-staff-phone').value = user.phone;
    document.getElementById('edit-staff-email').value = user.email;
    document.getElementById('edit-staff-status').value = user.status;
    
    showModal('editStaffModal');
}

// Обновить данные сотрудника
function updateStaff() {
    const id = parseInt(document.getElementById('edit-staff-id').value);
    const username = document.getElementById('edit-staff-username').value;
    const fullname = document.getElementById('edit-staff-fullname').value;
    const role = document.getElementById('edit-staff-role').value;
    const position = document.getElementById('edit-staff-position').value;
    const phone = document.getElementById('edit-staff-phone').value;
    const email = document.getElementById('edit-staff-email').value;
    const status = document.getElementById('edit-staff-status').value;
    
    if (!username || !fullname || !role || !position) {
        alert('Пожалуйста, заполните все обязательные поля!');
        return;
    }
    
    const userIndex = staff.findIndex(u => u.id === id);
    if (userIndex === -1) return;
    
    // Проверка уникальности логина
    if (staff.some(u => u.username === username && u.id !== id)) {
        alert('Пользователь с таким логином уже существует!');
        return;
    }
    
    staff[userIndex] = {
        ...staff[userIndex],
        username: username,
        fullname: fullname,
        role: role,
        position: position,
        phone: phone || '',
        email: email || '',
        status: status
    };
    
    saveToLocalStorage();
    closeModal('editStaffModal');
    loadStaff();
    alert('Данные сотрудника обновлены!');
}

// Удалить сотрудника
function deleteStaff(id) {
    if (id === currentUser.id) {
        alert('Вы не можете удалить самого себя!');
        return;
    }
    
    if (confirm('Вы уверены, что хотите удалить этого сотрудника?')) {
        staff = staff.filter(user => user.id !== id);
        saveToLocalStorage();
        loadStaff();
        alert('Сотрудник удален!');
    }
}

// Поиск сотрудников
function searchStaff() {
    const input = document.getElementById('staffSearch').value.toLowerCase();
    const rows = document.querySelectorAll('#staffList tr');
    
    rows.forEach(row => {
        const fullname = row.cells[1].textContent.toLowerCase();
        const position = row.cells[2].textContent.toLowerCase();
        
        if (fullname.includes(input) || position.includes(input)) {
            row.style.display = '';
        } else {
            row.style.display = 'none';
        }
    });
}

// Показать модальное окно графика работы
function showScheduleModal() {
    // Здесь должна быть реализация графика работы
    alert('График работы будет реализован в следующей версии!');
}