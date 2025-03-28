function generateReport() {
    const reportType = document.getElementById('report-type').value;
    const reportPeriod = document.getElementById('report-period').value;
    
    let startDate, endDate;
    
    if (reportPeriod === 'custom') {
        startDate = new Date(document.getElementById('start-date').value);
        endDate = new Date(document.getElementById('end-date').value);
    } else {
        endDate = new Date();
        startDate = new Date();
        
        switch(reportPeriod) {
            case 'today':
                startDate.setHours(0, 0, 0, 0);
                break;
            case 'week':
                startDate.setDate(startDate.getDate() - 7);
                break;
            case 'month':
                startDate.setMonth(startDate.getMonth() - 1);
                break;
            case 'quarter':
                startDate.setMonth(startDate.getMonth() - 3);
                break;
            case 'year':
                startDate.setFullYear(startDate.getFullYear() - 1);
                break;
        }
    }
    
    let reportContent = '';
    let reportTitle = '';
    
    switch(reportType) {
        case 'occupancy':
            reportTitle = 'Отчет по загрузке номеров';
            const occupiedRooms = bookings.filter(b => 
                new Date(b.checkIn) <= endDate && 
                new Date(b.checkOut) >= startDate
            ).length;
            
            const occupancyRate = (occupiedRooms / rooms.length * 100).toFixed(2);
            
            reportContent = `
                <h3>Статистика загрузки номеров</h3>
                <p>Период: ${startDate.toLocaleDateString()} - ${endDate.toLocaleDateString()}</p>
                <table>
                    <tr>
                        <th>Всего номеров:</th>
                        <td>${rooms.length}</td>
                    </tr>
                    <tr>
                        <th>Занято номеров:</th>
                        <td>${occupiedRooms}</td>
                    </tr>
                    <tr>
                        <th>Процент загрузки:</th>
                        <td>${occupancyRate}%</td>
                    </tr>
                </table>
            `;
            break;
            
        case 'revenue':
            reportTitle = 'Отчет по доходам';
            const relevantBookings = bookings.filter(b => 
                new Date(b.createdAt) >= startDate && 
                new Date(b.createdAt) <= endDate
            );
            
            const totalRevenue = relevantBookings.reduce((sum, b) => sum + b.totalPrice, 0);
            const avgRevenue = relevantBookings.length > 0 ? (totalRevenue / relevantBookings.length).toFixed(2) : 0;
            
            reportContent = `
                <h3>Финансовая статистика</h3>
                <p>Период: ${startDate.toLocaleDateString()} - ${endDate.toLocaleDateString()}</p>
                <table>
                    <tr>
                        <th>Всего бронирований:</th>
                        <td>${relevantBookings.length}</td>
                    </tr>
                    <tr>
                        <th>Общий доход:</th>
                        <td>${totalRevenue} ₽</td>
                    </tr>
                    <tr>
                        <th>Средний чек:</th>
                        <td>${avgRevenue} ₽</td>
                    </tr>
                </table>
            `;
            break;
            
        case 'guests':
            reportTitle = 'Отчет по гостям';
            const guestCountries = {};
            guests.forEach(guest => {
                guestCountries[guest.country] = (guestCountries[guest.country] || 0) + 1;
            });
            
            let countriesHTML = Object.entries(guestCountries)
                .map(([country, count]) => `<tr><td>${country}</td><td>${count}</td></tr>`)
                .join('');
            
            reportContent = `
                <h3>Статистика по гостям</h3>
                <p>Всего гостей: ${guests.length}</p>
                <h4>Распределение по странам:</h4>
                <table>
                    <tr><th>Страна</th><th>Количество</th></tr>
                    ${countriesHTML}
                </table>
            `;
            break;
            
        case 'services':
            reportTitle = 'Отчет по услугам';
            let servicesHTML = services
                .map(service => {
                    const category = serviceCategories.find(c => c.id === service.categoryId);
                    return `
                        <tr>
                            <td>${service.name}</td>
                            <td>${category?.name || 'Неизвестно'}</td>
                            <td>${service.price} ₽</td>
                            <td>${service.status === 'available' ? 'Доступна' : 'Недоступна'}</td>
                        </tr>
                    `;
                })
                .join('');
            
            reportContent = `
                <h3>Список услуг отеля</h3>
                <p>Всего услуг: ${services.length}</p>
                <table>
                    <tr><th>Услуга</th><th>Категория</th><th>Цена</th><th>Статус</th></tr>
                    ${servicesHTML}
                </table>
            `;
            break;
    }
    
    document.getElementById('report-content').innerHTML = `
        <h2>${reportTitle}</h2>
        ${reportContent}
        <p>Сгенерировано: ${new Date().toLocaleString()}</p>
    `;
    
    document.getElementById('report-results').style.display = 'block';
}

