import { Instagram } from "lucide-react";
import { useEffect, useState } from "react";
import { supabase } from "@/integrations/supabase/client";

interface TeamMember {
  id: string;
  name: string;
  role: string;
  instagram: string | null;
  photo_url: string | null;
  display_order: number;
}

const TeamSection = () => {
  const [teamMembers, setTeamMembers] = useState<TeamMember[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchTeamMembers = async () => {
      const { data, error } = await supabase
        .from("team_members")
        .select("*")
        .order("display_order", { ascending: true });

      if (error) {
        console.error("Error fetching team members:", error);
      } else {
        setTeamMembers(data || []);
      }
      setLoading(false);
    };

    fetchTeamMembers();
  }, []);

  if (loading) {
    return (
      <section id="anggota" className="py-24 bg-muted/30">
        <div className="section-container">
          <div className="text-center">
            <p className="text-muted-foreground">Memuat data tim...</p>
          </div>
        </div>
      </section>
    );
  }

  if (teamMembers.length === 0) {
    return (
      <section id="anggota" className="py-24 bg-muted/30">
        <div className="section-container">
          <div className="text-center mb-16">
            <span className="inline-block px-4 py-1.5 rounded-full bg-accent/10 text-accent font-medium text-sm mb-4">
              Tim Kami
            </span>
            <h2 className="section-title mb-6">
              Anggota <span className="text-accent">Inti</span>
            </h2>
            <p className="section-subtitle">
              Data anggota tim belum tersedia
            </p>
          </div>
        </div>
      </section>
    );
  }

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
              key={member.id}
              className="group relative bg-card rounded-2xl overflow-hidden border border-border hover:border-accent/50 transition-all duration-300 hover:shadow-medium"
            >
              {/* Photo */}
              <div className="aspect-[4/3] bg-gradient-to-br from-primary/80 to-navy-light relative overflow-hidden">
                {member.photo_url ? (
                  <img
                    src={member.photo_url}
                    alt={member.name}
                    className="w-full h-full object-cover"
                  />
                ) : (
                  <div className="absolute inset-0 flex items-center justify-center">
                    <div className="w-24 h-24 rounded-full bg-primary-foreground/20 backdrop-blur-sm flex items-center justify-center">
                      <span className="text-4xl font-display font-bold text-primary-foreground">
                        {member.name.charAt(0)}
                      </span>
                    </div>
                  </div>
                )}
                {/* Overlay on hover */}
                {member.instagram && (
                  <div className="absolute inset-0 bg-gradient-to-t from-primary/90 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300 flex items-end justify-center pb-6">
                    <div className="flex gap-3">
                      <a
                        href={`https://instagram.com/${member.instagram}`}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="w-10 h-10 rounded-full bg-primary-foreground/20 backdrop-blur-sm flex items-center justify-center hover:bg-accent transition-colors"
                      >
                        <Instagram size={18} className="text-primary-foreground" />
                      </a>
                    </div>
                  </div>
                )}
              </div>

              {/* Info */}
              <div className="p-6">
                <div className="flex items-start justify-between gap-4">
                  <div>
                    <h3 className="font-semibold text-lg text-foreground mb-1">
                      {member.name}
                    </h3>
                    <p className="text-accent font-medium text-sm">
                      {member.role}
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
