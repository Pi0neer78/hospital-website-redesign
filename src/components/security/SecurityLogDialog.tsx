/* eslint-disable @typescript-eslint/no-explicit-any */
import { Button } from '@/components/ui/button';
import Icon from '@/components/ui/icon';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import * as XLSX from 'xlsx';

interface SecurityLogDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  logEntries: any[];
  logLoading: boolean;
  logFilterAdmin: string;
}

const SecurityLogDialog = ({
  open,
  onOpenChange,
  logEntries,
  logLoading,
  logFilterAdmin,
}: SecurityLogDialogProps) => {
  const title = logFilterAdmin ? `Журнал действий: ${logFilterAdmin}` : 'Общий журнал действий главного врача';

  const handlePrint = () => {
    if (logEntries.length === 0) return;
    const printWindow = window.open('', '_blank');
    if (!printWindow) return;
    const printContent = `
<!DOCTYPE html>
<html>
<head>
  <meta charset="utf-8">
  <title>${title}</title>
  <style>
    @page { margin: 10mm; }
    body { font-family: Arial, sans-serif; font-size: 12px; }
    .header { text-align: center; margin-bottom: 15px; }
    .header h2 { margin: 5px 0; font-size: 16px; }
    .header p { margin: 3px 0; font-size: 11px; color: #666; }
    table { width: 100%; border-collapse: collapse; }
    th, td { border: 1px solid #333; padding: 5px; text-align: left; font-size: 11px; }
    th { background: #f0f0f0; font-weight: bold; }
    .footer { font-size: 10px; color: #666; margin-top: 10px; text-align: right; }
  </style>
</head>
<body>
  <div class="header">
    <h2>${title}</h2>
    <p>ГБУЗ Антрацитовская ЦГМБ ЛНР</p>
    <p>Дата печати: ${new Date().toLocaleString('ru-RU')}</p>
  </div>
  <table>
    <thead>
      <tr>
        <th>№</th>
        <th>Дата</th>
        <th>Администратор</th>
        <th>Действие</th>
        <th>Подробности</th>
        <th>IP</th>
      </tr>
    </thead>
    <tbody>
      ${logEntries.map((log: any, idx: number) => {
        let details = '';
        try {
          const d = JSON.parse(log.details);
          details = Object.entries(d).map(([k, v]) => `${k}: ${v}`).join(', ');
        } catch {
          details = log.details || '';
        }
        return `
        <tr>
          <td>${idx + 1}</td>
          <td>${new Date(log.created_at).toLocaleString('ru-RU', { day: '2-digit', month: '2-digit', year: '2-digit', hour: '2-digit', minute: '2-digit' }).replace(',', '')}</td>
          <td>${log.admin_login || '—'}</td>
          <td>${log.action_type}</td>
          <td>${details}</td>
          <td>${log.ip_address || '—'}</td>
        </tr>
        `;
      }).join('')}
    </tbody>
  </table>
  <div class="footer">Всего записей: ${logEntries.length}</div>
</body>
</html>`;
    printWindow.document.write(printContent);
    printWindow.document.close();
    printWindow.focus();
    setTimeout(() => { printWindow.print(); printWindow.close(); }, 250);
  };

  const handleExportExcel = () => {
    if (logEntries.length === 0) return;
    const rows = logEntries.map((log: any) => {
      let details = '';
      try {
        const d = JSON.parse(log.details);
        details = Object.entries(d).map(([k, v]) => `${k}: ${v}`).join(', ');
      } catch {
        details = log.details || '';
      }
      return {
        'Дата': new Date(log.created_at).toLocaleString('ru-RU', { day: '2-digit', month: '2-digit', year: '2-digit', hour: '2-digit', minute: '2-digit' }).replace(',', ''),
        'Администратор': log.admin_login || '',
        'Действие': log.action_type || '',
        'Подробности': details,
        'IP': log.ip_address || ''
      };
    });
    const ws = XLSX.utils.json_to_sheet(rows);
    ws['!cols'] = [{ wch: 16 }, { wch: 20 }, { wch: 30 }, { wch: 50 }, { wch: 15 }];
    const wb = XLSX.utils.book_new();
    XLSX.utils.book_append_sheet(wb, ws, 'Журнал');
    const fileName = logFilterAdmin
      ? `журнал_${logFilterAdmin}_${new Date().toISOString().split('T')[0]}.xlsx`
      : `журнал_главврач_${new Date().toISOString().split('T')[0]}.xlsx`;
    XLSX.writeFile(wb, fileName);
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-4xl max-h-[80vh]">
        <DialogHeader>
          <DialogTitle className="text-base flex items-center gap-2">
            <Icon name="ScrollText" size={18} />
            {title}
          </DialogTitle>
        </DialogHeader>
        <div className="flex gap-2 mb-3">
          <Button variant="outline" size="sm" onClick={handlePrint} disabled={logEntries.length === 0}>
            <Icon name="Printer" size={14} className="mr-1" />
            Печать
          </Button>
          <Button
            variant="outline"
            size="sm"
            className="bg-green-600 text-white hover:bg-green-700 border-green-600"
            onClick={handleExportExcel}
            disabled={logEntries.length === 0}
          >
            <Icon name="Download" size={14} className="mr-1" />
            Экспорт в Excel
          </Button>
        </div>
        <div className="overflow-y-auto" style={{ maxHeight: '60vh' }}>
          {logLoading ? (
            <div className="text-center py-8 text-muted-foreground">Загрузка...</div>
          ) : logEntries.length === 0 ? (
            <div className="text-center py-8 text-muted-foreground">Нет записей</div>
          ) : (
            <Table>
              <TableHeader>
                <TableRow className="text-xs">
                  <TableHead className="py-2">Дата</TableHead>
                  <TableHead className="py-2">Администратор</TableHead>
                  <TableHead className="py-2">Действие</TableHead>
                  <TableHead className="py-2">Подробности</TableHead>
                  <TableHead className="py-2">IP</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {logEntries.map((log: any) => (
                  <TableRow key={log.id} className="text-xs">
                    <TableCell className="py-2 whitespace-nowrap">
                      {new Date(log.created_at).toLocaleString('ru-RU', {
                        day: '2-digit', month: '2-digit', year: '2-digit',
                        hour: '2-digit', minute: '2-digit'
                      }).replace(',', '')}
                    </TableCell>
                    <TableCell className="py-2">{log.admin_login || '—'}</TableCell>
                    <TableCell className="py-2">
                      <span className="px-1.5 py-0.5 rounded bg-blue-100 text-blue-800 text-[10px]">
                        {log.action_type}
                      </span>
                    </TableCell>
                    <TableCell className="py-2 max-w-xs">
                      <div className="line-clamp-2 text-[11px] text-muted-foreground" title={log.details}>
                        {(() => {
                          try {
                            const d = JSON.parse(log.details);
                            return Object.entries(d).map(([k, v]) => `${k}: ${v}`).join(', ');
                          } catch {
                            return log.details || '—';
                          }
                        })()}
                      </div>
                    </TableCell>
                    <TableCell className="py-2 text-muted-foreground">{log.ip_address || '—'}</TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          )}
        </div>
      </DialogContent>
    </Dialog>
  );
};

export default SecurityLogDialog;