function exportReportToPDF() {
    const reportType = document.getElementById('report-type').value;
    const doc = new jsPDF();
    
    doc.setFontSize(18);
    doc.text('Отель ' + hotelName, 105, 15, { align: 'center' });
    doc.setFontSize(14);
    doc.text('Отчет: ' + getReportTypeName(reportType), 105, 25, { align: 'center' });
    
    doc.setFontSize(10);
    doc.text('Сгенерировано: ' + new Date().toLocaleString(), 105, 32, { align: 'center' });
    
    switch(reportType) {
        case 'occupancy':
            generateOccupancyPDF(doc);
            break;
        case 'revenue':
            generateRevenuePDF(doc);
            break;
        case 'guests':
            generateGuestsPDF(doc);
            break;
        case 'services':
            generateServicesPDF(doc);
            break;
    }
    
    doc.save(`Отчет_${getReportTypeName(reportType)}_${new Date().toISOString().split('T')[0]}.pdf`);
}

function getReportTypeName(type) {
    const names = {
        'occupancy': 'Загрузка номеров',
        'revenue': 'Доходы',
        'guests': 'Гости',
        'services': 'Услуги'
    };
    return names[type] || type;
}

function generateOccupancyPDF(doc) {
    const startY = 40;
    
    const occupiedRooms = bookings.filter(b => b.status === 'checked-in').length;
    const occupancyRate = (occupiedRooms / rooms.length * 100).toFixed(2);
    
    doc.text('Статистика загрузки номеров:', 14, startY);
    doc.text(`Всего номеров: ${rooms.length}`, 14, startY + 10);
    doc.text(`Занято номеров: ${occupiedRooms}`, 14, startY + 20);
    doc.text(`Процент загрузки: ${occupancyRate}%`, 14, startY + 30);
    
    const statusCounts = {
        available: 0,
        occupied: 0,
        maintenance: 0,
        reserved: 0
    };
    
    rooms.forEach(room => {
        statusCounts[room.status]++;
    });
    
    doc.autoTable({
        startY: startY + 40,
        head: [['Статус', 'Количество']],
        body: [
            ['Свободны', statusCounts.available],
            ['Заняты', statusCounts.occupied],
            ['На обслуживании', statusCounts.maintenance],
            ['Забронированы', statusCounts.reserved]
        ],
        headStyles: { fillColor: [52, 152, 219] }
    });
}

function generateRevenuePDF(doc) {
    const startY = 40;
    
    const totalRevenue = bookings.reduce((sum, b) => sum + b.totalPrice, 0);
    const avgRevenue = bookings.length > 0 ? (totalRevenue / bookings.length).toFixed(2) : 0;
    
    doc.text('Финансовая статистика:', 14, startY);
    doc.text(`Всего бронирований: ${bookings.length}`, 14, startY + 10);
    doc.text(`Общий доход: ${totalRevenue} ₽`, 14, startY + 20);
    doc.text(`Средний чек: ${avgRevenue} ₽`, 14, startY + 30);
    
    const bookingData = bookings.slice(0, 10).map(booking => {
        const guest = guests.find(g => g.id === booking.guestId);
        return [
            booking.id,
            guest?.name || 'Неизвестно',
            booking.roomNumber,
            booking.totalPrice + ' ₽',
            booking.status === 'checked-in' ? 'Заселен' : 
            booking.status === 'confirmed' ? 'Подтвержден' : 
            booking.status === 'cancelled' ? 'Отменен' : 'Выселен'
        ];
    });
    
    doc.autoTable({
        startY: startY + 50,
        head: [['ID', 'Гость', 'Номер', 'Сумма', 'Статус']],
        body: bookingData,
        headStyles: { fillColor: [52, 152, 219] },
        styles: { fontSize: 8 }
    });
}

function generateGuestsPDF(doc) {
    const startY = 40;
    
    doc.text('Статистика по гостям:', 14, startY);
    doc.text(`Всего гостей: ${guests.length}`, 14, startY + 10);
    
    const guestCountries = {};
    guests.forEach(guest => {
        guestCountries[guest.country] = (guestCountries[guest.country] || 0) + 1;
    });
    
    const countryData = Object.entries(guestCountries).map(([country, count]) => [country, count.toString()]);
    
    doc.text('Распределение по странам:', 14, startY + 30);
    doc.autoTable({
        startY: startY + 40,
        head: [['Страна', 'Количество']],
        body: countryData,
        headStyles: { fillColor: [52, 152, 219] }
    });
    
    const currentGuests = bookings.filter(b => b.status === 'checked-in').length;
    doc.text(`Текущие гости: ${currentGuests}`, 14, startY + 70);
}

function generateServicesPDF(doc) {
    const startY = 40;
    
    doc.text('Список услуг отеля:', 14, startY);
    
    const serviceData = services.map(service => {
        const category = serviceCategories.find(c => c.id === service.categoryId);
        return [
            service.name,
            category?.name || 'Неизвестно',
            service.price + ' ₽',
            service.duration + ' мин',
            service.status === 'available' ? 'Доступна' : 'Недоступна'
        ];
    });
    
    doc.autoTable({
        startY: startY + 10,
        head: [['Услуга', 'Категория', 'Цена', 'Длительность', 'Статус']],
        body: serviceData,
        headStyles: { fillColor: [52, 152, 219] }
    });
}