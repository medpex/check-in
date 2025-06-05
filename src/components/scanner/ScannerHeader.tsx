
import { ArrowLeft, Camera } from "lucide-react";
import { Link } from "react-router-dom";
import { Button } from "@/components/ui/button";

export const ScannerHeader = () => {
  return (
    <div className="flex items-center gap-4 mb-8">
      <Link to="/">
        <Button variant="outline" size="icon" className="bg-white/20 border-white/30 text-white hover:bg-white/30">
          <ArrowLeft className="h-4 w-4" />
        </Button>
      </Link>
      <h1 className="text-3xl font-bold text-white flex items-center gap-2">
        <Camera className="h-8 w-8" />
        QR-Code Scanner
      </h1>
    </div>
  );
};
