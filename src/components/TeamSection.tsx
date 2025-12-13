import { Instagram, Mail } from "lucide-react";

const teamMembers = [
  {
    name: "Ahmad Fauzan",
    role: "Ketua Angkatan",
    description: "Memimpin dengan visi dan dedikasi tinggi",
  },
  {
    name: "Siti Nurhaliza",
    role: "Wakil Ketua",
    description: "Koordinator utama kegiatan internal",
  },
  {
    name: "Muhammad Rizki",
    role: "Sekretaris",
    description: "Dokumentasi dan administrasi",
  },
  {
    name: "Aisyah Putri",
    role: "Bendahara",
    description: "Pengelolaan keuangan angkatan",
  },
  {
    name: "Hasan Abdullah",
    role: "Koordinator Media",
    description: "Kreator konten dan publikasi",
  },
  {
    name: "Fatimah Zahra",
    role: "Koordinator Acara",
    description: "Perencana dan pelaksana kegiatan",
  },
];

const TeamSection = () => {
  return (
    <section id="anggota" className="py-24 bg-muted/30">
      <div className="section-container">
        {/* Section Header */}
        <div className="text-center mb-16">
          <span className="inline-block px-4 py-1.5 rounded-full bg-accent/10 text-accent font-medium text-sm mb-4">
            Tim Kami
          </span>
          <h2 className="section-title mb-6">
            Anggota <span className="text-accent">Inti</span>
          </h2>
          <p className="section-subtitle">
            Orang-orang hebat di balik keberhasilan Angkatan 23
          </p>
        </div>

        {/* Team Grid */}
        <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-8">
          {teamMembers.map((member, index) => (
            <div
              key={member.name}
              className="group relative bg-card rounded-2xl overflow-hidden border border-border hover:border-accent/50 transition-all duration-300 hover:shadow-medium"
            >
              {/* Photo Placeholder */}
              <div className="aspect-[4/3] bg-gradient-to-br from-primary/80 to-navy-light relative overflow-hidden">
                <div className="absolute inset-0 flex items-center justify-center">
                  <div className="w-24 h-24 rounded-full bg-primary-foreground/20 backdrop-blur-sm flex items-center justify-center">
                    <span className="text-4xl font-display font-bold text-primary-foreground">
                      {member.name.charAt(0)}
                    </span>
                  </div>
                </div>
                {/* Overlay on hover */}
                <div className="absolute inset-0 bg-gradient-to-t from-primary/90 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300 flex items-end justify-center pb-6">
                  <div className="flex gap-3">
                    <button className="w-10 h-10 rounded-full bg-primary-foreground/20 backdrop-blur-sm flex items-center justify-center hover:bg-accent transition-colors">
                      <Instagram size={18} className="text-primary-foreground" />
                    </button>
                    <button className="w-10 h-10 rounded-full bg-primary-foreground/20 backdrop-blur-sm flex items-center justify-center hover:bg-accent transition-colors">
                      <Mail size={18} className="text-primary-foreground" />
                    </button>
                  </div>
                </div>
              </div>

              {/* Info */}
              <div className="p-6">
                <div className="flex items-start justify-between gap-4">
                  <div>
                    <h3 className="font-semibold text-lg text-foreground mb-1">
                      {member.name}
                    </h3>
                    <p className="text-accent font-medium text-sm mb-2">
                      {member.role}
                    </p>
                    <p className="text-muted-foreground text-sm">
                      {member.description}
                    </p>
                  </div>
                  <div className="w-8 h-8 rounded-lg bg-accent/10 flex items-center justify-center flex-shrink-0">
                    <span className="text-accent font-bold text-sm">{index + 1}</span>
                  </div>
                </div>
              </div>
            </div>
          ))}
        </div>

        {/* More Members Note */}
        <div className="text-center mt-12">
          <p className="text-muted-foreground">
            Dan <span className="text-accent font-semibold">18+ anggota</span> lainnya yang tidak kalah berdedikasi
          </p>
        </div>
      </div>
    </section>
  );
};

export default TeamSection;
