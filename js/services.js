// Глобальные переменные для услуг
let services = [];
let serviceCategories = [];

// Загрузка списка услуг
function loadServices() {
    const tbody = document.getElementById('servicesList');
    tbody.innerHTML = '';
    
    services.forEach(service => {
        const category = serviceCategories.find(c => c.id === service.categoryId);
        
        const row = document.createElement('tr');
        row.innerHTML = `
            <td>${service.id}</td>
            <td>${service.name}</td>
            <td>${category?.name || 'Неизвестно'}</td>
            <td>${service.price} ₽</td>
            <td>${service.duration} мин</td>
            <td>${service.status === 'available' ? 'Доступна' : 'Недоступна'}</td>
            <td>
                <button onclick="showEditServiceModal(${service.id})">Изменить</button>
                ${currentUser.role !== 'staff' ? `<button onclick="toggleServiceStatus(${service.id})" class="secondary">${service.status === 'available' ? 'Деактивировать' : 'Активировать'}</button>` : ''}
            </td>
        `;
        tbody.appendChild(row);
    });
}

// Показать модальное окно добавления услуги
function showAddServiceModal() {
    // Очистка формы
    document.getElementById('service-name').value = '';
    document.getElementById('service-category').value = '';
    document.getElementById('service-price').value = '';
    document.getElementById('service-duration').value = '30';
    
    // Заполнение выпадающего списка категорий
    const categorySelect = document.getElementById('service-category');
    categorySelect.innerHTML = '';
    serviceCategories.forEach(category => {
        const option = document.createElement('option');
        option.value = category.id;
        option.textContent = category.name;
        categorySelect.appendChild(option);
    });
    
    showModal('addServiceModal');
}

// Добавить новую услугу
function addService() {
    const name = document.getElementById('service-name').value;
    const categoryId = parseInt(document.getElementById('service-category').value);
    const price = parseFloat(document.getElementById('service-price').value);
    const duration = parseInt(document.getElementById('service-duration').value);
    
    if (!name || isNaN(categoryId) || isNaN(price) || isNaN(duration)) {
        alert('Пожалуйста, заполните все поля корректно!');
        return;
    }
    
    const newId = services.length > 0 ? Math.max(...services.map(s => s.id)) + 1 : 1;
    
    services.push({
        id: newId,
        name: name,
        categoryId: categoryId,
        price: price,
        duration: duration,
        status: 'available'
    });
    
    saveToLocalStorage();
    closeModal('addServiceModal');
    loadServices();
    alert('Услуга успешно добавлена!');
}

// Показать модальное окно редактирования услуги
function showEditServiceModal(id) {
    const service = services.find(s => s.id === id);
    if (!service) return;
    
    document.getElementById('edit-service-id').value = service.id;
    document.getElementById('edit-service-name').value = service.name;
    document.getElementById('edit-service-price').value = service.price;
    document.getElementById('edit-service-duration').value = service.duration;
    
    // Заполнение выпадающего списка категорий
    const categorySelect = document.getElementById('edit-service-category');
    categorySelect.innerHTML = '';
    serviceCategories.forEach(category => {
        const option = document.createElement('option');
        option.value = category.id;
        option.textContent = category.name;
        if (category.id === service.categoryId) option.selected = true;
        categorySelect.appendChild(option);
    });
    
    showModal('editServiceModal');
}

// Обновить данные услуги
function updateService() {
    const id = parseInt(document.getElementById('edit-service-id').value);
    const name = document.getElementById('edit-service-name').value;
    const categoryId = parseInt(document.getElementById('edit-service-category').value);
    const price = parseFloat(document.getElementById('edit-service-price').value);
    const duration = parseInt(document.getElementById('edit-service-duration').value);
    
    if (!name || isNaN(categoryId) || isNaN(price) || isNaN(duration)) {
        alert('Пожалуйста, заполните все поля корректно!');
        return;
    }
    
    const serviceIndex = services.findIndex(s => s.id === id);
    if (serviceIndex === -1) return;
    
    services[serviceIndex] = {
        ...services[serviceIndex],
        name: name,
        categoryId: categoryId,
        price: price,
        duration: duration
    };
    
    saveToLocalStorage();
    closeModal('editServiceModal');
    loadServices();
    alert('Данные услуги обновлены!');
}

// Переключить статус услуги
function toggleServiceStatus(id) {
    const serviceIndex = services.findIndex(s => s.id === id);
    if (serviceIndex === -1) return;
    
    services[serviceIndex].status = services[serviceIndex].status === 'available' ? 'unavailable' : 'available';
    saveToLocalStorage();
    loadServices();
    alert(`Услуга ${services[serviceIndex].status === 'available' ? 'активирована' : 'деактивирована'}!`);
}

// Показать модальное окно категорий услуг
function showServiceCategoriesModal() {
    loadServiceCategories();
    showModal('serviceCategoriesModal');
}

// Загрузка списка категорий услуг
function loadServiceCategories() {
    const tbody = document.getElementById('serviceCategoriesList');
    tbody.innerHTML = '';
    
    serviceCategories.forEach(category => {
        const row = document.createElement('tr');
        row.innerHTML = `
            <td>${category.id}</td>
            <td>${category.name}</td>
            <td>
                <button onclick="showEditServiceCategoryModal(${category.id})">Изменить</button>
                <button onclick="deleteServiceCategory(${category.id})" class="danger">Удалить</button>
            </td>
        `;
        tbody.appendChild(row);
    });
}

// Поиск услуг
function searchServices() {
    const input = document.getElementById('serviceSearch').value.toLowerCase();
    const rows = document.querySelectorAll('#servicesList tr');
    
    rows.forEach(row => {
        const serviceName = row.cells[1].textContent.toLowerCase();
        const category = row.cells[2].textContent.toLowerCase();
        
        if (serviceName.includes(input) || category.includes(input)) {
            row.style.display = '';
        } else {
            row.style.display = 'none';
        }
    });
}