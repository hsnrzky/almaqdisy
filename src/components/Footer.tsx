import { Instagram, Mail, MapPin, Heart } from "lucide-react";
import mqdsLogo from "@/assets/mqds-logo.png";

const socialLinks = [
  { icon: Instagram, href: "https://www.instagram.com/mqds_foundation", label: "Instagram" },
  { icon: Mail, href: "mailto:mqds23@email.com", label: "Email" },
];

const Footer = () => {
  return (
    <footer className="bg-primary pt-16 pb-8">
      <div className="section-container">
        {/* Main Footer Content */}
        <div className="grid md:grid-cols-3 gap-12 mb-12">
          {/* Brand */}
          <div>
            <div className="flex items-center gap-3 mb-4">
              <img 
                src={mqdsLogo} 
                alt="MQDS Logo" 
                className="w-12 h-12 rounded-full object-cover"
              />
              <div>
                <h3 className="font-display text-xl font-bold text-primary-foreground">MQDS</h3>
                <p className="text-gold-light text-sm">Angkatan 23 - Al Maqdisy</p>
              </div>
            </div>
            <p className="text-primary-foreground/70 text-sm leading-relaxed">
              Menghubungkan masa lalu, membentuk masa depan. Bersama kita wujudkan visi dan misi angkatan.
            </p>
          </div>

          {/* Quick Links */}
          <div>
            <h4 className="font-semibold text-primary-foreground mb-4">Navigasi</h4>
            <ul className="space-y-3">
              {[
                { href: "#tentang", label: "Tentang Kami" },
                { href: "#anggota", label: "Anggota Tim" },
                { href: "#visi-misi", label: "Visi & Misi" },
                { href: "#galeri", label: "Galeri" },
              ].map((link) => (
                <li key={link.href}>
                  <a
                    href={link.href}
                    className="text-primary-foreground/70 hover:text-accent transition-colors text-sm"
                  >
                    {link.label}
                  </a>
                </li>
              ))}
            </ul>
          </div>

          {/* Contact */}
          <div>
            <h4 className="font-semibold text-primary-foreground mb-4">Kontak</h4>
            <ul className="space-y-3">
              <li>
                <a
                  href="https://www.instagram.com/mqds_foundation"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="flex items-center gap-3 text-primary-foreground/70 hover:text-accent transition-colors text-sm"
                >
                  <Instagram size={16} />
                  @mqds_foundation
                </a>
              </li>
              <li>
                <a
                  href="mailto:mqds23@email.com"
                  className="flex items-center gap-3 text-primary-foreground/70 hover:text-accent transition-colors text-sm"
                >
                  <Mail size={16} />
                  mqds23@email.com
                </a>
              </li>
              <li className="flex items-center gap-3 text-primary-foreground/70 text-sm">
                <MapPin size={16} />
                Indonesia
              </li>
            </ul>

            {/* Social Links */}
            <div className="flex gap-3 mt-6">
              {socialLinks.map((social) => (
                <a
                  key={social.label}
                  href={social.href}
                  target="_blank"
                  rel="noopener noreferrer"
                  aria-label={social.label}
                  className="w-10 h-10 rounded-full bg-primary-foreground/10 flex items-center justify-center hover:bg-accent hover:text-accent-foreground transition-colors"
                >
                  <social.icon size={18} className="text-primary-foreground" />
                </a>
              ))}
            </div>
          </div>
        </div>

        {/* Divider */}
        <div className="h-px bg-primary-foreground/10 mb-8" />

        {/* Bottom Footer */}
        <div className="flex flex-col md:flex-row items-center justify-between gap-4">
          <p className="text-primary-foreground/60 text-sm">
            © 2023 MQDS Angkatan 23. All rights reserved.
          </p>
          <p className="text-primary-foreground/60 text-sm flex items-center gap-1">
            Dibuat dengan <Heart size={14} className="text-accent fill-accent" /> oleh Angkatan 23
          </p>
        </div>
      </div>
    </footer>
  );
};

export default Footer;
