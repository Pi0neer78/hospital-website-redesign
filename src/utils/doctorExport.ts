import * as XLSX from 'xlsx';
import type { Appointment, DoctorInfo } from '@/types/doctor';

export const exportToExcel = (appointments: Appointment[], doctorInfo: DoctorInfo) => {
  const data = appointments.map(app => ({
    'Дата': new Date(app.appointment_date).toLocaleDateString('ru-RU'),
    'Время': app.appointment_time,
    'ФИО пациента': app.patient_name,
    'Телефон': app.patient_phone,
    'СНИЛС': app.patient_snils || '',
    'ОМС': app.patient_oms || '',
    'Описание': app.description || '',
    'Статус': app.status === 'scheduled' ? 'Запланирован' : app.status === 'completed' ? 'Завершен' : 'Отменен'
  }));

  const ws = XLSX.utils.json_to_sheet(data);
  const wb = XLSX.utils.book_new();
  XLSX.utils.book_append_sheet(wb, ws, 'Записи');
  
  const fileName = `записи_${doctorInfo.full_name}_${new Date().toLocaleDateString('ru-RU')}.xlsx`;
  XLSX.writeFile(wb, fileName);
};

export const printAppointments = (
  appointments: Appointment[],
  doctorInfo: DoctorInfo,
  statusFilter: string,
  dateFilterFrom: string,
  dateFilterTo: string,
  searchQuery: string
) => {
  const printWindow = window.open('', '_blank');
  if (!printWindow) return;

  const filteredAppointments = appointments.filter(app => {
    const matchesStatus = statusFilter === 'all' || app.status === statusFilter;
    const matchesSearch = !searchQuery || 
      app.patient_name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      app.patient_phone.includes(searchQuery) ||
      (app.patient_snils && app.patient_snils.includes(searchQuery)) ||
      (app.patient_oms && app.patient_oms.includes(searchQuery));
    return matchesStatus && matchesSearch;
  });

  const tableRows = filteredAppointments
    .map(app => `
      <tr>
        <td style="border: 1px solid #ddd; padding: 8px;">${new Date(app.appointment_date).toLocaleDateString('ru-RU')}</td>
        <td style="border: 1px solid #ddd; padding: 8px;">${app.appointment_time}</td>
        <td style="border: 1px solid #ddd; padding: 8px;">${app.patient_name}</td>
        <td style="border: 1px solid #ddd; padding: 8px;">${app.patient_phone}</td>
        <td style="border: 1px solid #ddd; padding: 8px;">${app.patient_snils || ''}</td>
        <td style="border: 1px solid #ddd; padding: 8px;">${app.patient_oms || ''}</td>
        <td style="border: 1px solid #ddd; padding: 8px;">${app.description || ''}</td>
        <td style="border: 1px solid #ddd; padding: 8px;">${app.status === 'scheduled' ? 'Запланирован' : app.status === 'completed' ? 'Завершен' : 'Отменен'}</td>
      </tr>
    `)
    .join('');

  printWindow.document.write(`
    <!DOCTYPE html>
    <html>
      <head>
        <title>Записи на прием</title>
        <meta charset="UTF-8">
        <style>
          body { font-family: Arial, sans-serif; margin: 20px; }
          h1 { font-size: 20px; margin-bottom: 10px; }
          table { border-collapse: collapse; width: 100%; margin-top: 20px; }
          th { border: 1px solid #ddd; padding: 8px; background-color: #f2f2f2; text-align: left; }
          td { border: 1px solid #ddd; padding: 8px; }
          .info { margin-bottom: 20px; }
          @media print { body { margin: 0; } }
        </style>
      </head>
      <body>
        <h1>Записи на прием</h1>
        <div class="info">
          <p><strong>Врач:</strong> ${doctorInfo.full_name}</p>
          <p><strong>Должность:</strong> ${doctorInfo.position}</p>
          <p><strong>Период:</strong> ${new Date(dateFilterFrom).toLocaleDateString('ru-RU')} - ${new Date(dateFilterTo).toLocaleDateString('ru-RU')}</p>
          <p><strong>Дата формирования:</strong> ${new Date().toLocaleDateString('ru-RU')} ${new Date().toLocaleTimeString('ru-RU')}</p>
        </div>
        <table>
          <thead>
            <tr>
              <th>Дата</th>
              <th>Время</th>
              <th>ФИО пациента</th>
              <th>Телефон</th>
              <th>СНИЛС</th>
              <th>ОМС</th>
              <th>Описание</th>
              <th>Статус</th>
            </tr>
          </thead>
          <tbody>
            ${tableRows}
          </tbody>
        </table>
      </body>
    </html>
  `);
  
  printWindow.document.close();
  printWindow.print();
};
