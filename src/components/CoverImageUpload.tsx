import { useState, useRef } from "react";
import { supabase } from "@/integrations/supabase/client";
import { Button } from "@/components/ui/button";
import { useToast } from "@/hooks/use-toast";
import { ImagePlus } from "lucide-react";

interface CoverImageUploadProps {
  tournamentId: string;
  currentUrl: string | null;
  onUploaded: () => void;
}

const CoverImageUpload = ({ tournamentId, currentUrl, onUploaded }: CoverImageUploadProps) => {
  const [uploading, setUploading] = useState(false);
  const fileRef = useRef<HTMLInputElement>(null);
  const { toast } = useToast();

  const handleUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    setUploading(true);
    try {
      const ext = file.name.split(".").pop();
      const path = `${tournamentId}/cover.${ext}`;
      const { error: upErr } = await supabase.storage
        .from("match-images")
        .upload(path, file, { upsert: true });
      if (upErr) throw upErr;

      const { data } = supabase.storage.from("match-images").getPublicUrl(path);

      const { error: dbErr } = await supabase
        .from("tournaments")
        .update({ cover_image_url: data.publicUrl })
        .eq("id", tournamentId);
      if (dbErr) throw dbErr;

      toast({ title: "Cover image uploaded!" });
      onUploaded();
    } catch (err: any) {
      toast({ title: "Error", description: err.message, variant: "destructive" });
    } finally {
      setUploading(false);
    }
  };

  return (
    <>
      <input ref={fileRef} type="file" accept="image/*" className="hidden" onChange={handleUpload} />
      <Button
        variant="outline"
        size="sm"
        onClick={() => fileRef.current?.click()}
        disabled={uploading}
      >
        <ImagePlus className="h-4 w-4 mr-1" />
        {uploading ? "Uploading…" : currentUrl ? "Change Cover Image" : "Add Cover Image"}
      </Button>
    </>
  );
};

export default CoverImageUpload;
