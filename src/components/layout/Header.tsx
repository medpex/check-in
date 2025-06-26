
export const Header = () => {
  return (
    <header className="bg-white/10 backdrop-blur-sm border-b border-white/20 sticky top-0 z-50">
      <div className="container mx-auto px-4 py-4">
        <div className="flex items-center justify-between">
          {/* Logo */}
          <div className="flex items-center gap-3">
            <div className="w-12 h-12 flex items-center justify-center">
              <img 
                src="/lovable-uploads/bc0f22e3-ce80-4020-b167-3fd5843f9339.png" 
                alt="Check-In Logo" 
                className="w-full h-full object-contain"
              />
            </div>
            <div className="text-white">
              <h1 className="text-xl font-bold">Check-In</h1>
              <p className="text-sm text-white/70">Party Check-In System</p>
            </div>
          </div>
        </div>
      </div>
    </header>
  );
};
