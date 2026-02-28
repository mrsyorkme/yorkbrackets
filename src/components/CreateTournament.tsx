import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { createTournament } from "@/lib/tournament";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { useToast } from "@/hooks/use-toast";
import { Shuffle } from "lucide-react";

const CreateTournament = () => {
  const [name, setName] = useState("");
  const [namesText, setNamesText] = useState("");
  const [creating, setCreating] = useState(false);
  const navigate = useNavigate();
  const { toast } = useToast();

  const handleCreate = async (e: React.FormEvent) => {
    e.preventDefault();
    const lines = namesText.split("\n").map(n => n.trim()).filter(Boolean);
    if (lines.length < 2) {
      toast({ title: "Need at least 2 participants", variant: "destructive" });
      return;
    }
    // Parse "Name | Description" format
    const fighters = lines.map(line => {
      const [namePart, ...descParts] = line.split("|");
      return { name: namePart.trim(), description: descParts.join("|").trim() || undefined };
    });
    setCreating(true);
    try {
      const t = await createTournament(name, fighters);
      toast({ title: "Tournament created!" });
      navigate(`/tournament/${t.id}`);
    } catch (err: any) {
      toast({ title: "Error", description: err.message, variant: "destructive" });
    } finally {
      setCreating(false);
    }
  };

  return (
    <Card className="max-w-lg mx-auto">
      <CardHeader>
        <CardTitle className="font-display text-3xl tracking-wider flex items-center gap-3">
          <Shuffle className="h-7 w-7 text-primary" />
          NEW TOURNAMENT
        </CardTitle>
      </CardHeader>
      <CardContent>
        <form onSubmit={handleCreate} className="space-y-5">
          <div className="space-y-2">
            <Label htmlFor="name">Tournament Name</Label>
            <Input id="name" placeholder="e.g. March Madness 2026" value={name} onChange={e => setName(e.target.value)} required />
          </div>
          <div className="space-y-2">
            <Label htmlFor="names">Participants (one per line)</Label>
            <Textarea
              id="names"
              placeholder={"Alice\nBob\nCharlie\nDiana"}
              rows={8}
              value={namesText}
              onChange={e => setNamesText(e.target.value)}
              required
            />
            <p className="text-xs text-muted-foreground">
              Names will be randomized into bracket positions automatically.
            </p>
          </div>
          <Button type="submit" className="w-full" disabled={creating}>
            {creating ? "Creating…" : "Create & Randomize Bracket"}
          </Button>
        </form>
      </CardContent>
    </Card>
  );
};

export default CreateTournament;
