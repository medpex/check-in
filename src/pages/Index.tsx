
import { ScanLine } from "lucide-react";
import { Link } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";

const Index = () => {
  return (
    <div className="container mx-auto px-4 py-8">
      <div className="text-center mb-12">
        <h1 className="text-4xl font-bold text-white mb-4">
          QR Code Feier Check-in
        </h1>
        <p className="text-xl text-white/80">
          Scanner für die Veranstaltung
        </p>
      </div>

      <div className="grid md:grid-cols-2 gap-6 max-w-4xl mx-auto">
        {/* Scanner Eingang */}
        <Card className="backdrop-blur-sm bg-white/20 border-white/30 hover:bg-white/25 transition-all">
          <CardHeader>
            <CardTitle className="text-white flex items-center gap-2">
              <ScanLine className="h-6 w-6" />
              Scanner Eingang
            </CardTitle>
            <CardDescription className="text-white/70">
              Gäste beim Eingang einchecken
            </CardDescription>
          </CardHeader>
          <CardContent>
            <Link to="/scanner-in">
              <Button className="w-full bg-green-600/60 hover:bg-green-600/70 text-white">
                Check-In
              </Button>
            </Link>
          </CardContent>
        </Card>

        {/* Scanner Ausgang */}
        <Card className="backdrop-blur-sm bg-white/20 border-white/30 hover:bg-white/25 transition-all">
          <CardHeader>
            <CardTitle className="text-white flex items-center gap-2">
              <ScanLine className="h-6 w-6" />
              Scanner Ausgang
            </CardTitle>
            <CardDescription className="text-white/70">
              Gäste beim Ausgang auschecken
            </CardDescription>
          </CardHeader>
          <CardContent>
            <Link to="/scanner-out">
              <Button className="w-full bg-red-600/60 hover:bg-red-600/70 text-white">
                Check-Out
              </Button>
            </Link>
          </CardContent>
        </Card>
      </div>
    </div>
  );
};

export default Index;
