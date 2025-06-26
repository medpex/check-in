
import { Link } from "react-router-dom";
import { Settings } from "lucide-react";
import { Button } from "@/components/ui/button";

export const Header = () => {
  return (
    <header className="bg-white/10 backdrop-blur-sm border-b border-white/20 sticky top-0 z-50">
      <div className="container mx-auto px-4 py-4">
        <div className="flex items-center justify-between">
          {/* Logo Platzhalter */}
          <Link to="/" className="flex items-center gap-3">
            <div className="w-10 h-10 bg-white/20 rounded-lg flex items-center justify-center">
              <span className="text-white font-bold text-lg">Q</span>
            </div>
            <div className="text-white">
              <h1 className="text-xl font-bold">QR Code Feier</h1>
              <p className="text-sm text-white/70">Check-in System</p>
            </div>
          </Link>

          {/* Admin Button */}
          <Link to="/admin">
            <Button variant="outline" size="sm" className="bg-white/20 border-white/30 text-white hover:bg-white/30">
              <Settings className="h-4 w-4 mr-2" />
              Admin
            </Button>
          </Link>
        </div>
      </div>
    </header>
  );
};
