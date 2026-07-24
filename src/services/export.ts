import { Trade, RiskSettings } from '../types';

/**
 * Export Trades to CSV Format
 */
export function exportTradesToCSV(trades: Trade[]): void {
  const headers = [
    'ID', 'Pair', 'Date', 'Time', 'Direction', 'Status', 'Result',
    'Entry Price', 'Stop Loss', 'Take Profit', 'Exit Price', 'RR',
    'Risk %', 'PNL ($)', 'PNL (%)', 'Strategy', 'Psychology', 'Notes'
  ];

  const rows = trades.map(t => [
    t.id,
    `"${t.pair}"`,
    t.date,
    t.time,
    t.direction,
    t.status,
    t.result,
    t.entryPrice,
    t.stopLoss,
    t.takeProfit,
    t.exitPrice ?? '',
    t.rr,
    t.riskPercent,
    t.pnl,
    t.pnlPercent,
    `"${(t.analysis?.strategy || '').replace(/"/g, '""')}"`,
    t.psychology,
    `"${(t.notes || '').replace(/"/g, '""')}"`
  ]);

  const csvContent = [headers.join(','), ...rows.map(r => r.join(','))].join('\n');
  const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
  const url = URL.createObjectURL(blob);
  
  const link = document.createElement('a');
  link.setAttribute('href', url);
  link.setAttribute('download', `Trading_Journal_Export_${new Date().toISOString().slice(0, 10)}.csv`);
  document.body.appendChild(link);
  link.click();
  document.body.removeChild(link);
}

/**
 * Export Database Backup as JSON
 */
export function exportBackupJSON(data: { trades: Trade[]; riskSettings: RiskSettings; version?: string }): void {
  const jsonContent = JSON.stringify(data, null, 2);
  const blob = new Blob([jsonContent], { type: 'application/json' });
  const url = URL.createObjectURL(blob);

  const link = document.createElement('a');
  link.setAttribute('href', url);
  link.setAttribute('download', `TradingJournalPro_Backup_${new Date().toISOString().slice(0, 10)}.json`);
  document.body.appendChild(link);
  link.click();
  document.body.removeChild(link);
}

/**
 * Print/PDF Helper for Trade Details
 */
export function printTradePDF(trade: Trade, currencySymbol: string = '$'): void {
  const printWindow = window.open('', '_blank');
  if (!printWindow) return;

  const html = `
    <!DOCTYPE html>
    <html>
      <head>
        <title>Trade Report - ${trade.pair} (${trade.date})</title>
        <style>
          body { font-family: -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, sans-serif; background: #000; color: #fff; padding: 30px; }
          .header { display: flex; justify-content: space-between; border-bottom: 2px solid #333; padding-bottom: 15px; margin-bottom: 20px; }
          .badge { padding: 4px 10px; border-radius: 4px; font-weight: bold; font-size: 14px; display: inline-block; }
          .win { background: #4CAF50; color: #fff; }
          .loss { background: #FF7A00; color: #fff; }
          .be { background: #808080; color: #fff; }
          .grid { display: grid; grid-template-columns: repeat(4, 1fr); gap: 15px; margin-bottom: 25px; }
          .card { background: #151515; border: 1px solid #2D2D2D; padding: 15px; border-radius: 8px; }
          .label { color: #8B8B8B; font-size: 12px; margin-bottom: 4px; }
          .value { font-size: 18px; font-weight: bold; }
          .section { margin-top: 25px; background: #151515; border: 1px solid #2D2D2D; padding: 20px; border-radius: 8px; }
          .section-title { font-size: 16px; font-weight: bold; margin-bottom: 15px; color: #FF7A00; }
          .img-container { display: grid; grid-template-columns: 1fr 1fr; gap: 20px; margin-top: 20px; }
          .img-box img { width: 100%; border-radius: 8px; border: 1px solid #333; }
        </style>
      </head>
      <body>
        <div class="header">
          <div>
            <h1 style="margin:0; font-size: 24px;">Trade #${trade.id.slice(0, 8)} - ${trade.pair}</h1>
            <p style="margin:5px 0 0 0; color: #8B8B8B;">${trade.date} at ${trade.time} | Direction: ${trade.direction}</p>
          </div>
          <div>
            <span class="badge ${trade.result === 'Win' ? 'win' : trade.result === 'Loss' ? 'loss' : 'be'}">${trade.result.toUpperCase()}</span>
          </div>
        </div>

        <div class="grid">
          <div class="card"><div class="label">Entry Price</div><div class="value">${trade.entryPrice}</div></div>
          <div class="card"><div class="label">Exit Price</div><div class="value">${trade.exitPrice ?? 'N/A'}</div></div>
          <div class="card"><div class="label">Stop Loss</div><div class="value">${trade.stopLoss}</div></div>
          <div class="card"><div class="label">Take Profit</div><div class="value">${trade.takeProfit}</div></div>
          <div class="card"><div class="label">Risk:Reward</div><div class="value">1:${trade.rr}</div></div>
          <div class="card"><div class="label">Risk %</div><div class="value">${trade.riskPercent}%</div></div>
          <div class="card"><div class="label">PNL ($)</div><div class="value" style="color:${trade.pnl >= 0 ? '#4CAF50' : '#FF7A00'}">${currencySymbol}${trade.pnl.toLocaleString()}</div></div>
          <div class="card"><div class="label">Psychology</div><div class="value">${trade.psychology}</div></div>
        </div>

        <div class="section">
          <div class="section-title">Trading Notes</div>
          <div>${trade.notes || 'No notes documented.'}</div>
        </div>

        ${trade.screenshotBefore || trade.screenshotAfter ? `
          <div class="section">
            <div class="section-title">Chart Screenshots</div>
            <div class="img-container">
              ${trade.screenshotBefore ? `<div class="img-box"><h3>Before Trade</h3><img src="${trade.screenshotBefore}" /></div>` : ''}
              ${trade.screenshotAfter ? `<div class="img-box"><h3>After Trade</h3><img src="${trade.screenshotAfter}" /></div>` : ''}
            </div>
          </div>
        ` : ''}

        <script>
          window.onload = function() {
            window.print();
          };
        </script>
      </body>
    </html>
  `;

  printWindow.document.write(html);
  printWindow.document.close();
}
