import { useState, useEffect } from "react";
import { X, ChevronLeft, ChevronRight, Image as ImageIcon } from "lucide-react";
import { supabase } from "@/integrations/supabase/client";

interface GalleryPhoto {
  id: string;
  title: string;
  description: string | null;
  image_url: string;
}

const PHOTOS_PER_PAGE = 6;

const GallerySection = () => {
  const [selectedImage, setSelectedImage] = useState<string | null>(null);
  const [photos, setPhotos] = useState<GalleryPhoto[]>([]);
  const [loading, setLoading] = useState(true);
  const [currentPage, setCurrentPage] = useState(1);

  useEffect(() => {
    fetchPhotos();
  }, []);

  const fetchPhotos = async () => {
    const { data, error } = await supabase
      .from("gallery_photos")
      .select("*")
      .order("created_at", { ascending: false });

    if (data) {
      setPhotos(data);
    }
    setLoading(false);
  };

  const totalPages = Math.ceil(photos.length / PHOTOS_PER_PAGE);
  const paginatedPhotos = photos.slice(
    (currentPage - 1) * PHOTOS_PER_PAGE,
    currentPage * PHOTOS_PER_PAGE
  );

  const goToPage = (page: number) => {
    setCurrentPage(page);
    document.getElementById('galeri')?.scrollIntoView({ behavior: 'smooth' });
  };

  const openLightbox = (id: string) => setSelectedImage(id);
  const closeLightbox = () => setSelectedImage(null);

  const navigateImage = (direction: "prev" | "next") => {
    if (selectedImage === null) return;
    const currentIndex = photos.findIndex((item) => item.id === selectedImage);
    if (direction === "prev") {
      const newIndex = currentIndex === 0 ? photos.length - 1 : currentIndex - 1;
      setSelectedImage(photos[newIndex].id);
    } else {
      const newIndex = currentIndex === photos.length - 1 ? 0 : currentIndex + 1;
      setSelectedImage(photos[newIndex].id);
    }
  };

  const selectedItem = photos.find((item) => item.id === selectedImage);

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
        {loading ? (
          <div className="flex items-center justify-center py-16">
            <div className="text-muted-foreground">Memuat galeri...</div>
          </div>
        ) : photos.length === 0 ? (
          <div className="text-center py-16">
            <ImageIcon size={48} className="mx-auto text-muted-foreground mb-4" />
            <p className="text-muted-foreground">Belum ada foto di galeri</p>
          </div>
        ) : (
          <>
            <div className="grid grid-cols-2 md:grid-cols-3 gap-4 md:gap-6">
              {paginatedPhotos.map((item) => (
                <button
                  key={item.id}
                  onClick={() => openLightbox(item.id)}
                  className="group relative overflow-hidden rounded-2xl aspect-square hover:shadow-medium transition-all duration-300"
                >
                  {/* Image */}
                  <img
                    src={item.image_url}
                    alt={item.title}
                    className="w-full h-full object-cover transition-transform duration-300 group-hover:scale-105"
                  />

                  {/* Overlay */}
                  <div className="absolute inset-0 bg-gradient-to-t from-primary/90 via-primary/40 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300">
                    <div className="absolute bottom-0 left-0 right-0 p-4 md:p-6">
                      <h4 className="text-primary-foreground font-semibold text-sm md:text-base">
                        {item.title}
                      </h4>
                      {item.description && (
                        <p className="text-primary-foreground/70 text-xs mt-1 line-clamp-2">
                          {item.description}
                        </p>
                      )}
                    </div>
                  </div>

                  {/* Border Effect */}
                  <div className="absolute inset-0 border-2 border-transparent group-hover:border-accent/50 rounded-2xl transition-colors" />
                </button>
              ))}
            </div>

            {/* Pagination */}
            {totalPages > 1 && (
              <div className="flex items-center justify-center gap-2 mt-8">
                <button
                  onClick={() => goToPage(currentPage - 1)}
                  disabled={currentPage === 1}
                  className="w-10 h-10 rounded-full bg-accent/10 flex items-center justify-center hover:bg-accent/20 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  <ChevronLeft size={20} className="text-accent" />
                </button>
                
                {Array.from({ length: totalPages }, (_, i) => i + 1).map((page) => (
                  <button
                    key={page}
                    onClick={() => goToPage(page)}
                    className={`w-10 h-10 rounded-full flex items-center justify-center transition-colors font-medium ${
                      currentPage === page
                        ? "bg-accent text-accent-foreground"
                        : "bg-accent/10 text-accent hover:bg-accent/20"
                    }`}
                  >
                    {page}
                  </button>
                ))}
                
                <button
                  onClick={() => goToPage(currentPage + 1)}
                  disabled={currentPage === totalPages}
                  className="w-10 h-10 rounded-full bg-accent/10 flex items-center justify-center hover:bg-accent/20 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  <ChevronRight size={20} className="text-accent" />
                </button>
              </div>
            )}
          </>
        )}
      </div>

      {/* Lightbox */}
      {selectedImage !== null && selectedItem && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-primary/95 backdrop-blur-sm">
          {/* Close Button */}
          <button
            onClick={closeLightbox}
            className="absolute top-4 right-4 w-12 h-12 rounded-full bg-primary-foreground/10 flex items-center justify-center hover:bg-primary-foreground/20 transition-colors"
          >
            <X size={24} className="text-primary-foreground" />
          </button>

          {/* Navigation */}
          {photos.length > 1 && (
            <>
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
            </>
          )}

          {/* Image Container */}
          <div className="max-w-4xl w-full mx-4">
            <div className="rounded-2xl overflow-hidden">
              <img
                src={selectedItem.image_url}
                alt={selectedItem.title}
                className="w-full max-h-[80vh] object-contain bg-dark"
              />
            </div>
            <div className="text-center mt-4">
              <h3 className="text-primary-foreground text-xl font-semibold mb-2">
                {selectedItem.title}
              </h3>
              {selectedItem.description && (
                <p className="text-primary-foreground/70">{selectedItem.description}</p>
              )}
            </div>
          </div>
        </div>
      )}
    </section>
  );
};

export default GallerySection;
