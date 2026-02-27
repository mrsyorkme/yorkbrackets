import { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import { fetchTournaments, Tournament } from "@/lib/tournament";
import { useAuth } from "@/hooks/useAuth";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Trophy, Shield, ChevronRight } from "lucide-react";

const Index = () => {
  const { isAdmin } = useAuth();
  const [tournaments, setTournaments] = useState<Tournament[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchTournaments().then(t => {
      setTournaments(t as Tournament[]);
      setLoading(false);
    });
  }, []);

  return (
    <div className="min-h-screen bg-background">
      {/* Hero */}
      <header className="border-b border-border bg-card">
        <div className="container mx-auto flex items-center justify-between px-4 py-6">
          <div className="flex items-center gap-3">
            <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-primary">
              <Trophy className="h-5 w-5 text-primary-foreground" />
            </div>
            <h1 className="font-display text-4xl tracking-wider">BRACKET ARENA</h1>
          </div>
          <div className="flex gap-2">
            {isAdmin ? (
              <Link to="/admin">
                <Button size="sm">
                  <Shield className="h-4 w-4 mr-1" /> Admin
                </Button>
              </Link>
            ) : (
              <Link to="/auth">
                <Button variant="outline" size="sm">Admin Login</Button>
              </Link>
            )}
          </div>
        </div>
      </header>

      <main className="container mx-auto py-10 px-4">
        <h2 className="font-display text-2xl tracking-wider mb-6">TOURNAMENTS</h2>

        {loading ? (
          <p className="text-muted-foreground animate-pulse">Loading tournaments…</p>
        ) : tournaments.length === 0 ? (
          <Card>
            <CardContent className="flex flex-col items-center justify-center py-16 text-center">
              <Trophy className="h-12 w-12 text-muted-foreground/30 mb-4" />
              <p className="text-muted-foreground">No tournaments yet. Check back soon!</p>
            </CardContent>
          </Card>
        ) : (
          <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-3">
            {tournaments.map(t => (
              <Link key={t.id} to={`/tournament/${t.id}`}>
                <Card className="group hover:border-primary transition-all hover:shadow-lg h-full">
                  <CardContent className="flex items-center gap-3 p-5">
                    <Trophy className="h-6 w-6 text-accent flex-shrink-0" />
                    <div className="flex-1 min-w-0">
                      <p className="font-semibold truncate">{t.name}</p>
                      <p className="text-xs text-muted-foreground">
                        {new Date(t.created_at).toLocaleDateString()}
                      </p>
                    </div>
                    <ChevronRight className="h-4 w-4 text-muted-foreground group-hover:text-primary transition-colors" />
                  </CardContent>
                </Card>
              </Link>
            ))}
          </div>
        )}
      </main>
    </div>
  );
};

export default Index;
