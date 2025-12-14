import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { supabase } from "@/integrations/supabase/client";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Switch } from "@/components/ui/switch";
import { useToast } from "@/hooks/use-toast";
import { User, Session } from "@supabase/supabase-js";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
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
  Users,
  UserCog,
  Instagram,
} from "lucide-react";

interface GalleryPhoto {
  id: string;
  title: string;
  description: string | null;
  image_url: string;
  created_at: string;
}

interface Profile {
  id: string;
  email: string | null;
  can_upload: boolean;
  created_at: string;
}

interface TeamMember {
  id: string;
  name: string;
  role: string;
  instagram: string | null;
  photo_url: string | null;
  display_order: number;
}

const Admin = () => {
  const [user, setUser] = useState<User | null>(null);
  const [session, setSession] = useState<Session | null>(null);
  const [isAdmin, setIsAdmin] = useState(false);
  const [loading, setLoading] = useState(true);
  
  // Gallery state
  const [photos, setPhotos] = useState<GalleryPhoto[]>([]);
  const [title, setTitle] = useState("");
  const [description, setDescription] = useState("");
  const [imageFile, setImageFile] = useState<File | null>(null);
  const [uploading, setUploading] = useState(false);
  const [editingPhoto, setEditingPhoto] = useState<GalleryPhoto | null>(null);
  const [editTitle, setEditTitle] = useState("");
  const [editDescription, setEditDescription] = useState("");
  const [updating, setUpdating] = useState(false);

  // Users state
  const [profiles, setProfiles] = useState<Profile[]>([]);
  const [loadingProfiles, setLoadingProfiles] = useState(false);

  // Team members state
  const [teamMembers, setTeamMembers] = useState<TeamMember[]>([]);
  const [loadingTeam, setLoadingTeam] = useState(false);
  const [memberName, setMemberName] = useState("");
  const [memberRole, setMemberRole] = useState("");
  const [memberInstagram, setMemberInstagram] = useState("");
  const [memberPhotoFile, setMemberPhotoFile] = useState<File | null>(null);
  const [addingMember, setAddingMember] = useState(false);
  const [editingMember, setEditingMember] = useState<TeamMember | null>(null);
  const [editMemberName, setEditMemberName] = useState("");
  const [editMemberRole, setEditMemberRole] = useState("");
  const [editMemberInstagram, setEditMemberInstagram] = useState("");
  const [updatingMember, setUpdatingMember] = useState(false);
  
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
      fetchProfiles();
      fetchTeamMembers();
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

  const fetchProfiles = async () => {
    setLoadingProfiles(true);
    const { data, error } = await supabase
      .from("profiles")
      .select("*")
      .order("created_at", { ascending: false });

    if (data) {
      setProfiles(data);
    }
    setLoadingProfiles(false);
  };

  const fetchTeamMembers = async () => {
    setLoadingTeam(true);
    const { data, error } = await supabase
      .from("team_members")
      .select("*")
      .order("display_order", { ascending: true });

    if (data) {
      setTeamMembers(data);
    }
    setLoadingTeam(false);
  };

  const handleLogout = async () => {
    await supabase.auth.signOut();
    navigate("/auth");
  };

  // File validation helper
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

  // Gallery handlers
  const handleUpload = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!imageFile || !title || !isAdmin) return;

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
          title: editTitle.trim(),
          description: editDescription?.trim() || null,
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

  // User permission handlers
  const toggleUploadPermission = async (profileId: string, currentValue: boolean) => {
    if (!isAdmin) return;

    try {
      const { error } = await supabase
        .from("profiles")
        .update({ can_upload: !currentValue })
        .eq("id", profileId);

      if (error) throw error;

      toast({ title: `Akses upload ${!currentValue ? 'diaktifkan' : 'dinonaktifkan'}!` });
      fetchProfiles();
    } catch (error: any) {
      toast({
        title: "Error",
        description: error.message,
        variant: "destructive",
      });
    }
  };

  // Team member handlers
  const handleAddMember = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!memberName || !memberRole || !isAdmin) return;

    setAddingMember(true);
    try {
      let photoUrl = null;

      if (memberPhotoFile) {
        const validationError = validateImageFile(memberPhotoFile);
        if (validationError) {
          toast({
            title: "Error",
            description: validationError,
            variant: "destructive",
          });
          setAddingMember(false);
          return;
        }

        const fileName = `team_${sanitizeFileName(memberPhotoFile.name)}`;
        const { error: uploadError } = await supabase.storage
          .from("gallery")
          .upload(fileName, memberPhotoFile);

        if (uploadError) throw uploadError;

        const { data: urlData } = supabase.storage
          .from("gallery")
          .getPublicUrl(fileName);

        photoUrl = urlData.publicUrl;
      }

      const { error } = await supabase
        .from("team_members")
        .insert({
          name: memberName.trim(),
          role: memberRole.trim(),
          instagram: memberInstagram?.trim() || null,
          photo_url: photoUrl,
          display_order: teamMembers.length,
        });

      if (error) throw error;

      toast({ title: "Anggota inti berhasil ditambahkan!" });
      setMemberName("");
      setMemberRole("");
      setMemberInstagram("");
      setMemberPhotoFile(null);
      fetchTeamMembers();
    } catch (error: any) {
      toast({
        title: "Error",
        description: error.message,
        variant: "destructive",
      });
    } finally {
      setAddingMember(false);
    }
  };

  const handleDeleteMember = async (id: string, photoUrl: string | null) => {
    if (!isAdmin) return;

    try {
      if (photoUrl) {
        const fileName = photoUrl.split("/").pop();
        if (fileName) {
          await supabase.storage.from("gallery").remove([fileName]);
        }
      }

      const { error } = await supabase
        .from("team_members")
        .delete()
        .eq("id", id);

      if (error) throw error;

      toast({ title: "Anggota inti berhasil dihapus!" });
      fetchTeamMembers();
    } catch (error: any) {
      toast({
        title: "Error",
        description: error.message,
        variant: "destructive",
      });
    }
  };

  const openEditMemberDialog = (member: TeamMember) => {
    setEditingMember(member);
    setEditMemberName(member.name);
    setEditMemberRole(member.role);
    setEditMemberInstagram(member.instagram || "");
  };

  const closeEditMemberDialog = () => {
    setEditingMember(null);
    setEditMemberName("");
    setEditMemberRole("");
    setEditMemberInstagram("");
  };

  const handleUpdateMember = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!editingMember || !editMemberName || !editMemberRole || !isAdmin) return;

    setUpdatingMember(true);
    try {
      const { error } = await supabase
        .from("team_members")
        .update({
          name: editMemberName.trim(),
          role: editMemberRole.trim(),
          instagram: editMemberInstagram?.trim() || null,
        })
        .eq("id", editingMember.id);

      if (error) throw error;

      toast({ title: "Anggota inti berhasil diperbarui!" });
      closeEditMemberDialog();
      fetchTeamMembers();
    } catch (error: any) {
      toast({
        title: "Error",
        description: error.message,
        variant: "destructive",
      });
    } finally {
      setUpdatingMember(false);
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
        <div className="section-container py-4">
          <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
            <div className="flex items-center gap-4">
              <h1 className="text-xl font-bold text-foreground">Admin Panel</h1>
              {isAdmin && (
                <span className="px-2 py-1 bg-accent/20 text-accent text-xs font-medium rounded-full">
                  Admin
                </span>
              )}
            </div>
            <div className="flex items-center gap-2 flex-wrap">
              <Button variant="outline" size="sm" onClick={() => navigate("/")}>
                <Home size={16} className="sm:mr-2" />
                <span className="hidden sm:inline">Beranda</span>
              </Button>
              <Button variant="outline" size="sm" onClick={scrollToGallery}>
                <ArrowDown size={16} className="sm:mr-2" />
                <span className="hidden sm:inline">Lihat Galeri</span>
              </Button>
              <Button variant="ghost" size="sm" onClick={handleLogout}>
                <LogOut size={16} className="sm:mr-2" />
                <span className="hidden sm:inline">Logout</span>
              </Button>
            </div>
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
          <Tabs defaultValue="gallery" className="space-y-6">
            <TabsList className="grid w-full grid-cols-3 max-w-md">
              <TabsTrigger value="gallery" className="flex items-center gap-2">
                <ImageIcon size={16} />
                Galeri
              </TabsTrigger>
              <TabsTrigger value="users" className="flex items-center gap-2">
                <UserCog size={16} />
                Users
              </TabsTrigger>
              <TabsTrigger value="team" className="flex items-center gap-2">
                <Users size={16} />
                Tim Inti
              </TabsTrigger>
            </TabsList>

            {/* Gallery Tab */}
            <TabsContent value="gallery">
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
                          maxLength={100}
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
                          maxLength={500}
                          rows={3}
                        />
                      </div>
                      <div className="space-y-2">
                        <Label htmlFor="image">Gambar</Label>
                        <Input
                          id="image"
                          type="file"
                          accept="image/jpeg,image/png,image/gif,image/webp"
                          onChange={(e) => setImageFile(e.target.files?.[0] || null)}
                          required
                        />
                        <p className="text-xs text-muted-foreground">Max 10MB (JPEG, PNG, GIF, WebP)</p>
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
            </TabsContent>

            {/* Users Tab */}
            <TabsContent value="users">
              <div className="space-y-4">
                <h2 className="text-lg font-semibold text-foreground">
                  Daftar Users ({profiles.length})
                </h2>
                {loadingProfiles ? (
                  <div className="text-center py-12">
                    <p className="text-muted-foreground">Loading...</p>
                  </div>
                ) : profiles.length === 0 ? (
                  <div className="text-center py-12 bg-muted/30 rounded-xl">
                    <UserCog size={48} className="mx-auto text-muted-foreground mb-4" />
                    <p className="text-muted-foreground">Belum ada user terdaftar</p>
                  </div>
                ) : (
                  <div className="grid gap-4">
                    {profiles.map((profile) => (
                      <div
                        key={profile.id}
                        className="glass-card bg-card p-4 flex items-center justify-between"
                      >
                        <div>
                          <p className="font-medium text-foreground">{profile.email || 'No email'}</p>
                          <p className="text-sm text-muted-foreground">
                            Bergabung: {new Date(profile.created_at).toLocaleDateString('id-ID')}
                          </p>
                        </div>
                        <div className="flex items-center gap-3">
                          <div className="flex items-center gap-2">
                            <Label htmlFor={`upload-${profile.id}`} className="text-sm">
                              Akses Upload
                            </Label>
                            <Switch
                              id={`upload-${profile.id}`}
                              checked={profile.can_upload}
                              onCheckedChange={() => toggleUploadPermission(profile.id, profile.can_upload)}
                            />
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </div>
            </TabsContent>

            {/* Team Tab */}
            <TabsContent value="team">
              <div className="grid lg:grid-cols-3 gap-8">
                {/* Add Member Form */}
                <div className="lg:col-span-1">
                  <div className="glass-card p-6 bg-card sticky top-24">
                    <h2 className="text-lg font-semibold text-foreground mb-4 flex items-center gap-2">
                      <Plus size={20} />
                      Tambah Anggota Inti
                    </h2>
                    <form onSubmit={handleAddMember} className="space-y-4">
                      <div className="space-y-2">
                        <Label htmlFor="memberName">Nama</Label>
                        <Input
                          id="memberName"
                          value={memberName}
                          onChange={(e) => setMemberName(e.target.value)}
                          placeholder="Nama anggota"
                          maxLength={100}
                          required
                        />
                      </div>
                      <div className="space-y-2">
                        <Label htmlFor="memberRole">Jabatan</Label>
                        <Input
                          id="memberRole"
                          value={memberRole}
                          onChange={(e) => setMemberRole(e.target.value)}
                          placeholder="Jabatan/Role"
                          maxLength={100}
                          required
                        />
                      </div>
                      <div className="space-y-2">
                        <Label htmlFor="memberInstagram">Instagram (opsional)</Label>
                        <div className="relative">
                          <Instagram size={16} className="absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground" />
                          <Input
                            id="memberInstagram"
                            value={memberInstagram}
                            onChange={(e) => setMemberInstagram(e.target.value)}
                            placeholder="username_instagram"
                            className="pl-10"
                            maxLength={50}
                          />
                        </div>
                      </div>
                      <div className="space-y-2">
                        <Label htmlFor="memberPhoto">Foto (opsional)</Label>
                        <Input
                          id="memberPhoto"
                          type="file"
                          accept="image/jpeg,image/png,image/gif,image/webp"
                          onChange={(e) => setMemberPhotoFile(e.target.files?.[0] || null)}
                        />
                        <p className="text-xs text-muted-foreground">Max 10MB (JPEG, PNG, GIF, WebP)</p>
                      </div>
                      <Button type="submit" className="w-full" disabled={addingMember}>
                        {addingMember ? "Menambahkan..." : "Tambah Anggota"}
                      </Button>
                    </form>
                  </div>
                </div>

                {/* Team Members List */}
                <div className="lg:col-span-2">
                  <h2 className="text-lg font-semibold text-foreground mb-4">
                    Anggota Inti ({teamMembers.length})
                  </h2>
                  {loadingTeam ? (
                    <div className="text-center py-12">
                      <p className="text-muted-foreground">Loading...</p>
                    </div>
                  ) : teamMembers.length === 0 ? (
                    <div className="text-center py-12 bg-muted/30 rounded-xl">
                      <Users size={48} className="mx-auto text-muted-foreground mb-4" />
                      <p className="text-muted-foreground">Belum ada anggota inti</p>
                    </div>
                  ) : (
                    <div className="grid sm:grid-cols-2 gap-4">
                      {teamMembers.map((member) => (
                        <div
                          key={member.id}
                          className="group glass-card bg-card overflow-hidden"
                        >
                          <div className="aspect-square relative bg-muted">
                            {member.photo_url ? (
                              <img
                                src={member.photo_url}
                                alt={member.name}
                                className="w-full h-full object-cover"
                              />
                            ) : (
                              <div className="w-full h-full flex items-center justify-center">
                                <Users size={48} className="text-muted-foreground" />
                              </div>
                            )}
                            <div className="absolute top-2 right-2 flex gap-2 opacity-0 group-hover:opacity-100 transition-opacity">
                              <button
                                onClick={() => openEditMemberDialog(member)}
                                className="w-8 h-8 bg-accent text-accent-foreground rounded-full flex items-center justify-center"
                              >
                                <Pencil size={16} />
                              </button>
                              <button
                                onClick={() => handleDeleteMember(member.id, member.photo_url)}
                                className="w-8 h-8 bg-destructive text-destructive-foreground rounded-full flex items-center justify-center"
                              >
                                <Trash2 size={16} />
                              </button>
                            </div>
                          </div>
                          <div className="p-4">
                            <h3 className="font-semibold text-foreground">{member.name}</h3>
                            <p className="text-sm text-muted-foreground">{member.role}</p>
                            {member.instagram && (
                              <a
                                href={`https://instagram.com/${member.instagram}`}
                                target="_blank"
                                rel="noopener noreferrer"
                                className="text-sm text-accent hover:underline flex items-center gap-1 mt-2"
                              >
                                <Instagram size={14} />
                                @{member.instagram}
                              </a>
                            )}
                          </div>
                        </div>
                      ))}
                    </div>
                  )}
                </div>
              </div>
            </TabsContent>
          </Tabs>
        )}
      </main>

      {/* Edit Photo Dialog */}
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
                maxLength={100}
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
                maxLength={500}
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

      {/* Edit Member Dialog */}
      <Dialog open={!!editingMember} onOpenChange={(open) => !open && closeEditMemberDialog()}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Edit Anggota Inti</DialogTitle>
          </DialogHeader>
          <form onSubmit={handleUpdateMember} className="space-y-4">
            {editingMember?.photo_url && (
              <div className="aspect-square w-32 mx-auto rounded-lg overflow-hidden bg-muted">
                <img
                  src={editingMember.photo_url}
                  alt={editingMember.name}
                  className="w-full h-full object-cover"
                />
              </div>
            )}
            <div className="space-y-2">
              <Label htmlFor="edit-member-name">Nama</Label>
              <Input
                id="edit-member-name"
                value={editMemberName}
                onChange={(e) => setEditMemberName(e.target.value)}
                placeholder="Nama anggota"
                maxLength={100}
                required
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="edit-member-role">Jabatan</Label>
              <Input
                id="edit-member-role"
                value={editMemberRole}
                onChange={(e) => setEditMemberRole(e.target.value)}
                placeholder="Jabatan/Role"
                maxLength={100}
                required
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="edit-member-instagram">Instagram (opsional)</Label>
              <div className="relative">
                <Instagram size={16} className="absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground" />
                <Input
                  id="edit-member-instagram"
                  value={editMemberInstagram}
                  onChange={(e) => setEditMemberInstagram(e.target.value)}
                  placeholder="username_instagram"
                  className="pl-10"
                  maxLength={50}
                />
              </div>
            </div>
            <div className="flex gap-3 justify-end">
              <Button type="button" variant="outline" onClick={closeEditMemberDialog}>
                Batal
              </Button>
              <Button type="submit" disabled={updatingMember}>
                {updatingMember ? "Menyimpan..." : "Simpan"}
              </Button>
            </div>
          </form>
        </DialogContent>
      </Dialog>
    </div>
  );
};

export default Admin;