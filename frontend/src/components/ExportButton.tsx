import { useState, useCallback } from 'react';
import type { ReactNode } from 'react';
import { Download, FileSpreadsheet, FileJson, FileText, Check, AlertCircle } from 'lucide-react';
import clsx from 'clsx';
import { Button } from './Button';

export type ExportFormat = 'csv' | 'json' | 'txt';

export interface ExportButtonProps {
  data: unknown[];
  filename?: string;
  formats?: ExportFormat[];
  onExport?: (format: ExportFormat, data: string) => void;
  getExportData?: () => Promise<unknown[]> | unknown[];
  disabled?: boolean;
  loading?: boolean;
  className?: string;
  buttonText?: string;
  children?: ReactNode;
  variant?: 'primary' | 'secondary' | 'outline' | 'ghost';
  size?: 'xs' | 'sm' | 'md' | 'lg';
}

interface ExportState {
  isExporting: boolean;
  success: boolean;
  error: string | null;
}

export function ExportButton({
  data,
  filename = 'export',
  formats = ['csv', 'json'],
  onExport,
  getExportData,
  disabled = false,
  loading = false,
  className,
  buttonText = 'Export',
  children,
  variant = 'outline',
  size = 'sm',
}: ExportButtonProps) {
  const [showDropdown, setShowDropdown] = useState(false);
  const [exportState, setExportState] = useState<ExportState>({
    isExporting: false,
    success: false,
    error: null,
  });

  const formatFileSize = (bytes: number): string => {
    if (bytes === 0) return '0 Bytes';
    const k = 1024;
    const sizes = ['Bytes', 'KB', 'MB'];
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i];
  };

  const convertToCSV = (data: unknown[]): string => {
    if (data.length === 0) return '';
    
    const headers = Object.keys(data[0] as object);
    const rows = data.map(row => {
      return headers.map(header => {
        const value = (row as Record<string, unknown>)[header];
        // Escape values that contain commas or quotes
        const stringValue = value === null || value === undefined ? '' : String(value);
        if (stringValue.includes(',') || stringValue.includes('"') || stringValue.includes('\n')) {
          return `"${stringValue.replace(/"/g, '""')}"`;
        }
        return stringValue;
      }).join(',');
    });
    
    return [headers.join(','), ...rows].join('\n');
  };

  const convertToJSON = (data: unknown[]): string => {
    return JSON.stringify(data, null, 2);
  };

  const convertToTXT = (data: unknown[]): string => {
    return data.map((item, index) => {
      return `Record ${index + 1}:\n${Object.entries(item as object)
        .map(([key, value]) => `  ${key}: ${value}`)
        .join('\n')}\n`;
    }).join('\n---\n\n');
  };

  const downloadFile = useCallback((content: string, format: ExportFormat) => {
    const mimeTypes: Record<ExportFormat, string> = {
      csv: 'text/csv;charset=utf-8;',
      json: 'application/json;charset=utf-8;',
      txt: 'text/plain;charset=utf-8;',
    };

    const blob = new Blob([content], { type: mimeTypes[format] });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.download = `${filename}.${format}`;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    URL.revokeObjectURL(url);
  }, [filename]);

  const handleExport = useCallback(async (format: ExportFormat) => {
    setExportState({ isExporting: true, success: false, error: null });
    setShowDropdown(false);

    try {
      let exportData = data;
      
      // Use getExportData if provided
      if (getExportData) {
        const result = getExportData();
        exportData = result instanceof Promise ? await result : result;
      }

      let content: string;
      
      switch (format) {
        case 'csv':
          content = convertToCSV(exportData);
          break;
        case 'json':
          content = convertToJSON(exportData);
          break;
        case 'txt':
          content = convertToTXT(exportData);
          break;
        default:
          throw new Error(`Unsupported format: ${format}`);
      }

      // Call onExport callback if provided
      onExport?.(format, content);

      // Download the file
      downloadFile(content, format);

      setExportState({ isExporting: false, success: true, error: null });
      
      // Reset success state after 3 seconds
      setTimeout(() => {
        setExportState(prev => ({ ...prev, success: false }));
      }, 3000);
    } catch (error) {
      setExportState({
        isExporting: false,
        success: false,
        error: error instanceof Error ? error.message : 'Export failed',
      });
    }
  }, [data, getExportData, onExport, downloadFile]);

  const getFormatIcon = (format: ExportFormat) => {
    switch (format) {
      case 'csv':
        return <FileSpreadsheet size={16} />;
      case 'json':
        return <FileJson size={16} />;
      case 'txt':
        return <FileText size={16} />;
      default:
        return <Download size={16} />;
    }
  };

  const getFormatLabel = (format: ExportFormat) => {
    const labels: Record<ExportFormat, string> = {
      csv: 'CSV (Spreadsheet)',
      json: 'JSON',
      txt: 'Plain Text',
    };
    return labels[format];
  };

  const estimatedSize = useCallback(() => {
    const jsonString = JSON.stringify(data);
    return formatFileSize(new Blob([jsonString]).size);
  }, [data]);

  return (
    <div className={clsx('exportbutton', className)}>
      <div className="exportbutton__wrapper">
        <Button
          variant={variant}
          size={size}
          disabled={disabled || loading || exportState.isExporting}
          onClick={() => setShowDropdown(!showDropdown)}
          rightIcon={
            exportState.success ? (
              <Check size={16} className="exportbutton__icon--success" />
            ) : exportState.error ? (
              <AlertCircle size={16} className="exportbutton__icon--error" />
            ) : (
              <Download size={16} />
            )
          }
        >
          {exportState.isExporting
            ? 'Exporting...'
            : exportState.success
            ? 'Exported!'
            : exportState.error
            ? 'Failed'
            : buttonText}
        </Button>

        {showDropdown && (
          <div className="exportbutton__dropdown">
            <div className="exportbutton__dropdown-header">
              <span className="exportbutton__dropdown-title">Export as</span>
              <span className="exportbutton__dropdown-size">~{estimatedSize()}</span>
            </div>
            
            <div className="exportbutton__options">
              {formats.map((format) => (
                <button
                  key={format}
                  type="button"
                  onClick={() => handleExport(format)}
                  disabled={exportState.isExporting}
                  className="exportbutton__option"
                >
                  <span className="exportbutton__option-icon">
                    {getFormatIcon(format)}
                  </span>
                  <span className="exportbutton__option-label">
                    {getFormatLabel(format)}
                  </span>
                  <span className="exportbutton__option-ext">.{format}</span>
                </button>
              ))}
            </div>
            
            {children}
          </div>
        )}
      </div>

      {exportState.error && (
        <div className="exportbutton__error">
          <AlertCircle size={14} />
          <span>{exportState.error}</span>
        </div>
      )}
    </div>
  );
}

export default ExportButton;
