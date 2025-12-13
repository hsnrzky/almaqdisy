import { ChevronDown } from "lucide-react";

const HeroSection = () => {
  return (
    <section className="relative min-h-screen flex items-center justify-center overflow-hidden bg-primary">
      {/* Background Pattern */}
      <div className="absolute inset-0 opacity-10">
        <div className="absolute inset-0" style={{
          backgroundImage: `url("data:image/svg+xml,%3Csvg width='60' height='60' viewBox='0 0 60 60' xmlns='http://www.w3.org/2000/svg'%3E%3Cg fill='none' fill-rule='evenodd'%3E%3Cg fill='%23ffffff' fill-opacity='0.4'%3E%3Cpath d='M36 34v-4h-2v4h-4v2h4v4h2v-4h4v-2h-4zm0-30V0h-2v4h-4v2h4v4h2V6h4V4h-4zM6 34v-4H4v4H0v2h4v4h2v-4h4v-2H6zM6 4V0H4v4H0v2h4v4h2V6h4V4H6z'/%3E%3C/g%3E%3C/g%3E%3C/svg%3E")`,
        }} />
      </div>

      {/* Gold Accent Lines */}
      <div className="absolute top-0 left-0 w-full h-1 bg-gradient-gold" />
      <div className="absolute bottom-0 left-0 w-full h-1 bg-gradient-gold" />

      {/* Decorative Elements */}
      <div className="absolute top-20 left-10 w-32 h-32 rounded-full bg-accent/10 blur-3xl animate-float" />
      <div className="absolute bottom-20 right-10 w-48 h-48 rounded-full bg-accent/10 blur-3xl animate-float" style={{ animationDelay: "1s" }} />

      {/* Content */}
      <div className="section-container relative z-10 text-center">
        <div className="max-w-4xl mx-auto">
          {/* Badge */}
          <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-primary-foreground/10 backdrop-blur-sm border border-primary-foreground/20 mb-8 animate-fade-in-up">
            <div className="w-2 h-2 rounded-full bg-accent animate-pulse-gold" />
            <span className="text-primary-foreground/90 text-sm font-medium">
              Generasi Penerus Estafet
            </span>
          </div>

          {/* Main Title */}
          <h1 className="font-display text-5xl md:text-6xl lg:text-7xl font-bold text-primary-foreground mb-6 animate-fade-in-up" style={{ animationDelay: "0.2s" }}>
            <span className="block">MQDS</span>
            <span className="block text-accent mt-2">Angkatan 23</span>
          </h1>

          {/* Subtitle */}
          <p className="text-lg md:text-xl text-primary-foreground/80 mb-4 animate-fade-in-up font-display italic" style={{ animationDelay: "0.4s" }}>
            Al - Maqdisy
          </p>

          {/* Slogan */}
          <p className="text-xl md:text-2xl text-primary-foreground/70 mb-12 max-w-2xl mx-auto animate-fade-in-up" style={{ animationDelay: "0.6s" }}>
            "Menghubungkan masa lalu, membentuk masa depan."
          </p>

          {/* CTA Button */}
          <a
            href="#tentang"
            className="inline-flex items-center gap-2 px-8 py-4 bg-accent hover:bg-gold-dark text-accent-foreground font-semibold rounded-full transition-all duration-300 hover:shadow-gold hover:scale-105 animate-fade-in-up"
            style={{ animationDelay: "0.8s" }}
          >
            Kenali Kami Lebih Jauh
            <ChevronDown size={20} />
          </a>
        </div>

      </div>
    </section>
  );
};

export default HeroSection;
