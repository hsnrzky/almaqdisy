import { useSortable } from "@dnd-kit/sortable";
import { CSS } from "@dnd-kit/utilities";
import { Pencil, Trash2, Instagram, GripVertical } from "lucide-react";

interface TeamMember {
  id: string;
  name: string;
  role: string;
  instagram: string | null;
  photo_url: string | null;
  display_order: number;
}

interface SortableTeamMemberProps {
  member: TeamMember;
  onEdit: (member: TeamMember) => void;
  onDelete: (member: TeamMember) => void;
}

export const SortableTeamMember = ({
  member,
  onEdit,
  onDelete,
}: SortableTeamMemberProps) => {
  const {
    attributes,
    listeners,
    setNodeRef,
    transform,
    transition,
    isDragging,
  } = useSortable({ id: member.id });

  const style = {
    transform: CSS.Transform.toString(transform),
    transition,
    opacity: isDragging ? 0.5 : 1,
    zIndex: isDragging ? 50 : undefined,
  };

  return (
    <div
      ref={setNodeRef}
      style={style}
      className={`group glass-card bg-card overflow-hidden ${isDragging ? "shadow-xl" : ""}`}
    >
      <div className="aspect-square relative bg-muted">
        {member.photo_url ? (
          <img
            src={member.photo_url}
            alt={member.name}
            className="w-full h-full object-cover"
          />
        ) : (
          <div className="w-full h-full flex items-center justify-center text-4xl font-bold text-muted-foreground">
            {member.name.charAt(0).toUpperCase()}
          </div>
        )}
        {/* Drag handle */}
        <div
          {...attributes}
          {...listeners}
          className="absolute top-2 left-2 w-8 h-8 bg-background/80 backdrop-blur-sm text-foreground rounded-full flex items-center justify-center cursor-grab active:cursor-grabbing opacity-0 group-hover:opacity-100 transition-opacity"
        >
          <GripVertical size={16} />
        </div>
        {/* Actions */}
        <div className="absolute top-2 right-2 flex gap-2 opacity-0 group-hover:opacity-100 transition-opacity">
          <button
            onClick={() => onEdit(member)}
            className="w-8 h-8 bg-accent text-accent-foreground rounded-full flex items-center justify-center"
          >
            <Pencil size={16} />
          </button>
          <button
            onClick={() => onDelete(member)}
            className="w-8 h-8 bg-destructive text-destructive-foreground rounded-full flex items-center justify-center"
          >
            <Trash2 size={16} />
          </button>
        </div>
      </div>
      <div className="p-4">
        <h3 className="font-semibold text-foreground">{member.name}</h3>
        <p className="text-sm text-muted-foreground">{member.role}</p>
        {member.instagram && /^[a-zA-Z0-9._]{1,30}$/.test(member.instagram) && (
          <a
            href={`https://instagram.com/${encodeURIComponent(member.instagram)}`}
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
  );
};
