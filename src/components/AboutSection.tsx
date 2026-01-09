import { Heart, Lightbulb, Users, Target } from "lucide-react";

const coreValues = [
  {
    icon: Users,
    title: "Kolaborasi",
    description: "Bersatu dalam kebersamaan, saling mendukung untuk mencapai tujuan bersama.",
  },
  {
    icon: Heart,
    title: "Integritas",
    description: "Menjunjung tinggi kejujuran dan nilai-nilai moral dalam setiap tindakan.",
  },
  {
    icon: Lightbulb,
    title: "Inovasi",
    description: "Terus berkreasi dan menciptakan ide-ide baru untuk kemajuan bersama.",
  },
  {
    icon: Target,
    title: "Komitmen",
    description: "Dedikasi penuh terhadap tugas dan tanggung jawab yang diamanahkan.",
  },
];

const AboutSection = () => {
  return (
    <section id="tentang" className="py-24 bg-background">
      <div className="section-container">
        {/* Section Header */}
        <div className="text-center mb-16">
          <span className="inline-block px-4 py-1.5 rounded-full bg-accent/10 text-accent font-medium text-sm mb-4">
            Tentang Kami
          </span>
          <h2 className="section-title mb-6">
            Mengenal <span className="text-accent">Al - Maqdisy</span>
          </h2>
          <p className="section-subtitle">
            Filosofi dan semangat yang menjadi fondasi perjalanan kami
          </p>
        </div>

        {/* Main Content */}
        <div className="grid lg:grid-cols-2 gap-12 items-center mb-20">
          {/* Left - Story */}
          <div className="space-y-6">
            <div className="inline-flex items-center gap-2 text-accent font-medium">
              <div className="w-8 h-0.5 bg-accent rounded-full" />
              Filosofi Nama
            </div>
            <h3 className="font-display text-2xl md:text-3xl font-bold text-foreground">
              Al - Maqdisy: Perjalanan Menuju Tujuan Suci
            </h3>
            <p className="text-muted-foreground leading-relaxed">
              Nama <span className="text-accent font-semibold">Al - Maqdisy</span> diambil dari kata Arab yang berarti "yang dituju" atau "yang suci". Angkatan 23 memilih nama ini sebagai pengingat bahwa setiap langkah yang kami ambil adalah perjalanan menuju tujuan yang bermakna.
            </p>
            <p className="text-muted-foreground leading-relaxed">
              Seperti para pendahulu yang menginspirasi, kami bertekad untuk meninggalkan jejak positif dan menjadi generasi yang membawa perubahan nyata bagi lingkungan sekitar.
            </p>
            <div className="flex items-center gap-4 pt-4">
              <div className="flex -space-x-3">
                {[1, 2, 3, 4].map((i) => (
                  <div
                    key={i}
                    className="w-10 h-10 rounded-full bg-muted border-2 border-background flex items-center justify-center"
                  >
                    <span className="text-xs font-medium text-muted-foreground">
                      {i}
                    </span>
                  </div>
                ))}
              </div>
              <span className="text-muted-foreground text-sm">
                +20 anggota aktif
              </span>
            </div>
          </div>

          {/* Right - Decorative Card */}
          <div className="relative">
            <div className="absolute -inset-4 bg-gradient-to-br from-accent/20 to-primary/20 rounded-3xl blur-2xl" />
            <div className="relative glass-card p-8 md:p-12">
              <div className="text-center">
                <div className="w-20 h-20 rounded-2xl bg-primary mx-auto mb-6 flex items-center justify-center">
                  <span className="font-display text-3xl font-bold text-primary-foreground">23</span>
                </div>
                <h4 className="font-display text-xl font-bold text-foreground mb-2">
                  Angkatan XXIII
                </h4>
                <p className="text-muted-foreground text-sm mb-6">
                  Generasi penerus estafet perjuangan
                </p>
                <div className="flex justify-center gap-4">
                  <div className="text-center">
                    <div className="text-2xl font-bold text-accent">100+</div>
                    <div className="text-xs text-muted-foreground">Anggota</div>
                  </div>
                  <div className="w-px bg-border" />
                  <div className="text-center">
                    <div className="text-2xl font-bold text-accent">10+</div>
                    <div className="text-xs text-muted-foreground">Program</div>
                  </div>
                  <div className="w-px bg-border" />
                  <div className="text-center">
                    <div className="text-2xl font-bold text-accent">1</div>
                    <div className="text-xs text-muted-foreground">Tujuan</div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Core Values */}
        <div className="grid sm:grid-cols-2 lg:grid-cols-4 gap-6">
          {coreValues.map((value, index) => (
            <div
              key={value.title}
              className="group p-6 rounded-2xl bg-card border border-border hover:border-accent/50 hover:shadow-medium transition-all duration-300"
              style={{ animationDelay: `${index * 100}ms` }}
            >
              <div className="w-12 h-12 rounded-xl bg-accent/10 group-hover:bg-accent/20 flex items-center justify-center mb-4 transition-colors">
                <value.icon className="w-6 h-6 text-accent" />
              </div>
              <h4 className="font-semibold text-foreground mb-2">{value.title}</h4>
              <p className="text-sm text-muted-foreground">{value.description}</p>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
};

export default AboutSection;
