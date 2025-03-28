const { jsPDF } = window.jspdf;
let currentUser = null;
let hotelName = "Премиум Отель";
let rooms = [];
let guests = [];
let bookings = [];
let staff = [];
let services = [];
let roomTypes = [];
let serviceCategories = [];
let roomChart = null;

function initData() {
    if (localStorage.getItem('hotelData')) {
        loadFromLocalStorage();
    } else {
        initDefaultData();
        saveToLocalStorage();
    }
    document.getElementById('hotel-name').textContent = hotelName;
    document.getElementById('hotel-name-input').value = hotelName;
}

function initDefaultData() {
    roomTypes = [
        { id: 1, name: "Стандарт", description: "Стандартный номер с одной кроватью", basePrice: 2500, capacity: 2 },
        { id: 2, name: "Люкс", description: "Просторный номер с гостиной зоной", basePrice: 5000, capacity: 3 },
        { id: 3, name: "Делюкс", description: "Номер повышенной комфортности", basePrice: 7500, capacity: 2 },
        { id: 4, name: "Сьют", description: "Роскошный номер с отдельной гостиной", basePrice: 10000, capacity: 4 }
    ];

    serviceCategories = [
        { id: 1, name: "Питание" },
        { id: 2, name: "Транспорт" },
        { id: 3, name: "СПА" },
        { id: 4, name: "Экскурсии" }
    ];

    rooms = [
        { number: "101", typeId: 1, floor: 1, status: "available", features: "Кондиционер, TV", notes: "" },
        { number: "102", typeId: 1, floor: 1, status: "occupied", features: "Кондиционер, TV", notes: "" },
        { number: "201", typeId: 2, floor: 2, status: "maintenance", features: "Кондиционер, TV, мини-бар", notes: "Требуется ремонт ванной" },
        { number: "202", typeId: 2, floor: 2, status: "available", features: "Кондиционер, TV, мини-бар", notes: "" },
        { number: "301", typeId: 3, floor: 3, status: "available", features: "Кондиционер, TV, мини-бар, джакузи", notes: "" },
        { number: "302", typeId: 4, floor: 3, status: "available", features: "Кондиционер, TV, мини-бар, джакузи, отдельная гостиная", notes: "" }
    ];

    guests = [
        { id: 1, name: "Смирнов Алексей Владимирович", phone: "+7 912 345-67-89", email: "alex.smirnov@example.com", 
          passport: "4510 123456", country: "Россия", notes: "Предпочитает номер подальше от лифта", bookings: [101] },
        { id: 2, name: "Кузнецова Елена Игоревна", phone: "+7 923 456-78-90", email: "elena.k@example.com", 
          passport: "4511 654321", country: "Россия", notes: "Аллергия на цветы", bookings: [201] },
        { id: 3, name: "Попов Дмитрий Сергеевич", phone: "+7 934 567-89-01", email: "d.popov@example.com", 
          passport: "4520 112233", country: "Россия", notes: "", bookings: [] }
    ];

    bookings = [
        { id: 1, guestId: 1, roomNumber: "101", checkIn: getDateString(0), checkOut: getDateString(5), 
          status: "checked-in", totalPrice: 12500, createdAt: getDateString(-10), createdBy: 1 },
        { id: 2, guestId: 2, roomNumber: "201", checkIn: getDateString(-2), checkOut: getDateString(3), 
          status: "checked-in", totalPrice: 25000, createdAt: getDateString(-12), createdBy: 1 },
        { id: 3, guestId: 3, roomNumber: "102", checkIn: getDateString(5), checkOut: getDateString(7), 
          status: "confirmed", totalPrice: 5000, createdAt: getDateString(-5), createdBy: 2 }
    ];

    services = [
        { id: 1, name: "Завтрак в номер", categoryId: 1, price: 500, duration: 60, status: "available" },
        { id: 2, name: "Трансфер из аэропорта", categoryId: 2, price: 1000, duration: 30, status: "available" },
        { id: 3, name: "Массаж спины", categoryId: 3, price: 2000, duration: 45, status: "available" },
        { id: 4, name: "Экскурсия по городу", categoryId: 4, price: 1500, duration: 120, status: "unavailable" }
    ];

    staff = [
        { id: 1, username: "admin", password: "admin123", fullname: "Иванова Мария Петровна", 
          role: "admin", position: "Администратор", phone: "+7 123 456-78-90", 
          email: "m.ivanova@hotel.com", status: "active" },
        { id: 2, username: "manager", password: "manager123", fullname: "Петров Иван Сергеевич", 
          role: "manager", position: "Менеджер", phone: "+7 987 654-32-10", 
          email: "i.petrov@hotel.com", status: "active" },
        { id: 3, username: "cleaner1", password: "cleaner123", fullname: "Сидорова Ольга Николаевна", 
          role: "staff", position: "Горничная", phone: "+7 111 222-33-44", 
          email: "o.sidorova@hotel.com", status: "active" }
    ];
}

function getDateString(daysOffset) {
    const date = new Date();
    date.setDate(date.getDate() + daysOffset);
    return date.toISOString().split('T')[0];
}

function saveToLocalStorage() {
    const hotelData = {
        hotelName: hotelName,
        rooms: rooms,
        guests: guests,
        bookings: bookings,
        staff: staff,
        services: services,
        roomTypes: roomTypes,
        serviceCategories: serviceCategories
    };
    localStorage.setItem('hotelData', JSON.stringify(hotelData));
}

function loadFromLocalStorage() {
    const hotelData = JSON.parse(localStorage.getItem('hotelData'));
    if (hotelData) {
        hotelName = hotelData.hotelName || "Премиум Отель";
        rooms = hotelData.rooms || [];
        guests = hotelData.guests || [];
        bookings = hotelData.bookings || [];
        staff = hotelData.staff || [];
        services = hotelData.services || [];
        roomTypes = hotelData.roomTypes || [];
        serviceCategories = hotelData.serviceCategories || [];
    }
}

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