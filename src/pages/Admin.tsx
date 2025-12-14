import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { supabase } from "@/integrations/supabase/client";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { useToast } from "@/hooks/use-toast";
import { User, Session } from "@supabase/supabase-js";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import {
  LogOut,
  Plus,
  Trash2,
  Pencil,
  Image as ImageIcon,
  ArrowDown,
  Home,
} from "lucide-react";

interface GalleryPhoto {
  id: string;
  title: string;
  description: string | null;
  image_url: string;
  created_at: string;
}

const Admin = () => {
  const [user, setUser] = useState<User | null>(null);
  const [session, setSession] = useState<Session | null>(null);
  const [isAdmin, setIsAdmin] = useState(false);
  const [loading, setLoading] = useState(true);
  const [photos, setPhotos] = useState<GalleryPhoto[]>([]);
  const [title, setTitle] = useState("");
  const [description, setDescription] = useState("");
  const [imageFile, setImageFile] = useState<File | null>(null);
  const [uploading, setUploading] = useState(false);
  
  // Edit state
  const [editingPhoto, setEditingPhoto] = useState<GalleryPhoto | null>(null);
  const [editTitle, setEditTitle] = useState("");
  const [editDescription, setEditDescription] = useState("");
  const [updating, setUpdating] = useState(false);
  
  const navigate = useNavigate();
  const { toast } = useToast();

  useEffect(() => {
    const { data: { subscription } } = supabase.auth.onAuthStateChange(
      (event, session) => {
        setSession(session);
        setUser(session?.user ?? null);
        if (!session) {
          navigate("/auth");
        }
      }
    );

    supabase.auth.getSession().then(({ data: { session } }) => {
      setSession(session);
      setUser(session?.user ?? null);
      if (!session) {
        navigate("/auth");
      }
    });

    return () => subscription.unsubscribe();
  }, [navigate]);

  useEffect(() => {
    if (user) {
      checkAdminStatus();
      fetchPhotos();
    }
  }, [user]);

  const checkAdminStatus = async () => {
    if (!user) return;
    
    const { data, error } = await supabase.rpc("is_admin", {
      _user_id: user.id,
    });
    
    setIsAdmin(data || false);
    setLoading(false);
  };

  const fetchPhotos = async () => {
    const { data, error } = await supabase
      .from("gallery_photos")
      .select("*")
      .order("created_at", { ascending: false });

    if (data) {
      setPhotos(data);
    }
  };

  const handleLogout = async () => {
    await supabase.auth.signOut();
    navigate("/auth");
  };

  const validateImageFile = (file: File): string | null => {
    const allowedTypes = ['image/jpeg', 'image/png', 'image/gif', 'image/webp'];
    const maxSize = 10 * 1024 * 1024; // 10MB

    if (!allowedTypes.includes(file.type)) {
      return 'Tipe file tidak valid. Hanya JPEG, PNG, GIF, atau WebP yang diizinkan.';
    }
    if (file.size > maxSize) {
      return 'Ukuran file terlalu besar. Maksimal 10MB.';
    }
    return null;
  };

  const sanitizeFileName = (fileName: string): string => {
    const ext = fileName.split('.').pop()?.toLowerCase() || 'jpg';
    const allowedExtensions = ['jpg', 'jpeg', 'png', 'gif', 'webp'];
    const safeExt = allowedExtensions.includes(ext) ? ext : 'jpg';
    return `${Date.now()}.${safeExt}`;
  };

  const handleUpload = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!imageFile || !title || !isAdmin) return;

    // Validate file
    const validationError = validateImageFile(imageFile);
    if (validationError) {
      toast({
        title: "Error",
        description: validationError,
        variant: "destructive",
      });
      return;
    }

    setUploading(true);
    try {
      const fileName = sanitizeFileName(imageFile.name);

      const { error: uploadError } = await supabase.storage
        .from("gallery")
        .upload(fileName, imageFile);

      if (uploadError) throw uploadError;

      const { data: urlData } = supabase.storage
        .from("gallery")
        .getPublicUrl(fileName);

      const { error: insertError } = await supabase
        .from("gallery_photos")
        .insert({
          title: title.trim(),
          description: description?.trim() || null,
          image_url: urlData.publicUrl,
        });

      if (insertError) throw insertError;

      toast({ title: "Foto berhasil diupload!" });
      setTitle("");
      setDescription("");
      setImageFile(null);
      fetchPhotos();
    } catch (error: any) {
      toast({
        title: "Error",
        description: error.message,
        variant: "destructive",
      });
    } finally {
      setUploading(false);
    }
  };

  const handleDelete = async (id: string, imageUrl: string) => {
    if (!isAdmin) return;

    try {
      const fileName = imageUrl.split("/").pop();
      
      if (fileName) {
        await supabase.storage.from("gallery").remove([fileName]);
      }

      const { error } = await supabase
        .from("gallery_photos")
        .delete()
        .eq("id", id);

      if (error) throw error;

      toast({ title: "Foto berhasil dihapus!" });
      fetchPhotos();
    } catch (error: any) {
      toast({
        title: "Error",
        description: error.message,
        variant: "destructive",
      });
    }
  };

  const openEditDialog = (photo: GalleryPhoto) => {
    setEditingPhoto(photo);
    setEditTitle(photo.title);
    setEditDescription(photo.description || "");
  };

  const closeEditDialog = () => {
    setEditingPhoto(null);
    setEditTitle("");
    setEditDescription("");
  };

  const handleUpdate = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!editingPhoto || !editTitle || !isAdmin) return;

    setUpdating(true);
    try {
      const { error } = await supabase
        .from("gallery_photos")
        .update({
          title: editTitle,
          description: editDescription || null,
        })
        .eq("id", editingPhoto.id);

      if (error) throw error;

      toast({ title: "Foto berhasil diperbarui!" });
      closeEditDialog();
      fetchPhotos();
    } catch (error: any) {
      toast({
        title: "Error",
        description: error.message,
        variant: "destructive",
      });
    } finally {
      setUpdating(false);
    }
  };

  const scrollToGallery = () => {
    navigate("/#galeri");
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center">
        <div className="text-muted-foreground">Loading...</div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-background">
      {/* Header */}
      <header className="bg-card border-b border-border sticky top-0 z-10">
        <div className="section-container py-4 flex items-center justify-between">
          <div className="flex items-center gap-4">
            <h1 className="text-xl font-bold text-foreground">Admin Panel</h1>
            {isAdmin && (
              <span className="px-2 py-1 bg-accent/20 text-accent text-xs font-medium rounded-full">
                Admin
              </span>
            )}
          </div>
          <div className="flex items-center gap-3">
            <Button variant="outline" size="sm" onClick={() => navigate("/")}>
              <Home size={16} className="mr-2" />
              Beranda
            </Button>
            <Button variant="outline" size="sm" onClick={scrollToGallery}>
              <ArrowDown size={16} className="mr-2" />
              Lihat Galeri
            </Button>
            <Button variant="ghost" size="sm" onClick={handleLogout}>
              <LogOut size={16} className="mr-2" />
              Logout
            </Button>
          </div>
        </div>
      </header>

      <main className="section-container py-8">
        {!isAdmin ? (
          <div className="text-center py-16">
            <div className="w-20 h-20 bg-muted rounded-full flex items-center justify-center mx-auto mb-4">
              <ImageIcon size={32} className="text-muted-foreground" />
            </div>
            <h2 className="text-xl font-semibold text-foreground mb-2">
              Akses Terbatas
            </h2>
            <p className="text-muted-foreground mb-4">
              Anda tidak memiliki akses admin. Hubungi administrator untuk mendapatkan akses.
            </p>
            <p className="text-sm text-muted-foreground">
              Email: {user?.email}
            </p>
          </div>
        ) : (
          <div className="grid lg:grid-cols-3 gap-8">
            {/* Upload Form */}
            <div className="lg:col-span-1">
              <div className="glass-card p-6 bg-card sticky top-24">
                <h2 className="text-lg font-semibold text-foreground mb-4 flex items-center gap-2">
                  <Plus size={20} />
                  Upload Foto Baru
                </h2>
                <form onSubmit={handleUpload} className="space-y-4">
                  <div className="space-y-2">
                    <Label htmlFor="title">Judul</Label>
                    <Input
                      id="title"
                      value={title}
                      onChange={(e) => setTitle(e.target.value)}
                      placeholder="Judul foto"
                      required
                    />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="description">Deskripsi (opsional)</Label>
                    <Textarea
                      id="description"
                      value={description}
                      onChange={(e) => setDescription(e.target.value)}
                      placeholder="Deskripsi foto"
                      rows={3}
                    />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="image">Gambar</Label>
                    <Input
                      id="image"
                      type="file"
                      accept="image/*"
                      onChange={(e) => setImageFile(e.target.files?.[0] || null)}
                      required
                    />
                  </div>
                  <Button type="submit" className="w-full" disabled={uploading}>
                    {uploading ? "Uploading..." : "Upload Foto"}
                  </Button>
                </form>
              </div>
            </div>

            {/* Gallery List */}
            <div className="lg:col-span-2">
              <h2 className="text-lg font-semibold text-foreground mb-4">
                Galeri Foto ({photos.length})
              </h2>
              {photos.length === 0 ? (
                <div className="text-center py-12 bg-muted/30 rounded-xl">
                  <ImageIcon size={48} className="mx-auto text-muted-foreground mb-4" />
                  <p className="text-muted-foreground">Belum ada foto di galeri</p>
                </div>
              ) : (
                <div className="grid sm:grid-cols-2 gap-4">
                  {photos.map((photo) => (
                    <div
                      key={photo.id}
                      className="group glass-card bg-card overflow-hidden"
                    >
                      <div className="aspect-video relative">
                        <img
                          src={photo.image_url}
                          alt={photo.title}
                          className="w-full h-full object-cover"
                        />
                        <div className="absolute top-2 right-2 flex gap-2 opacity-0 group-hover:opacity-100 transition-opacity">
                          <button
                            onClick={() => openEditDialog(photo)}
                            className="w-8 h-8 bg-accent text-accent-foreground rounded-full flex items-center justify-center"
                          >
                            <Pencil size={16} />
                          </button>
                          <button
                            onClick={() => handleDelete(photo.id, photo.image_url)}
                            className="w-8 h-8 bg-destructive text-destructive-foreground rounded-full flex items-center justify-center"
                          >
                            <Trash2 size={16} />
                          </button>
                        </div>
                      </div>
                      <div className="p-4">
                        <h3 className="font-semibold text-foreground mb-1">
                          {photo.title}
                        </h3>
                        {photo.description && (
                          <p className="text-sm text-muted-foreground line-clamp-2">
                            {photo.description}
                          </p>
                        )}
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>
          </div>
        )}
      </main>

      {/* Edit Dialog */}
      <Dialog open={!!editingPhoto} onOpenChange={(open) => !open && closeEditDialog()}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Edit Foto</DialogTitle>
          </DialogHeader>
          <form onSubmit={handleUpdate} className="space-y-4">
            {editingPhoto && (
              <div className="aspect-video rounded-lg overflow-hidden bg-muted">
                <img
                  src={editingPhoto.image_url}
                  alt={editingPhoto.title}
                  className="w-full h-full object-cover"
                />
              </div>
            )}
            <div className="space-y-2">
              <Label htmlFor="edit-title">Judul</Label>
              <Input
                id="edit-title"
                value={editTitle}
                onChange={(e) => setEditTitle(e.target.value)}
                placeholder="Judul foto"
                required
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="edit-description">Deskripsi (opsional)</Label>
              <Textarea
                id="edit-description"
                value={editDescription}
                onChange={(e) => setEditDescription(e.target.value)}
                placeholder="Deskripsi foto"
                rows={3}
              />
            </div>
            <div className="flex gap-3 justify-end">
              <Button type="button" variant="outline" onClick={closeEditDialog}>
                Batal
              </Button>
              <Button type="submit" disabled={updating}>
                {updating ? "Menyimpan..." : "Simpan"}
              </Button>
            </div>
          </form>
        </DialogContent>
      </Dialog>
    </div>
  );
};

export default Admin;
