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
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@/components/ui/alert-dialog";
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
  Activity,
  Search,
  X,
  GripVertical,
  Crop,
} from "lucide-react";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import {
  DndContext,
  closestCenter,
  KeyboardSensor,
  PointerSensor,
  useSensor,
  useSensors,
  DragEndEvent,
} from "@dnd-kit/core";
import {
  arrayMove,
  SortableContext,
  sortableKeyboardCoordinates,
  rectSortingStrategy,
} from "@dnd-kit/sortable";
import { SortableTeamMember } from "@/components/SortableTeamMember";
import { ImageCropper } from "@/components/ImageCropper";

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
  can_manage_team: boolean;
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

interface ActivityLog {
  id: string;
  user_id: string;
  user_email: string | null;
  action: string;
  target_type: string;
  target_id: string | null;
  target_name: string | null;
  created_at: string;
}

const Admin = () => {
  const [user, setUser] = useState<User | null>(null);
  const [session, setSession] = useState<Session | null>(null);
  const [isAdmin, setIsAdmin] = useState(false);
  const [canUpload, setCanUpload] = useState(false);
  const [canManageTeam, setCanManageTeam] = useState(false);
  const [loading, setLoading] = useState(true);
  
  // Gallery state
  const [photos, setPhotos] = useState<GalleryPhoto[]>([]);
  const [title, setTitle] = useState("");
  const [description, setDescription] = useState("");
  const [imageFile, setImageFile] = useState<File | null>(null);
  const [imagePreview, setImagePreview] = useState<string | null>(null);
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
  const [memberPhotoPreview, setMemberPhotoPreview] = useState<string | null>(null);
  const [addingMember, setAddingMember] = useState(false);
  const [editingMember, setEditingMember] = useState<TeamMember | null>(null);
  const [editMemberName, setEditMemberName] = useState("");
  const [editMemberRole, setEditMemberRole] = useState("");
  const [editMemberInstagram, setEditMemberInstagram] = useState("");
  const [updatingMember, setUpdatingMember] = useState(false);

  // Activity logs state
  const [activityLogs, setActivityLogs] = useState<ActivityLog[]>([]);
  const [loadingLogs, setLoadingLogs] = useState(false);
  const [logSearch, setLogSearch] = useState("");
  const [logActionFilter, setLogActionFilter] = useState<string>("all");
  const [logTypeFilter, setLogTypeFilter] = useState<string>("all");

  // Delete confirmation state
  const [deletePhotoConfirm, setDeletePhotoConfirm] = useState<{ id: string; imageUrl: string; title: string } | null>(null);
  const [deleteMemberConfirm, setDeleteMemberConfirm] = useState<{ id: string; photoUrl: string | null; name: string } | null>(null);

  // Image cropper state
  const [cropperOpen, setCropperOpen] = useState(false);
  const [cropperImage, setCropperImage] = useState<string | null>(null);
  const [cropperType, setCropperType] = useState<"gallery" | "member">("gallery");
  
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
      checkUserPermissions();
      fetchPhotos();
    }
  }, [user]);

  const checkUserPermissions = async () => {
    if (!user) return;
    
    // Check admin status
    const { data: adminData } = await supabase.rpc("is_admin", {
      _user_id: user.id,
    });
    
    const isUserAdmin = adminData || false;
    setIsAdmin(isUserAdmin);
    
    // Check permissions from profile
    const { data: profileData } = await supabase
      .from("profiles")
      .select("can_upload, can_manage_team")
      .eq("id", user.id)
      .single();
    
    const userCanUpload = profileData?.can_upload || false;
    const userCanManageTeam = profileData?.can_manage_team || false;
    
    setCanUpload(userCanUpload);
    setCanManageTeam(userCanManageTeam);
    
    // If admin, fetch profiles, team members and activity logs
    if (isUserAdmin) {
      fetchProfiles();
      fetchTeamMembers();
      fetchActivityLogs();
    } else if (userCanManageTeam) {
      // Non-admin with team management permission
      fetchTeamMembers();
    }
    
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
      .select("id, email, can_upload, can_manage_team, created_at")
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

  const fetchActivityLogs = async () => {
    setLoadingLogs(true);
    const { data, error } = await supabase
      .from("activity_logs")
      .select("*")
      .order("created_at", { ascending: false })
      .limit(100);

    if (data) {
      setActivityLogs(data);
    }
    setLoadingLogs(false);
  };

  const logActivity = async (action: string, targetType: string, targetId?: string, targetName?: string) => {
    if (!user) return;
    
    try {
      await supabase.from("activity_logs").insert({
        user_id: user.id,
        user_email: user.email,
        action,
        target_type: targetType,
        target_id: targetId || null,
        target_name: targetName || null,
      });
    } catch (error) {
      console.error("Failed to log activity:", error);
    }
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

  // Image preview handlers with crop
  const handleImageFileChange = (file: File | null) => {
    if (file) {
      const validationError = validateImageFile(file);
      if (validationError) {
        toast({
          title: "Error",
          description: validationError,
          variant: "destructive",
        });
        return;
      }
      
      const reader = new FileReader();
      reader.onloadend = () => {
        setCropperImage(reader.result as string);
        setCropperType("gallery");
        setCropperOpen(true);
      };
      reader.readAsDataURL(file);
    } else {
      setImageFile(null);
      setImagePreview(null);
    }
  };

  const handleMemberPhotoChange = (file: File | null) => {
    if (file) {
      const validationError = validateImageFile(file);
      if (validationError) {
        toast({
          title: "Error",
          description: validationError,
          variant: "destructive",
        });
        return;
      }
      
      const reader = new FileReader();
      reader.onloadend = () => {
        setCropperImage(reader.result as string);
        setCropperType("member");
        setCropperOpen(true);
      };
      reader.readAsDataURL(file);
    } else {
      setMemberPhotoFile(null);
      setMemberPhotoPreview(null);
    }
  };

  const handleCropComplete = (croppedBlob: Blob) => {
    const file = new File([croppedBlob], `cropped_${Date.now()}.jpg`, { type: "image/jpeg" });
    const previewUrl = URL.createObjectURL(croppedBlob);
    
    if (cropperType === "gallery") {
      setImageFile(file);
      setImagePreview(previewUrl);
    } else {
      setMemberPhotoFile(file);
      setMemberPhotoPreview(previewUrl);
    }
    
    setCropperOpen(false);
    setCropperImage(null);
  };

  const handleCropperClose = () => {
    setCropperOpen(false);
    setCropperImage(null);
  };

  const clearImagePreview = () => {
    setImageFile(null);
    setImagePreview(null);
  };

  const clearMemberPhotoPreview = () => {
    setMemberPhotoFile(null);
    setMemberPhotoPreview(null);
  };

  // Instagram username validation
  const validateInstagramUsername = (username: string): boolean => {
    if (!username) return true; // Optional field
    return /^[a-zA-Z0-9._]{1,30}$/.test(username);
  };

  // Gallery handlers
  const handleUpload = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!imageFile || !title || (!isAdmin && !canUpload)) return;

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

      await logActivity("upload", "gallery_photo", undefined, title.trim());
      
      toast({ title: "Foto berhasil diupload!" });
      setTitle("");
      setDescription("");
      clearImagePreview();
      fetchPhotos();
      if (isAdmin) fetchActivityLogs();
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

  const confirmDeletePhoto = (photo: GalleryPhoto) => {
    setDeletePhotoConfirm({ id: photo.id, imageUrl: photo.image_url, title: photo.title });
  };

  const handleDelete = async () => {
    if (!isAdmin || !deletePhotoConfirm) return;

    const { id, imageUrl } = deletePhotoConfirm;

    try {
      const fileName = imageUrl.split("/").pop();
      
      if (fileName) {
        await supabase.storage.from("gallery").remove([fileName]);
      }

      const photoToDelete = photos.find(p => p.id === id);
      
      const { error } = await supabase
        .from("gallery_photos")
        .delete()
        .eq("id", id);

      if (error) throw error;

      await logActivity("delete", "gallery_photo", id, photoToDelete?.title);
      
      toast({ title: "Foto berhasil dihapus!" });
      setDeletePhotoConfirm(null);
      fetchPhotos();
      fetchActivityLogs();
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

  // Toggle team management permission
  const toggleTeamPermission = async (profileId: string, currentValue: boolean) => {
    if (!isAdmin) return;

    try {
      const { error } = await supabase
        .from("profiles")
        .update({ can_manage_team: !currentValue })
        .eq("id", profileId);

      if (error) throw error;

      toast({ title: `Akses tim inti ${!currentValue ? 'diaktifkan' : 'dinonaktifkan'}!` });
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
    if (!memberName || !memberRole || (!isAdmin && !canManageTeam)) return;

    // Validate Instagram username
    if (memberInstagram && !validateInstagramUsername(memberInstagram.trim())) {
      toast({
        title: "Error",
        description: "Username Instagram tidak valid. Hanya boleh berisi huruf, angka, titik, dan underscore (max 30 karakter).",
        variant: "destructive",
      });
      return;
    }

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

      await logActivity("add", "team_member", undefined, memberName.trim());
      
      toast({ title: "Anggota inti berhasil ditambahkan!" });
      setMemberName("");
      setMemberRole("");
      setMemberInstagram("");
      clearMemberPhotoPreview();
      fetchTeamMembers();
      if (isAdmin) fetchActivityLogs();
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

  const confirmDeleteMember = (member: TeamMember) => {
    setDeleteMemberConfirm({ id: member.id, photoUrl: member.photo_url, name: member.name });
  };

  const handleDeleteMember = async () => {
    if ((!isAdmin && !canManageTeam) || !deleteMemberConfirm) return;

    const { id, photoUrl } = deleteMemberConfirm;

    try {
      const memberToDelete = teamMembers.find(m => m.id === id);
      
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

      await logActivity("delete", "team_member", id, memberToDelete?.name);
      
      toast({ title: "Anggota inti berhasil dihapus!" });
      setDeleteMemberConfirm(null);
      fetchTeamMembers();
      if (isAdmin) fetchActivityLogs();
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
    if (!editingMember || !editMemberName || !editMemberRole || (!isAdmin && !canManageTeam)) return;

    // Validate Instagram username
    if (editMemberInstagram && !validateInstagramUsername(editMemberInstagram.trim())) {
      toast({
        title: "Error",
        description: "Username Instagram tidak valid. Hanya boleh berisi huruf, angka, titik, dan underscore (max 30 karakter).",
        variant: "destructive",
      });
      return;
    }

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

      await logActivity("update", "team_member", editingMember.id, editMemberName.trim());
      
      toast({ title: "Anggota inti berhasil diperbarui!" });
      closeEditMemberDialog();
      fetchTeamMembers();
      if (isAdmin) fetchActivityLogs();
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

  // Drag and drop sensors
  const sensors = useSensors(
    useSensor(PointerSensor),
    useSensor(KeyboardSensor, {
      coordinateGetter: sortableKeyboardCoordinates,
    })
  );

  // Handle drag end for team members reordering
  const handleDragEnd = async (event: DragEndEvent) => {
    const { active, over } = event;

    if (over && active.id !== over.id) {
      const oldIndex = teamMembers.findIndex((m) => m.id === active.id);
      const newIndex = teamMembers.findIndex((m) => m.id === over.id);

      const reorderedMembers = arrayMove(teamMembers, oldIndex, newIndex);
      setTeamMembers(reorderedMembers);

      // Update display_order in database
      try {
        const updates = reorderedMembers.map((member, index) => ({
          id: member.id,
          name: member.name,
          role: member.role,
          instagram: member.instagram,
          photo_url: member.photo_url,
          display_order: index,
        }));

        for (const update of updates) {
          await supabase
            .from("team_members")
            .update({ display_order: update.display_order })
            .eq("id", update.id);
        }

        toast({ title: "Urutan anggota berhasil diperbarui!" });
      } catch (error: any) {
        toast({
          title: "Error",
          description: "Gagal menyimpan urutan",
          variant: "destructive",
        });
        fetchTeamMembers(); // Revert on error
      }
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
              <h1 className="text-xl font-bold text-foreground">
                {isAdmin ? "Admin Panel" : (canUpload || canManageTeam) ? "Panel Akses" : "Upload Panel"}
              </h1>
              {isAdmin ? (
                <span className="px-2 py-1 bg-accent/20 text-accent text-xs font-medium rounded-full">
                  Admin
                </span>
              ) : (canUpload || canManageTeam) ? (
                <span className="px-2 py-1 bg-primary/20 text-primary text-xs font-medium rounded-full">
                  {canUpload && canManageTeam ? "Uploader & Tim" : canUpload ? "Uploader" : "Tim Inti"}
                </span>
              ) : null}
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
        {!isAdmin && !canUpload && !canManageTeam ? (
          <div className="text-center py-16">
            <div className="w-20 h-20 bg-muted rounded-full flex items-center justify-center mx-auto mb-4">
              <ImageIcon size={32} className="text-muted-foreground" />
            </div>
            <h2 className="text-xl font-semibold text-foreground mb-2">
              Akses Terbatas
            </h2>
            <p className="text-muted-foreground mb-4">
              Anda tidak memiliki akses. Hubungi administrator untuk mendapatkan akses.
            </p>
            <p className="text-sm text-muted-foreground">
              Email: {user?.email}
            </p>
          </div>
        ) : isAdmin ? (
          <Tabs defaultValue="gallery" className="space-y-6">
            <TabsList className="grid w-full grid-cols-4 max-w-lg">
              <TabsTrigger value="gallery" className="flex items-center gap-2">
                <ImageIcon size={16} />
                <span className="hidden sm:inline">Galeri</span>
              </TabsTrigger>
              <TabsTrigger value="users" className="flex items-center gap-2">
                <UserCog size={16} />
                <span className="hidden sm:inline">Users</span>
              </TabsTrigger>
              <TabsTrigger value="team" className="flex items-center gap-2">
                <Users size={16} />
                <span className="hidden sm:inline">Tim Inti</span>
              </TabsTrigger>
              <TabsTrigger value="logs" className="flex items-center gap-2">
                <Activity size={16} />
                <span className="hidden sm:inline">Log</span>
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
                        <Label htmlFor="image" className="flex items-center gap-2">
                          Gambar
                          <span className="text-xs bg-accent/20 text-accent px-2 py-0.5 rounded-full flex items-center gap-1">
                            <Crop size={10} />
                            1:1
                          </span>
                        </Label>
                        {imagePreview ? (
                          <div className="relative">
                            <img
                              src={imagePreview}
                              alt="Preview"
                              className="w-full aspect-square object-cover rounded-lg border border-border"
                            />
                            <button
                              type="button"
                              onClick={clearImagePreview}
                              className="absolute top-2 right-2 w-6 h-6 bg-destructive text-destructive-foreground rounded-full flex items-center justify-center hover:bg-destructive/80"
                            >
                              <X size={14} />
                            </button>
                          </div>
                        ) : (
                          <Input
                            id="image"
                            type="file"
                            accept="image/jpeg,image/png,image/gif,image/webp"
                            onChange={(e) => handleImageFileChange(e.target.files?.[0] || null)}
                            required
                          />
                        )}
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
                                onClick={() => confirmDeletePhoto(photo)}
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
                  Daftar Users ({profiles.filter(p => p.email !== 'admin@gmail.com').length})
                </h2>
                {loadingProfiles ? (
                  <div className="text-center py-12">
                    <p className="text-muted-foreground">Loading...</p>
                  </div>
                ) : profiles.filter(p => p.email !== 'admin@gmail.com').length === 0 ? (
                  <div className="text-center py-12 bg-muted/30 rounded-xl">
                    <UserCog size={48} className="mx-auto text-muted-foreground mb-4" />
                    <p className="text-muted-foreground">Belum ada user terdaftar</p>
                  </div>
                ) : (
                  <div className="grid gap-3">
                    {profiles.filter(profile => profile.email !== 'admin@gmail.com').map((profile) => (
                      <div
                        key={profile.id}
                        className="glass-card bg-card p-4 rounded-xl"
                      >
                        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
                          {/* User Info */}
                          <div className="flex items-center gap-3">
                            <div className="w-10 h-10 rounded-full bg-primary/10 flex items-center justify-center">
                              <span className="text-sm font-semibold text-primary">
                                {profile.email?.charAt(0).toUpperCase() || '?'}
                              </span>
                            </div>
                            <div>
                              <p className="font-medium text-foreground">{profile.email || 'No email'}</p>
                              <p className="text-xs text-muted-foreground">
                                Bergabung {new Date(profile.created_at).toLocaleDateString('id-ID')}
                              </p>
                            </div>
                          </div>
                          
                          {/* Permissions */}
                          <div className="flex items-center gap-2 sm:gap-3">
                            <button
                              onClick={() => toggleUploadPermission(profile.id, profile.can_upload)}
                              className={`px-3 py-1.5 rounded-full text-xs font-medium transition-colors flex items-center gap-1.5 ${
                                profile.can_upload 
                                  ? 'bg-green-500/20 text-green-600 hover:bg-green-500/30' 
                                  : 'bg-muted text-muted-foreground hover:bg-muted/80'
                              }`}
                            >
                              <ImageIcon size={12} />
                              Galeri
                            </button>
                            <button
                              onClick={() => toggleTeamPermission(profile.id, profile.can_manage_team)}
                              className={`px-3 py-1.5 rounded-full text-xs font-medium transition-colors flex items-center gap-1.5 ${
                                profile.can_manage_team 
                                  ? 'bg-blue-500/20 text-blue-600 hover:bg-blue-500/30' 
                                  : 'bg-muted text-muted-foreground hover:bg-muted/80'
                              }`}
                            >
                              <Users size={12} />
                              Tim Inti
                            </button>
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
                        <Label htmlFor="memberPhoto" className="flex items-center gap-2">
                          Foto (opsional)
                          <span className="text-xs bg-accent/20 text-accent px-2 py-0.5 rounded-full flex items-center gap-1">
                            <Crop size={10} />
                            1:1
                          </span>
                        </Label>
                        {memberPhotoPreview ? (
                          <div className="relative">
                            <img
                              src={memberPhotoPreview}
                              alt="Preview"
                              className="w-full aspect-square object-cover rounded-lg border border-border"
                            />
                            <button
                              type="button"
                              onClick={clearMemberPhotoPreview}
                              className="absolute top-2 right-2 w-6 h-6 bg-destructive text-destructive-foreground rounded-full flex items-center justify-center hover:bg-destructive/80"
                            >
                              <X size={14} />
                            </button>
                          </div>
                        ) : (
                          <Input
                            id="memberPhoto"
                            type="file"
                            accept="image/jpeg,image/png,image/gif,image/webp"
                            onChange={(e) => handleMemberPhotoChange(e.target.files?.[0] || null)}
                          />
                        )}
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
                    <>
                      <p className="text-xs text-muted-foreground mb-3 flex items-center gap-1">
                        <GripVertical size={12} />
                        Drag untuk mengubah urutan
                      </p>
                      <DndContext
                        sensors={sensors}
                        collisionDetection={closestCenter}
                        onDragEnd={handleDragEnd}
                      >
                        <SortableContext
                          items={teamMembers.map((m) => m.id)}
                          strategy={rectSortingStrategy}
                        >
                          <div className="grid sm:grid-cols-2 gap-4">
                            {teamMembers.map((member) => (
                              <SortableTeamMember
                                key={member.id}
                                member={member}
                                onEdit={openEditMemberDialog}
                                onDelete={confirmDeleteMember}
                              />
                            ))}
                          </div>
                        </SortableContext>
                      </DndContext>
                    </>
                  )}
                </div>
              </div>
            </TabsContent>

            {/* Activity Logs Tab */}
            <TabsContent value="logs">
              <div className="space-y-4">
                <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
                  <h2 className="text-lg font-semibold text-foreground flex items-center gap-2">
                    <Activity size={20} />
                    Log Aktivitas
                  </h2>
                  
                  {/* Filters */}
                  <div className="flex flex-wrap items-center gap-2">
                    {/* Search */}
                    <div className="relative">
                      <Search size={14} className="absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground" />
                      <Input
                        placeholder="Cari user atau target..."
                        value={logSearch}
                        onChange={(e) => setLogSearch(e.target.value)}
                        className="pl-9 h-9 w-48"
                      />
                      {logSearch && (
                        <button
                          onClick={() => setLogSearch("")}
                          className="absolute right-2 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground"
                        >
                          <X size={14} />
                        </button>
                      )}
                    </div>
                    
                    {/* Action Filter */}
                    <div className="flex items-center gap-1">
                      {["all", "upload", "add", "update", "delete"].map((action) => (
                        <button
                          key={action}
                          onClick={() => setLogActionFilter(action)}
                          className={`px-2 py-1 rounded text-xs font-medium transition-colors ${
                            logActionFilter === action
                              ? action === "all" ? "bg-foreground text-background"
                              : action === "upload" ? "bg-green-500 text-white"
                              : action === "add" ? "bg-purple-500 text-white"
                              : action === "update" ? "bg-blue-500 text-white"
                              : "bg-red-500 text-white"
                              : "bg-muted text-muted-foreground hover:bg-muted/80"
                          }`}
                        >
                          {action === "all" ? "Semua" : action}
                        </button>
                      ))}
                    </div>
                    
                    {/* Type Filter */}
                    <div className="flex items-center gap-1">
                      {["all", "gallery_photo", "team_member"].map((type) => (
                        <button
                          key={type}
                          onClick={() => setLogTypeFilter(type)}
                          className={`px-2 py-1 rounded text-xs font-medium transition-colors ${
                            logTypeFilter === type
                              ? "bg-accent text-accent-foreground"
                              : "bg-muted text-muted-foreground hover:bg-muted/80"
                          }`}
                        >
                          {type === "all" ? "Semua Tipe" : type === "gallery_photo" ? "Galeri" : "Tim Inti"}
                        </button>
                      ))}
                    </div>
                  </div>
                </div>
                
                {loadingLogs ? (
                  <div className="text-center py-12">
                    <p className="text-muted-foreground">Loading...</p>
                  </div>
                ) : (() => {
                  const filteredLogs = activityLogs.filter((log) => {
                    const matchesSearch = logSearch === "" || 
                      log.user_email?.toLowerCase().includes(logSearch.toLowerCase()) ||
                      log.target_name?.toLowerCase().includes(logSearch.toLowerCase());
                    const matchesAction = logActionFilter === "all" || log.action === logActionFilter;
                    const matchesType = logTypeFilter === "all" || log.target_type === logTypeFilter;
                    return matchesSearch && matchesAction && matchesType;
                  });
                  
                  return filteredLogs.length === 0 ? (
                    <div className="text-center py-12 bg-muted/30 rounded-xl">
                      <Activity size={48} className="mx-auto text-muted-foreground mb-4" />
                      <p className="text-muted-foreground">
                        {activityLogs.length === 0 ? "Belum ada aktivitas tercatat" : "Tidak ada hasil yang cocok"}
                      </p>
                    </div>
                  ) : (
                    <>
                      <p className="text-sm text-muted-foreground">
                        Menampilkan {filteredLogs.length} dari {activityLogs.length} log
                      </p>
                      <div className="glass-card bg-card overflow-hidden rounded-xl">
                        <div className="overflow-x-auto">
                          <Table>
                            <TableHeader>
                              <TableRow>
                                <TableHead>Waktu</TableHead>
                                <TableHead>User</TableHead>
                                <TableHead>Aksi</TableHead>
                                <TableHead>Tipe</TableHead>
                                <TableHead>Target</TableHead>
                              </TableRow>
                            </TableHeader>
                            <TableBody>
                              {filteredLogs.map((log) => (
                                <TableRow key={log.id}>
                                  <TableCell className="whitespace-nowrap">
                                    {new Date(log.created_at).toLocaleString('id-ID', {
                                      day: '2-digit',
                                      month: 'short',
                                      year: 'numeric',
                                      hour: '2-digit',
                                      minute: '2-digit'
                                    })}
                                  </TableCell>
                                  <TableCell className="max-w-[200px] truncate">
                                    {log.user_email || 'Unknown'}
                                  </TableCell>
                                  <TableCell>
                                    <span className={`px-2 py-1 rounded-full text-xs font-medium ${
                                      log.action === 'upload' ? 'bg-green-500/20 text-green-600' :
                                      log.action === 'delete' ? 'bg-red-500/20 text-red-600' :
                                      log.action === 'update' ? 'bg-blue-500/20 text-blue-600' :
                                      log.action === 'add' ? 'bg-purple-500/20 text-purple-600' :
                                      'bg-muted text-muted-foreground'
                                    }`}>
                                      {log.action}
                                    </span>
                                  </TableCell>
                                  <TableCell>
                                    <span className="text-muted-foreground">
                                      {log.target_type === 'gallery_photo' ? 'Galeri' : 
                                       log.target_type === 'team_member' ? 'Tim Inti' : 
                                       log.target_type}
                                    </span>
                                  </TableCell>
                                  <TableCell className="max-w-[200px] truncate">
                                    {log.target_name || '-'}
                                  </TableCell>
                                </TableRow>
                              ))}
                            </TableBody>
                          </Table>
                        </div>
                      </div>
                    </>
                  );
                })()}
              </div>
            </TabsContent>
          </Tabs>
        ) : (
          /* User with canUpload or canManageTeam - show tabs based on permissions */
          <Tabs defaultValue={canUpload ? "gallery" : "team"} className="space-y-6">
            <TabsList className={`grid w-full max-w-md ${canUpload && canManageTeam ? 'grid-cols-2' : 'grid-cols-1'}`}>
              {canUpload && (
                <TabsTrigger value="gallery" className="flex items-center gap-2">
                  <ImageIcon size={16} />
                  Galeri
                </TabsTrigger>
              )}
              {canManageTeam && (
                <TabsTrigger value="team" className="flex items-center gap-2">
                  <Users size={16} />
                  Tim Inti
                </TabsTrigger>
              )}
            </TabsList>

            {/* Gallery Tab for Users */}
            {canUpload && (
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
                          <Label htmlFor="image" className="flex items-center gap-2">
                            Gambar
                            <span className="text-xs bg-accent/20 text-accent px-2 py-0.5 rounded-full flex items-center gap-1">
                              <Crop size={10} />
                              1:1
                            </span>
                          </Label>
                          {imagePreview ? (
                            <div className="relative">
                              <img
                                src={imagePreview}
                                alt="Preview"
                                className="w-full aspect-square object-cover rounded-lg border border-border"
                              />
                              <button
                                type="button"
                                onClick={clearImagePreview}
                                className="absolute top-2 right-2 w-6 h-6 bg-destructive text-destructive-foreground rounded-full flex items-center justify-center hover:bg-destructive/80"
                              >
                                <X size={14} />
                              </button>
                            </div>
                          ) : (
                            <Input
                              id="image"
                              type="file"
                              accept="image/jpeg,image/png,image/gif,image/webp"
                              onChange={(e) => handleImageFileChange(e.target.files?.[0] || null)}
                              required
                            />
                          )}
                          <p className="text-xs text-muted-foreground">Max 10MB (JPEG, PNG, GIF, WebP)</p>
                        </div>
                        <Button type="submit" className="w-full" disabled={uploading}>
                          {uploading ? "Uploading..." : "Upload Foto"}
                        </Button>
                      </form>
                    </div>
                  </div>

                  {/* Gallery List - View Only */}
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
                            className="glass-card bg-card overflow-hidden"
                          >
                            <div className="aspect-video">
                              <img
                                src={photo.image_url}
                                alt={photo.title}
                                className="w-full h-full object-cover"
                              />
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
            )}

            {/* Team Tab for Users */}
            {canManageTeam && (
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
                          <Label htmlFor="memberPhoto" className="flex items-center gap-2">
                            Foto (opsional)
                            <span className="text-xs bg-accent/20 text-accent px-2 py-0.5 rounded-full flex items-center gap-1">
                              <Crop size={10} />
                              1:1
                            </span>
                          </Label>
                          {memberPhotoPreview ? (
                            <div className="relative">
                              <img
                                src={memberPhotoPreview}
                                alt="Preview"
                                className="w-full aspect-square object-cover rounded-lg border border-border"
                              />
                              <button
                                type="button"
                                onClick={clearMemberPhotoPreview}
                                className="absolute top-2 right-2 w-6 h-6 bg-destructive text-destructive-foreground rounded-full flex items-center justify-center hover:bg-destructive/80"
                              >
                                <X size={14} />
                              </button>
                            </div>
                          ) : (
                            <Input
                              id="memberPhoto"
                              type="file"
                              accept="image/jpeg,image/png,image/gif,image/webp"
                              onChange={(e) => handleMemberPhotoChange(e.target.files?.[0] || null)}
                            />
                          )}
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
                      <>
                        <p className="text-xs text-muted-foreground mb-3 flex items-center gap-1">
                          <GripVertical size={12} />
                          Drag untuk mengubah urutan
                        </p>
                        <DndContext
                          sensors={sensors}
                          collisionDetection={closestCenter}
                          onDragEnd={handleDragEnd}
                        >
                          <SortableContext
                            items={teamMembers.map((m) => m.id)}
                            strategy={rectSortingStrategy}
                          >
                            <div className="grid sm:grid-cols-2 gap-4">
                              {teamMembers.map((member) => (
                                <SortableTeamMember
                                  key={member.id}
                                  member={member}
                                  onEdit={openEditMemberDialog}
                                  onDelete={confirmDeleteMember}
                                />
                              ))}
                            </div>
                          </SortableContext>
                        </DndContext>
                      </>
                    )}
                  </div>
                </div>
              </TabsContent>
            )}
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

      {/* Delete Photo Confirmation */}
      <AlertDialog open={!!deletePhotoConfirm} onOpenChange={(open) => !open && setDeletePhotoConfirm(null)}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Hapus Foto</AlertDialogTitle>
            <AlertDialogDescription>
              Apakah Anda yakin ingin menghapus foto "{deletePhotoConfirm?.title}"? Tindakan ini tidak dapat dibatalkan.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Batal</AlertDialogCancel>
            <AlertDialogAction onClick={handleDelete} className="bg-destructive text-destructive-foreground hover:bg-destructive/90">
              Hapus
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>

      {/* Delete Team Member Confirmation */}
      <AlertDialog open={!!deleteMemberConfirm} onOpenChange={(open) => !open && setDeleteMemberConfirm(null)}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Hapus Anggota Tim</AlertDialogTitle>
            <AlertDialogDescription>
              Apakah Anda yakin ingin menghapus "{deleteMemberConfirm?.name}" dari tim inti? Tindakan ini tidak dapat dibatalkan.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Batal</AlertDialogCancel>
            <AlertDialogAction onClick={handleDeleteMember} className="bg-destructive text-destructive-foreground hover:bg-destructive/90">
              Hapus
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>

      {/* Image Cropper */}
      {cropperImage && (
        <ImageCropper
          imageSrc={cropperImage}
          open={cropperOpen}
          onClose={handleCropperClose}
          onCropComplete={handleCropComplete}
          aspectRatio={1}
        />
      )}
    </div>
  );
};

export default Admin;