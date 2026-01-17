/**
 * Smart Campus Export Utilities
 * Handles PDF, Excel, and file download operations
 */

import { toast } from '@/hooks/use-toast';

// Types
interface ExportOptions {
  filename: string;
  title?: string;
  headers?: string[];
  data?: Record<string, unknown>[];
}

// Generate CSV content from data
const generateCSV = (headers: string[], data: Record<string, unknown>[]): string => {
  const headerRow = headers.join(',');
  const rows = data.map(row => 
    headers.map(header => {
      const value = row[header.toLowerCase().replace(/\s+/g, '_')] ?? row[header] ?? '';
      const stringValue = String(value);
      // Escape quotes and wrap in quotes if contains comma
      if (stringValue.includes(',') || stringValue.includes('"') || stringValue.includes('\n')) {
        return `"${stringValue.replace(/"/g, '""')}"`;
      }
      return stringValue;
    }).join(',')
  );
  return [headerRow, ...rows].join('\n');
};

// Download file helper
const downloadFile = (content: string | Blob, filename: string, mimeType: string) => {
  const blob = content instanceof Blob ? content : new Blob([content], { type: mimeType });
  const url = URL.createObjectURL(blob);
  const link = document.createElement('a');
  link.href = url;
  link.download = filename;
  document.body.appendChild(link);
  link.click();
  document.body.removeChild(link);
  URL.revokeObjectURL(url);
};

// Export to Excel (CSV format with .xlsx extension for compatibility)
export const exportToExcel = (options: ExportOptions) => {
  const { filename, headers = [], data = [] } = options;
  
  if (headers.length === 0 || data.length === 0) {
    // Demo mode - create sample data
    const demoHeaders = ['ID', 'Nom', 'Prénom', 'Statut', 'Date'];
    const demoData = [
      { id: '001', nom: 'Dupont', prenom: 'Jean', statut: 'Présent', date: new Date().toLocaleDateString('fr-FR') },
      { id: '002', nom: 'Martin', prenom: 'Marie', statut: 'Absent', date: new Date().toLocaleDateString('fr-FR') },
    ];
    const csv = generateCSV(demoHeaders, demoData);
    downloadFile(csv, `${filename}.csv`, 'text/csv;charset=utf-8');
  } else {
    const csv = generateCSV(headers, data);
    downloadFile(csv, `${filename}.csv`, 'text/csv;charset=utf-8');
  }
  
  toast({
    title: 'Export réussi',
    description: `Le fichier ${filename}.csv a été téléchargé.`,
  });
};

