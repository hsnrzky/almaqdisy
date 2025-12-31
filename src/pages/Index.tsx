import Header from "@/components/Header";
import HeroSection from "@/components/HeroSection";
import AboutSection from "@/components/AboutSection";
import TeamSection from "@/components/TeamSection";
import VisionMissionSection from "@/components/VisionMissionSection";
import GallerySection from "@/components/GallerySection";
import Footer from "@/components/Footer";
import MaintenancePage from "@/components/MaintenancePage";
import { useMaintenanceMode } from "@/hooks/useMaintenanceMode";

const Index = () => {
  const { isMaintenanceMode, maintenanceMessage, loading } = useMaintenanceMode();

  if (loading) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center">
        <div className="w-8 h-8 border-4 border-primary border-t-transparent rounded-full animate-spin" />
      </div>
    );
  }

  if (isMaintenanceMode) {
    return <MaintenancePage message={maintenanceMessage} />;
  }

  return (
    <main className="min-h-screen bg-background">
      <Header />
      <HeroSection />
      <AboutSection />
      <TeamSection />
      <VisionMissionSection />
      <GallerySection />
      <Footer />
    </main>
  );
};

export default Index;
