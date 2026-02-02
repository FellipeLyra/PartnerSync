import React, { useState, useRef } from 'react';
import { Upload, X, FileText, Check, AlertCircle } from 'lucide-react';
import { Client } from '../../types';
import { crmService } from '../../services/crmService';

interface CsvImporterProps {
    companyId: string;
    onClose: () => void;
    onSuccess: () => void;
}

const CsvImporter: React.FC<CsvImporterProps> = ({ companyId, onClose, onSuccess }) => {
    const [file, setFile] = useState<File | null>(null);
    const [preview, setPreview] = useState<any[]>([]);
    const [importing, setImporting] = useState(false);
    const [error, setError] = useState<string | null>(null);
    const [stats, setStats] = useState({ total: 0, success: 0, failed: 0 });
    const fileInputRef = useRef<HTMLInputElement>(null);

    const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        if (e.target.files && e.target.files[0]) {
            parseFile(e.target.files[0]);
        }
    };

    const parseFile = (file: File) => {
        setFile(file);
        setError(null);
        setPreview([]);

        const reader = new FileReader();
        reader.onload = (e) => {
            try {
                const text = e.target?.result as string;
                const lines = text.split(/\r\n|\n/).filter(line => line.trim());

                if (lines.length < 2) {
                    setError("Arquivo vazio ou sem cabeçalho.");
                    return;
                }

                const headers = lines[0].split(',').map(h => h.trim().toLowerCase().replace(/"/g, ''));
                const data = lines.slice(1).map(line => {
                    // Primitive CSV split, keeping it simple without libs
                    // For better CSV handling we'd need a regex or library
                    const values = line.split(',').map(v => v.trim().replace(/"/g, ''));
                    const row: any = {};
                    headers.forEach((h, i) => {
                        row[h] = values[i] || '';
                    });
                    return row;
                });

                setPreview(data.slice(0, 5)); // Show first 5
                setStats({ ...stats, total: data.length });
            } catch (err) {
                setError("Erro ao ler arquivo. Verifique se é um CSV válido.");
            }
        };
        reader.readAsText(file);
    };

    const mapToClient = (row: any): Client => {
        // Try to guess columns
        const name = row['nome'] || row['name'] || row['cliente'] || row['empresa'] || 'Sem Nome';
        const phone = row['telefone'] || row['phone'] || row['celular'] || row['contato'] || '';
        const email = row['email'] || row['e-mail'] || '';
        const organization = row['empresa'] || row['company'] || row['organizacao'] || '';
        const website = row['site'] || row['website'] || row['url'] || '';
        const tags = row['tags'] ? row['tags'].split(';') : ['Importado'];

        return {
            id: '',
            companyId,
            name: name,
            organizationName: organization,
            email: email,
            phone: phone,
            website: website,
            tags: tags,
            notes: `Importado via CSV em ${new Date().toLocaleDateString()}`,
            createdAt: Date.now(),
            leadSource: 'CSV Import'
        } as Client;
    };

    const handleImport = async () => {
        setImporting(true);
        let successCount = 0;
        let failCount = 0;

        // Re-read file to process all (since preview only has 5)
        // Actually we should store parsed data in state, but let's re-parse or store all
        // For efficiency in this demo, I will re-parse properly or assume 'stats.total' logic needs data
        // Let's implement full parse again or store it. Storing in state for small files is fine.
        // I'll assume small files < 1000 rows.

        const reader = new FileReader();
        reader.onload = async (e) => {
            const text = e.target?.result as string;
            const lines = text.split(/\r\n|\n/).filter(line => line.trim());
            const headers = lines[0].split(',').map(h => h.trim().toLowerCase().replace(/"/g, ''));

            const clientsToImport = lines.slice(1).map(line => {
                const values = line.split(',').map(v => v.trim().replace(/"/g, ''));
                const row: any = {};
                headers.forEach((h, i) => row[h] = values[i]);
                return mapToClient(row);
            });

            for (const client of clientsToImport) {
                if (!client.name) { failCount++; continue; }
                try {
                    await crmService.saveClient(client);
                    successCount++;
                } catch (err) {
                    failCount++;
                }
                // Update progress if needed
            }

            setStats({ total: clientsToImport.length, success: successCount, failed: failCount });
            setImporting(false);
            // Verify success
            if (successCount > 0) {
                setTimeout(() => {
                    onSuccess();
                    onClose();
                }, 1500);
            }
        };
        if (file) reader.readAsText(file);
    };

    return (
        <div className="fixed inset-0 bg-black/70 flex items-center justify-center z-50 p-4 backdrop-blur-sm">
            <div className="bg-white dark:bg-slate-800 rounded-2xl p-6 w-full max-w-lg border border-slate-200 dark:border-slate-700 shadow-2xl animate-fadeIn">
                <div className="flex justify-between items-center mb-6">
                    <h3 className="text-xl font-bold text-slate-900 dark:text-white">Importar Clientes (CSV)</h3>
                    <button onClick={onClose} disabled={importing} className="p-1 hover:bg-slate-100 dark:hover:bg-slate-700 rounded-full transition-colors">
                        <X size={20} className="text-slate-500" />
                    </button>
                </div>

                {!file ? (
                    <div
                        className="border-2 border-dashed border-slate-300 dark:border-slate-600 rounded-xl p-12 text-center hover:bg-slate-50 dark:hover:bg-slate-800/50 transition-colors cursor-pointer"
                        onClick={() => fileInputRef.current?.click()}
                    >
                        <Upload size={48} className="mx-auto text-indigo-500 mb-4" />
                        <h4 className="font-medium text-slate-700 dark:text-slate-300 mb-1">Clique para selecionar o arquivo CSV</h4>
                        <p className="text-sm text-slate-400">Nome, Email, Telefone, Empresa, Site</p>
                        <input
                            type="file"
                            accept=".csv"
                            className="hidden"
                            ref={fileInputRef}
                            onChange={handleFileChange}
                        />
                    </div>
                ) : (
                    <div className="space-y-4">
                        <div className="flex items-center p-3 bg-slate-50 dark:bg-slate-700/50 rounded-lg border border-slate-200 dark:border-slate-600">
                            <FileText size={24} className="text-indigo-500 mr-3" />
                            <div className="flex-1 overflow-hidden">
                                <p className="font-medium text-slate-700 dark:text-slate-200 truncate">{file.name}</p>
                                <p className="text-xs text-slate-500">{(file.size / 1024).toFixed(1)} KB</p>
                            </div>
                            {!importing && !stats.success && (
                                <button onClick={() => setFile(null)} className="text-slate-400 hover:text-red-500">
                                    <X size={18} />
                                </button>
                            )}
                        </div>

                        {error && (
                            <div className="p-3 bg-red-50 dark:bg-red-900/20 text-red-600 dark:text-red-300 rounded-lg text-sm flex items-center">
                                <AlertCircle size={16} className="mr-2" />
                                {error}
                            </div>
                        )}

                        {preview.length > 0 && !stats.success && (
                            <div className="bg-slate-50 dark:bg-slate-900 border border-slate-200 dark:border-slate-700 rounded-lg p-3">
                                <h5 className="text-xs font-bold text-slate-500 uppercase mb-2">Pré-visualização (Primeiros 5)</h5>
                                <div className="space-y-2">
                                    {preview.map((row, i) => (
                                        <div key={i} className="text-xs text-slate-600 dark:text-slate-400 flex gap-2">
                                            <span className="font-medium">{row.nome || row.name || 'S/N'}</span>
                                            <span className="opacity-50">•</span>
                                            <span>{row.email || row.phone || 'S/Contato'}</span>
                                        </div>
                                    ))}
                                </div>
                            </div>
                        )}

                        {stats.success > 0 && (
                            <div className="p-6 text-center">
                                <div className="w-16 h-16 bg-green-100 dark:bg-green-900/30 text-green-600 dark:text-green-400 rounded-full flex items-center justify-center mx-auto mb-4">
                                    <Check size={32} />
                                </div>
                                <h4 className="text-lg font-bold text-green-600 dark:text-green-400 mb-1">Importação Concluída!</h4>
                                <p className="text-slate-600 dark:text-slate-300">
                                    {stats.success} clientes importados com sucesso.
                                    {stats.failed > 0 && <span className="block text-sm text-red-500 mt-1">{stats.failed} falhas.</span>}
                                </p>
                            </div>
                        )}

                        <div className="flex justify-end pt-4">
                            {!importing && !stats.success && (
                                <button
                                    onClick={handleImport}
                                    disabled={!!error}
                                    className="bg-indigo-600 hover:bg-indigo-700 text-white px-6 py-2.5 rounded-lg font-bold shadow-lg disabled:opacity-50 disabled:cursor-not-allowed flex items-center"
                                >
                                    Confirmar Importação
                                </button>
                            )}
                            {importing && (
                                <div className="flex items-center text-indigo-600 font-medium">
                                    <div className="w-5 h-5 border-2 border-indigo-600 border-t-transparent rounded-full animate-spin mr-2"></div>
                                    Importando...
                                </div>
                            )}
                        </div>
                    </div>
                )}
            </div>
        </div>
    );
};

export default CsvImporter;
