import { useState, useRef } from "react";
import { Match, Participant, setMatchWinner } from "@/lib/tournament";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { useToast } from "@/hooks/use-toast";
import { Trophy, Upload } from "lucide-react";

interface MatchResultDialogProps {
  match: Match | null;
  participants: Participant[];
  tournamentId: string;
  onClose: () => void;
  onSaved: () => void;
}

const MatchResultDialog = ({ match, participants, tournamentId, onClose, onSaved }: MatchResultDialogProps) => {
  const [winnerId, setWinnerId] = useState<string | null>(null);
  const [resultText, setResultText] = useState("");
  const [imageFile, setImageFile] = useState<File | null>(null);
  const [imagePreview, setImagePreview] = useState<string | null>(null);
  const [saving, setSaving] = useState(false);
  const fileRef = useRef<HTMLInputElement>(null);
  const { toast } = useToast();

  const participantMap = new Map(participants.map(p => [p.id, p]));
  const p1 = match?.participant1_id ? participantMap.get(match.participant1_id) : null;
  const p2 = match?.participant2_id ? participantMap.get(match.participant2_id) : null;

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      setImageFile(file);
      setImagePreview(URL.createObjectURL(file));
    }
  };

  const handleSave = async () => {
    if (!match || !winnerId) return;
    setSaving(true);
    try {
      await setMatchWinner(tournamentId, match.id, winnerId, resultText || undefined, imageFile || undefined);
      toast({ title: "Result saved!" });
      onSaved();
      onClose();
    } catch (err: any) {
      toast({ title: "Error", description: err.message, variant: "destructive" });
    } finally {
      setSaving(false);
    }
  };

  if (!match) return null;

  return (
    <Dialog open={!!match} onOpenChange={() => onClose()}>
      <DialogContent className="max-w-md">
        <DialogHeader>
          <DialogTitle className="font-display text-2xl tracking-wider">SET MATCH RESULT</DialogTitle>
        </DialogHeader>

        <div className="space-y-5">
          <div>
            <Label className="mb-2 block">Select Winner</Label>
            <div className="grid grid-cols-2 gap-3">
              {[p1, p2].map(p => p && (
                <button
                  key={p.id}
                  onClick={() => setWinnerId(p.id)}
                  className={`flex items-center justify-center gap-2 rounded-lg border-2 p-4 text-sm font-semibold transition-all ${
                    winnerId === p.id
                      ? "border-winner bg-winner/10 text-winner"
                      : "border-border hover:border-primary"
                  }`}
                >
                  {winnerId === p.id && <Trophy className="h-4 w-4" />}
                  {p.name}
                </button>
              ))}
            </div>
          </div>

          <div className="space-y-2">
            <Label htmlFor="result-text">Result Summary (optional)</Label>
            <Input
              id="result-text"
              placeholder="e.g. Won 3-1 in a close match"
              value={resultText}
              onChange={e => setResultText(e.target.value)}
            />
          </div>

          <div className="space-y-2">
            <Label>Photo (optional)</Label>
            <input ref={fileRef} type="file" accept="image/*" className="hidden" onChange={handleFileChange} />
            {imagePreview ? (
              <div className="relative rounded-lg overflow-hidden border border-border">
                <img src={imagePreview} alt="Preview" className="w-full h-40 object-cover" />
                <Button
                  size="sm"
                  variant="secondary"
                  className="absolute bottom-2 right-2"
                  onClick={() => fileRef.current?.click()}
                >
                  Change
                </Button>
              </div>
            ) : (
              <button
                onClick={() => fileRef.current?.click()}
                className="flex w-full items-center justify-center gap-2 rounded-lg border-2 border-dashed border-border p-8 text-sm text-muted-foreground hover:border-primary hover:text-primary transition-colors"
              >
                <Upload className="h-5 w-5" />
                Upload a photo
              </button>
            )}
          </div>

          <Button onClick={handleSave} disabled={!winnerId || saving} className="w-full">
            {saving ? "Saving…" : "Save Result"}
          </Button>
        </div>
      </DialogContent>
    </Dialog>
  );
};

export default MatchResultDialog;
