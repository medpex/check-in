
import { Link } from "react-router-dom";

export const Header = () => {
  return (
    <header className="bg-white/10 backdrop-blur-sm border-b border-white/20 sticky top-0 z-50">
      <div className="container mx-auto px-4 py-4">
        <div className="flex items-center justify-between">
          {/* Logo ohne Link */}
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 bg-white/20 rounded-lg flex items-center justify-center">
              <span className="text-white font-bold text-lg">Q</span>
            </div>
            <div className="text-white">
              <h1 className="text-xl font-bold">QR Code Feier</h1>
              <p className="text-sm text-white/70">Check-in System</p>
            </div>
          </div>
        </div>
      </div>
    </header>
  );
};
