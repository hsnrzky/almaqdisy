import { Construction } from "lucide-react";

interface MaintenancePageProps {
  message?: string;
}

const MaintenancePage = ({ message = "Website sedang dalam perbaikan. Silakan kembali beberapa saat lagi." }: MaintenancePageProps) => {
  return (
    <div className="min-h-screen bg-background flex items-center justify-center p-4">
      <div className="text-center max-w-md">
        <div className="mb-8 flex justify-center">
          <div className="w-24 h-24 rounded-full bg-primary/10 flex items-center justify-center animate-pulse">
            <Construction className="w-12 h-12 text-primary" />
          </div>
        </div>
        <h1 className="text-3xl font-bold text-foreground mb-4">
          Sedang Maintenance
        </h1>
        <p className="text-muted-foreground text-lg mb-8">
          {message}
        </p>
        <div className="flex justify-center gap-2">
          <div className="w-2 h-2 rounded-full bg-primary animate-bounce" style={{ animationDelay: '0ms' }} />
          <div className="w-2 h-2 rounded-full bg-primary animate-bounce" style={{ animationDelay: '150ms' }} />
          <div className="w-2 h-2 rounded-full bg-primary animate-bounce" style={{ animationDelay: '300ms' }} />
        </div>
      </div>
    </div>
  );
};

export default MaintenancePage;