// Export to PDF (creates a printable HTML document)
export const exportToPDF = (options: ExportOptions) => {
  const { filename, title = 'Document', headers = [], data = [] } = options;
  
  // Create printable HTML content
  const htmlContent = `
<!DOCTYPE html>
<html lang="fr">
<head>
  <meta charset="UTF-8">
  <title>${title}</title>
  <style>
    @page { size: A4; margin: 2cm; }
    body { font-family: 'Times New Roman', serif; font-size: 12pt; line-height: 1.5; color: #1a1a1a; }
    .header { text-align: center; margin-bottom: 2rem; border-bottom: 2px solid #1a1a1a; padding-bottom: 1rem; }
    .header h1 { font-size: 18pt; margin: 0 0 0.5rem; }
    .header p { font-size: 10pt; color: #666; margin: 0; }
    .logo { font-weight: bold; font-size: 14pt; margin-bottom: 0.5rem; }
    table { width: 100%; border-collapse: collapse; margin-top: 1rem; }
    th, td { border: 1px solid #333; padding: 8px 12px; text-align: left; }
    th { background-color: #1a2845; color: white; font-weight: 600; text-transform: uppercase; font-size: 10pt; }
    tr:nth-child(even) { background-color: #f8f8f8; }
    .footer { margin-top: 2rem; text-align: center; font-size: 9pt; color: #666; border-top: 1px solid #ccc; padding-top: 1rem; }
    .meta { display: flex; justify-content: space-between; margin-bottom: 1rem; font-size: 10pt; color: #666; }
    @media print { 
      .no-print { display: none; } 
      body { -webkit-print-color-adjust: exact; print-color-adjust: exact; }
    }
  </style>
</head>
<body>
  <div class="header">
    <div class="logo">🎓 ÉCOLE SUPÉRIEURE D'INGÉNIERIE</div>
    <h1>${title}</h1>
    <p>Document généré le ${new Date().toLocaleDateString('fr-FR', { weekday: 'long', year: 'numeric', month: 'long', day: 'numeric' })}</p>
  </div>
  
  ${headers.length > 0 && data.length > 0 ? `
  <table>
    <thead>
      <tr>${headers.map(h => `<th>${h}</th>`).join('')}</tr>
    </thead>
    <tbody>
      ${data.map(row => `
        <tr>
          ${headers.map(h => {
            const key = h.toLowerCase().replace(/\s+/g, '_');
            return `<td>${row[key] ?? row[h] ?? '-'}</td>`;
          }).join('')}
        </tr>
      `).join('')}
    </tbody>
  </table>
  ` : `
  <p style="text-align: center; color: #666; padding: 3rem;">
    Ce document a été généré par le système de gestion académique Smart Campus.<br/>
    Pour un contenu personnalisé, veuillez sélectionner les données à exporter.
  </p>
  `}
  
  <div class="footer">
    <p>École Supérieure d'Ingénierie • Système de Gestion Académique Smart Campus</p>
    <p>Document confidentiel - Usage interne uniquement</p>
  </div>
  
  <script class="no-print">
    window.onload = function() { window.print(); }
  </script>
</body>
</html>`;

  // Open in new window for printing
  const printWindow = window.open('', '_blank');
  if (printWindow) {
    printWindow.document.write(htmlContent);
    printWindow.document.close();
  }
  
  toast({
    title: 'Export PDF',
    description: `La fenêtre d'impression s'est ouverte pour ${filename}.`,
  });
};

// Download course material (simulated)
export const downloadMaterial = (materialName: string, materialType: string) => {
  // Create a sample text file to simulate download
  const content = `
======================================
${materialName}
======================================

Ce document fait partie des ressources pédagogiques
de l'École Supérieure d'Ingénierie.

Type de fichier: ${materialType.toUpperCase()}
Date de téléchargement: ${new Date().toLocaleDateString('fr-FR')}

---
Smart Campus - Système de Gestion Académique
`;

  const extension = materialType === 'pdf' ? 'txt' : materialType;
  downloadFile(content, `${materialName}.${extension}`, 'text/plain');
  
  toast({
    title: 'Téléchargement réussi',
    description: `${materialName} a été téléchargé.`,
  });
};

// Import Excel file (parse CSV)
export const importExcel = (file: File): Promise<Record<string, string>[]> => {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    
    reader.onload = (e) => {
      try {
        const text = e.target?.result as string;
        const lines = text.split('\n').filter(line => line.trim());
        
        if (lines.length < 2) {
          reject(new Error('Le fichier est vide ou invalide'));
          return;
        }
        
        const headers = lines[0].split(',').map(h => h.trim().replace(/"/g, ''));
        const data = lines.slice(1).map(line => {
          const values = line.split(',').map(v => v.trim().replace(/"/g, ''));
          const row: Record<string, string> = {};
          headers.forEach((header, index) => {
            row[header] = values[index] || '';
          });
          return row;
        });
        
        toast({
          title: 'Import réussi',
          description: `${data.length} enregistrement(s) importé(s).`,
        });
        
        resolve(data);
      } catch (error) {
        reject(new Error('Erreur lors de la lecture du fichier'));
      }
    };
    
    reader.onerror = () => reject(new Error('Erreur lors de la lecture du fichier'));
    reader.readAsText(file);
  });
};

// Print timetable
export const printTimetable = () => {
  window.print();
  
  toast({
    title: 'Impression',
    description: 'La fenêtre d\'impression s\'est ouverte.',
  });
};

// Send convocation email (simulated)
export const sendConvocationEmail = (studentEmail: string, subject: string): Promise<boolean> => {
  return new Promise((resolve) => {
    // Simulate API call delay
    setTimeout(() => {
      toast({
        title: 'Convocation envoyée',
        description: `Email envoyé à ${studentEmail}`,
      });
      resolve(true);
    }, 500);
  });
};
