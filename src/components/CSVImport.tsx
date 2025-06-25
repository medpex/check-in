
import { useState, useRef } from "react";
import { Upload, FileText, AlertCircle } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { toast } from "sonner";

interface CSVImportProps {
  onImport: (guests: { name: string; email: string }[]) => void;
  isImporting: boolean;
}

const CSVImport = ({ onImport, isImporting }: CSVImportProps) => {
  const [isDragOver, setIsDragOver] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const parseCSV = (csvText: string): { name: string; email: string }[] => {
    const lines = csvText.trim().split('\n');
    const guests: { name: string; email: string }[] = [];
    
    // Skip header row if it exists
    const dataLines = lines[0].toLowerCase().includes('name') || lines[0].toLowerCase().includes('email') 
      ? lines.slice(1) 
      : lines;

    for (const line of dataLines) {
      const [name, email] = line.split(',').map(field => field.trim().replace(/^"|"$/g, ''));
      
      if (name && email) {
        // Basic email validation
        const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
        if (emailRegex.test(email)) {
          guests.push({ name, email });
        } else {
          console.warn(`Invalid email format: ${email}`);
        }
      }
    }
    
    return guests;
  };

  const handleFileUpload = (file: File) => {
    if (!file.name.toLowerCase().endsWith('.csv')) {
      toast.error('Bitte wähle eine CSV-Datei aus');
      return;
    }

    const reader = new FileReader();
    reader.onload = (e) => {
      try {
        const csvText = e.target?.result as string;
        const guests = parseCSV(csvText);
        
        if (guests.length === 0) {
          toast.error('Keine gültigen Gästedaten in der CSV-Datei gefunden');
          return;
        }
        
        onImport(guests);
        toast.success(`${guests.length} Gäste aus CSV importiert`);
      } catch (error) {
        console.error('Error parsing CSV:', error);
        toast.error('Fehler beim Lesen der CSV-Datei');
      }
    };
    
    reader.readAsText(file);
  };

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault();
    setIsDragOver(false);
    
    const files = Array.from(e.dataTransfer.files);
    if (files.length > 0) {
      handleFileUpload(files[0]);
    }
  };

  const handleFileSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      handleFileUpload(file);
    }
  };

  return (
    <Card className="backdrop-blur-sm bg-white/20 border-white/30 mb-8">
      <CardHeader>
        <CardTitle className="text-white flex items-center gap-2">
          <Upload className="h-5 w-5" />
          CSV Import
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-4">
        <div
          className={`border-2 border-dashed rounded-lg p-6 text-center transition-colors ${
            isDragOver 
              ? 'border-white/50 bg-white/10' 
              : 'border-white/30 hover:border-white/40'
          }`}
          onDrop={handleDrop}
          onDragOver={(e) => {
            e.preventDefault();
            setIsDragOver(true);
          }}
          onDragLeave={() => setIsDragOver(false)}
        >
          <FileText className="h-12 w-12 text-white/50 mx-auto mb-4" />
          <p className="text-white/70 mb-2">
            CSV-Datei hier ablegen oder klicken zum Auswählen
          </p>
          <Button
            onClick={() => fileInputRef.current?.click()}
            variant="outline"
            className="bg-white/20 border-white/30 text-white hover:bg-white/30"
            disabled={isImporting}
          >
            <Upload className="h-4 w-4 mr-2" />
            {isImporting ? 'Importiere...' : 'Datei auswählen'}
          </Button>
          <input
            ref={fileInputRef}
            type="file"
            accept=".csv"
            onChange={handleFileSelect}
            className="hidden"
          />
        </div>
        
        <div className="bg-white/10 rounded-lg p-4">
          <div className="flex items-start gap-2 mb-2">
            <AlertCircle className="h-5 w-5 text-yellow-400 mt-0.5 flex-shrink-0" />
            <div>
              <h4 className="text-white font-medium mb-1">CSV-Format:</h4>
              <p className="text-white/70 text-sm mb-2">
                Die CSV-Datei sollte folgendes Format haben:
              </p>
              <div className="bg-black/20 rounded p-2 font-mono text-sm text-white/80">
                Name,Email<br />
                Max Mustermann,max@example.com<br />
                Anna Schmidt,anna@example.com
              </div>
              <p className="text-white/60 text-xs mt-2">
                • Erste Zeile kann Überschriften enthalten (optional)<br />
                • Komma als Trennzeichen<br />
                • Anführungszeichen um Felder sind optional
              </p>
            </div>
          </div>
        </div>
      </CardContent>
    </Card>
  );
};

export default CSVImport;
