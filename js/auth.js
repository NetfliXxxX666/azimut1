function login() {
    const username = document.getElementById('login-username').value;
    const password = document.getElementById('login-password').value;
    
    const user = staff.find(u => u.username === username && u.password === password);
    
    if (user) {
        currentUser = user;
        document.getElementById('auth-screen').classList.add('hidden');
        document.getElementById('app-container').classList.remove('hidden');
        updateUIForUserRole();
        loadDashboard();
        
        document.getElementById('current-user-name').textContent = user.fullname;
        
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
        
        const roleBadge = document.getElementById('current-user-role');
        roleBadge.textContent = roleText;
        roleBadge.className = 'role-badge ' + roleClass;
        
        loadGuests();
        loadRooms();
        loadBookings();
        loadStaff();
        loadServices();
    } else {
        alert('Неверный логин или пароль!');
    }
}

function logout() {
    currentUser = null;
    document.getElementById('app-container').classList.add('hidden');
    document.getElementById('auth-screen').classList.remove('hidden');
    document.getElementById('login-username').value = '';
    document.getElementById('login-password').value = '';
}

function showRegisterForm() {
    document.getElementById('auth-screen').classList.add('hidden');
    document.getElementById('register-screen').classList.remove('hidden');
}

function hideRegisterForm() {
    document.getElementById('register-screen').classList.add('hidden');
    document.getElementById('auth-screen').classList.remove('hidden');
}

function register() {
    const username = document.getElementById('reg-username').value;
    const password = document.getElementById('reg-password').value;
    const fullname = document.getElementById('reg-fullname').value;
    const role = document.getElementById('reg-role').value;
    
    if (!username || !password || !fullname) {
        alert('Пожалуйста, заполните все поля!');
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
        position: role === 'admin' ? 'Администратор' : 
                 role === 'manager' ? 'Менеджер' : 'Сотрудник',
        phone: '',
        email: '',
        status: 'active'
    });
    
    saveToLocalStorage();
    alert('Регистрация успешна! Теперь вы можете войти.');
    hideRegisterForm();
}

function updateUIForUserRole() {
    if (!currentUser) return;
    
    const adminOnlyTabs = ['settings', 'reports', 'staff'];
    const managerOnlyTabs = ['reports'];
    
    if (currentUser.role === 'staff') {
        adminOnlyTabs.concat(managerOnlyTabs).forEach(tabId => {
            const tab = document.querySelector(`.tab[onclick="openTab('${tabId}')"]`);
            if (tab) tab.style.display = 'none';
        });
    } else if (currentUser.role === 'manager') {
        adminOnlyTabs.forEach(tabId => {
            const tab = document.querySelector(`.tab[onclick="openTab('${tabId}')"]`);
            if (tab) tab.style.display = 'none';
        });
    }
    
    const adminOnlyButtons = ['add-staff-btn', 'add-service-btn', 'add-room-btn'];
    const managerOnlyButtons = ['add-service-btn'];
    
    if (currentUser.role === 'staff') {
        adminOnlyButtons.concat(managerOnlyButtons).forEach(btnId => {
            const btn = document.getElementById(btnId);
            if (btn) btn.style.display = 'none';
        });
    } else if (currentUser.role === 'manager') {
        adminOnlyButtons.forEach(btnId => {
            const btn = document.getElementById(btnId);
            if (btn) btn.style.display = 'none';
        });
    }
}