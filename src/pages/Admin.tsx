import { useEffect, useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { supabase } from "@/integrations/supabase/client";
import { fetchTournaments, deleteTournament, Tournament } from "@/lib/tournament";
import { useAuth } from "@/hooks/useAuth";
import CreateTournament from "@/components/CreateTournament";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { useToast } from "@/hooks/use-toast";
import { LogOut, Trophy, Trash2, Plus, ChevronRight } from "lucide-react";

const Admin = () => {
  const { session, loading: authLoading } = useAuth();
  const navigate = useNavigate();
  const [tournaments, setTournaments] = useState<Tournament[]>([]);
  const [showCreate, setShowCreate] = useState(false);
  const [loading, setLoading] = useState(true);
  const { toast } = useToast();

  useEffect(() => {
    if (!authLoading && !session) navigate("/auth");
  }, [session, authLoading, navigate]);

  useEffect(() => {
    fetchTournaments().then(t => {
      setTournaments(t as Tournament[]);
      setLoading(false);
    });
  }, []);

  const handleLogout = async () => {
    await supabase.auth.signOut();
    navigate("/");
  };

  const handleDelete = async (id: string) => {
    if (!confirm("Delete this tournament?")) return;
    try {
      await deleteTournament(id);
      setTournaments(prev => prev.filter(t => t.id !== id));
      toast({ title: "Tournament deleted" });
    } catch (err: any) {
      toast({ title: "Error", description: err.message, variant: "destructive" });
    }
  };

  if (authLoading) return null;

  return (
    <div className="min-h-screen bg-background">
      <header className="border-b border-border bg-card">
        <div className="container mx-auto flex items-center justify-between px-4 py-4">
          <div className="flex items-center gap-3">
            <Trophy className="h-6 w-6 text-primary" />
            <h1 className="font-display text-3xl tracking-wider">ADMIN DASHBOARD</h1>
          </div>
          <div className="flex items-center gap-2">
            <Link to="/">
              <Button variant="ghost" size="sm">Public View</Button>
            </Link>
            <Button variant="outline" size="sm" onClick={handleLogout}>
              <LogOut className="h-4 w-4 mr-1" /> Sign Out
            </Button>
          </div>
        </div>
      </header>

      <main className="container mx-auto py-8 px-4">
        {showCreate ? (
          <div>
            <Button variant="ghost" className="mb-4" onClick={() => setShowCreate(false)}>
              ← Back to list
            </Button>
            <CreateTournament />
          </div>
        ) : (
          <div>
            <div className="flex items-center justify-between mb-6">
              <h2 className="font-display text-2xl tracking-wider">YOUR TOURNAMENTS</h2>
              <Button onClick={() => setShowCreate(true)}>
                <Plus className="h-4 w-4 mr-1" /> New Tournament
              </Button>
            </div>

            {loading ? (
              <p className="text-muted-foreground animate-pulse">Loading…</p>
            ) : tournaments.length === 0 ? (
              <Card>
                <CardContent className="flex flex-col items-center justify-center py-16 text-center">
                  <Trophy className="h-12 w-12 text-muted-foreground/30 mb-4" />
                  <p className="text-muted-foreground mb-4">No tournaments yet. Create your first one!</p>
                  <Button onClick={() => setShowCreate(true)}>
                    <Plus className="h-4 w-4 mr-1" /> Create Tournament
                  </Button>
                </CardContent>
              </Card>
            ) : (
              <div className="grid gap-3">
                {tournaments.map(t => (
                  <Card key={t.id} className="group hover:border-primary transition-colors">
                    <CardContent className="flex items-center justify-between p-4">
                      <Link to={`/tournament/${t.id}`} className="flex-1 flex items-center gap-3">
                        <Trophy className="h-5 w-5 text-primary flex-shrink-0" />
                        <div>
                          <p className="font-semibold">{t.name}</p>
                          <p className="text-xs text-muted-foreground">
                            {new Date(t.created_at).toLocaleDateString()} · {t.status}
                          </p>
                        </div>
                        <ChevronRight className="h-4 w-4 text-muted-foreground ml-auto group-hover:text-primary transition-colors" />
                      </Link>
                      <Button
                        variant="ghost"
                        size="sm"
                        className="ml-2 text-destructive hover:text-destructive"
                        onClick={(e) => { e.preventDefault(); handleDelete(t.id); }}
                      >
                        <Trash2 className="h-4 w-4" />
                      </Button>
                    </CardContent>
                  </Card>
                ))}
              </div>
            )}
          </div>
        )}
      </main>
    </div>
  );
};

export default Admin;
