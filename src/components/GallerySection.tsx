import { useState } from "react";
import { X, ChevronLeft, ChevronRight } from "lucide-react";

const galleryItems = [
  { id: 1, title: "Pelantikan Angkatan", category: "Acara" },
  { id: 2, title: "Kegiatan Bersama", category: "Kebersamaan" },
  { id: 3, title: "Bakti Sosial", category: "Pengabdian" },
  { id: 4, title: "Rapat Koordinasi", category: "Organisasi" },
  { id: 5, title: "Pelatihan Leadership", category: "Pengembangan" },
  { id: 6, title: "Momen Keakraban", category: "Kebersamaan" },
  { id: 7, title: "Kegiatan Outdoor", category: "Petualangan" },
  { id: 8, title: "Peringatan Hari Besar", category: "Acara" },
  { id: 9, title: "Foto Bersama", category: "Memori" },
];

const GallerySection = () => {
  const [selectedImage, setSelectedImage] = useState<number | null>(null);

  const openLightbox = (id: number) => setSelectedImage(id);
  const closeLightbox = () => setSelectedImage(null);

  const navigateImage = (direction: "prev" | "next") => {
    if (selectedImage === null) return;
    const currentIndex = galleryItems.findIndex((item) => item.id === selectedImage);
    if (direction === "prev") {
      const newIndex = currentIndex === 0 ? galleryItems.length - 1 : currentIndex - 1;
      setSelectedImage(galleryItems[newIndex].id);
    } else {
      const newIndex = currentIndex === galleryItems.length - 1 ? 0 : currentIndex + 1;
      setSelectedImage(galleryItems[newIndex].id);
    }
  };

  const selectedItem = galleryItems.find((item) => item.id === selectedImage);

  return (
    <section id="galeri" className="py-24 bg-muted/30">
      <div className="section-container">
        {/* Section Header */}
        <div className="text-center mb-16">
          <span className="inline-block px-4 py-1.5 rounded-full bg-accent/10 text-accent font-medium text-sm mb-4">
            Momen Berharga
          </span>
          <h2 className="section-title mb-6">
            Galeri <span className="text-accent">Kegiatan</span>
          </h2>
          <p className="section-subtitle">
            Jejak perjalanan kami yang penuh warna dan bermakna
          </p>
        </div>

        {/* Gallery Grid */}
        <div className="grid grid-cols-2 md:grid-cols-3 gap-4 md:gap-6">
          {galleryItems.map((item, index) => (
            <button
              key={item.id}
              onClick={() => openLightbox(item.id)}
              className={`group relative overflow-hidden rounded-2xl aspect-square bg-gradient-to-br from-primary/70 to-navy-light hover:shadow-medium transition-all duration-300 ${
                index === 0 || index === 4 ? "md:col-span-1 md:row-span-1" : ""
              }`}
            >
              {/* Placeholder Content */}
              <div className="absolute inset-0 flex items-center justify-center">
                <div className="w-16 h-16 rounded-full bg-primary-foreground/10 flex items-center justify-center">
                  <span className="text-2xl font-bold text-primary-foreground/50">{item.id}</span>
                </div>
              </div>

              {/* Overlay */}
              <div className="absolute inset-0 bg-gradient-to-t from-primary/90 via-primary/40 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300">
                <div className="absolute bottom-0 left-0 right-0 p-4 md:p-6">
                  <span className="inline-block px-2 py-1 rounded-full bg-accent/20 text-accent text-xs font-medium mb-2">
                    {item.category}
                  </span>
                  <h4 className="text-primary-foreground font-semibold text-sm md:text-base">
                    {item.title}
                  </h4>
                </div>
              </div>

              {/* Border Effect */}
              <div className="absolute inset-0 border-2 border-transparent group-hover:border-accent/50 rounded-2xl transition-colors" />
            </button>
          ))}
        </div>

        {/* View More Button - Scrolls to show all gallery */}
        <div className="text-center mt-12">
          <button 
            onClick={() => {
              const galleryGrid = document.querySelector('#galeri .grid');
              if (galleryGrid) {
                galleryGrid.scrollIntoView({ behavior: 'smooth', block: 'start' });
              }
            }}
            className="inline-flex items-center gap-2 px-6 py-3 bg-primary hover:bg-dark-light text-primary-foreground font-medium rounded-full transition-all duration-300 hover:shadow-medium"
          >
            Lihat Semua Galeri
          </button>
        </div>
      </div>

      {/* Lightbox */}
      {selectedImage !== null && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-primary/95 backdrop-blur-sm">
          {/* Close Button */}
          <button
            onClick={closeLightbox}
            className="absolute top-4 right-4 w-12 h-12 rounded-full bg-primary-foreground/10 flex items-center justify-center hover:bg-primary-foreground/20 transition-colors"
          >
            <X size={24} className="text-primary-foreground" />
          </button>

          {/* Navigation */}
          <button
            onClick={() => navigateImage("prev")}
            className="absolute left-4 w-12 h-12 rounded-full bg-primary-foreground/10 flex items-center justify-center hover:bg-primary-foreground/20 transition-colors"
          >
            <ChevronLeft size={24} className="text-primary-foreground" />
          </button>
          <button
            onClick={() => navigateImage("next")}
            className="absolute right-4 w-12 h-12 rounded-full bg-primary-foreground/10 flex items-center justify-center hover:bg-primary-foreground/20 transition-colors"
          >
            <ChevronRight size={24} className="text-primary-foreground" />
          </button>

          {/* Image Container */}
          <div className="max-w-4xl w-full mx-4">
            <div className="aspect-video bg-gradient-to-br from-primary to-navy-light rounded-2xl flex items-center justify-center">
              <div className="text-center">
                <div className="w-24 h-24 rounded-full bg-primary-foreground/10 flex items-center justify-center mx-auto mb-4">
                  <span className="text-4xl font-bold text-primary-foreground/50">{selectedImage}</span>
                </div>
                <h3 className="text-primary-foreground text-xl font-semibold mb-2">
                  {selectedItem?.title}
                </h3>
                <span className="text-accent text-sm">{selectedItem?.category}</span>
              </div>
            </div>
          </div>
        </div>
      )}
    </section>
  );
};

export default GallerySection;
