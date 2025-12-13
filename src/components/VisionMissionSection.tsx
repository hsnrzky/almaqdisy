import { Eye, Target, CheckCircle } from "lucide-react";

const missions = [
  "Membangun solidaritas dan kekeluargaan yang erat antar anggota angkatan",
  "Mengembangkan potensi diri melalui berbagai program pengembangan",
  "Berkontribusi positif bagi masyarakat dan lingkungan sekitar",
  "Menjaga dan melestarikan nilai-nilai luhur yang diwariskan",
  "Menciptakan jejaring yang kuat untuk masa depan bersama",
];

const VisionMissionSection = () => {
  return (
    <section id="visi-misi" className="py-24 bg-background">
      <div className="section-container">
        {/* Section Header */}
        <div className="text-center mb-16">
          <span className="inline-block px-4 py-1.5 rounded-full bg-accent/10 text-accent font-medium text-sm mb-4">
            Arah Tujuan
          </span>
          <h2 className="section-title mb-6">
            Visi & <span className="text-accent">Misi</span>
          </h2>
          <p className="section-subtitle">
            Kompas yang menuntun langkah kami menuju masa depan yang gemilang
          </p>
        </div>

        {/* Cards */}
        <div className="grid lg:grid-cols-2 gap-8 max-w-5xl mx-auto">
          {/* Vision Card */}
          <div className="relative group">
            <div className="absolute -inset-1 bg-gradient-to-r from-accent to-gold-light rounded-3xl blur-xl opacity-30 group-hover:opacity-50 transition-opacity" />
            <div className="relative bg-primary rounded-2xl p-8 md:p-10 h-full">
              <div className="w-14 h-14 rounded-2xl bg-accent/20 flex items-center justify-center mb-6">
                <Eye className="w-7 h-7 text-accent" />
              </div>
              <h3 className="font-display text-2xl md:text-3xl font-bold text-primary-foreground mb-6">
                Visi
              </h3>
              <p className="text-primary-foreground/90 text-lg md:text-xl leading-relaxed font-medium">
                "Menjadi angkatan yang berintegritas, inovatif, dan berdampak positif bagi generasi mendatang serta masyarakat luas."
              </p>
              <div className="mt-8 flex items-center gap-3">
                <div className="w-12 h-1 bg-accent rounded-full" />
                <span className="text-accent text-sm font-medium">Al - Maqdisy 2023</span>
              </div>
            </div>
          </div>

          {/* Mission Card */}
          <div className="relative group">
            <div className="absolute -inset-1 bg-gradient-to-r from-primary to-navy-light rounded-3xl blur-xl opacity-20 group-hover:opacity-40 transition-opacity" />
            <div className="relative bg-card border border-border rounded-2xl p-8 md:p-10 h-full">
              <div className="w-14 h-14 rounded-2xl bg-primary/10 flex items-center justify-center mb-6">
                <Target className="w-7 h-7 text-primary" />
              </div>
              <h3 className="font-display text-2xl md:text-3xl font-bold text-foreground mb-6">
                Misi
              </h3>
              <ul className="space-y-4">
                {missions.map((mission, index) => (
                  <li key={index} className="flex items-start gap-3">
                    <CheckCircle className="w-5 h-5 text-accent flex-shrink-0 mt-0.5" />
                    <span className="text-muted-foreground">{mission}</span>
                  </li>
                ))}
              </ul>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
};

export default VisionMissionSection;
