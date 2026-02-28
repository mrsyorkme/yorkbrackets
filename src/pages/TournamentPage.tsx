import { useEffect, useState, useCallback, useRef } from "react";
import { useParams, Link } from "react-router-dom";
import { fetchTournament, Match, Participant, Tournament } from "@/lib/tournament";
import BracketView from "@/components/BracketView";
import MatchResultDialog from "@/components/MatchResultDialog";
import CoverImageUpload from "@/components/CoverImageUpload";
import { useAuth } from "@/hooks/useAuth";
import { Button } from "@/components/ui/button";
import { ArrowLeft, Trophy, Shield, Printer } from "lucide-react";

const TournamentPage = () => {
  const { id } = useParams<{ id: string }>();
  const { isAdmin } = useAuth();
  const [tournament, setTournament] = useState<Tournament | null>(null);
  const [participants, setParticipants] = useState<Participant[]>([]);
  const [matches, setMatches] = useState<Match[]>([]);
  const [selectedMatch, setSelectedMatch] = useState<Match | null>(null);
  const [loading, setLoading] = useState(true);

  const load = useCallback(async () => {
    if (!id) return;
    const data = await fetchTournament(id);
    setTournament(data.tournament as Tournament | null);
    setParticipants(data.participants as Participant[]);
    setMatches(data.matches as Match[]);
    setLoading(false);
  }, [id]);

  useEffect(() => { load(); }, [load]);

  if (loading) {
    return (
      <div className="flex min-h-screen items-center justify-center">
        <div className="animate-pulse text-muted-foreground">Loading bracket…</div>
      </div>
    );
  }

  if (!tournament) {
    return (
      <div className="flex min-h-screen flex-col items-center justify-center gap-4">
        <p className="text-muted-foreground">Tournament not found.</p>
        <Link to="/"><Button variant="outline">Go Home</Button></Link>
      </div>
    );
  }

  // Check if there's a champion
  const totalRounds = Math.max(...matches.map(m => m.round));
  const finalMatch = matches.find(m => m.round === totalRounds);
  const champion = finalMatch?.winner_id ? participants.find(p => p.id === finalMatch.winner_id) : null;

  return (
    <div className="min-h-screen bg-background">
      {/* Header */}
      <header className="border-b border-border bg-card">
        <div className="container mx-auto flex items-center justify-between px-4 py-4">
          <div className="flex items-center gap-4">
            <Link to="/" className="print:hidden">
              <Button variant="ghost" size="sm">
                <ArrowLeft className="h-4 w-4 mr-1" /> Back
              </Button>
            </Link>
            <div>
              <h1 className="font-display text-3xl tracking-wider">{tournament.name}</h1>
              <p className="text-sm text-muted-foreground print:hidden">
                {participants.length} participants · {matches.filter(m => m.winner_id).length}/{matches.length} matches played
              </p>
            </div>
          </div>
          <div className="flex items-center gap-3">
            <Button variant="outline" size="sm" className="print:hidden" onClick={() => window.print()}>
              <Printer className="h-4 w-4 mr-1" /> Print Bracket
            </Button>
            {isAdmin && (
              <div className="flex items-center gap-2 text-sm text-primary print:hidden">
                <Shield className="h-4 w-4" />
                Admin Mode
              </div>
            )}
          </div>
        </div>
      </header>

      {/* Champion banner */}
      {champion && (
        <div className="bg-accent/20 border-b border-accent">
          <div className="container mx-auto flex items-center justify-center gap-3 px-4 py-4">
            <Trophy className="h-6 w-6 text-accent" />
            <span className="font-display text-2xl tracking-wider text-accent-foreground">
              CHAMPION: {champion.name}
            </span>
            <Trophy className="h-6 w-6 text-accent" />
          </div>
        </div>
      )}

      {/* Bracket */}
      <main className="container mx-auto py-8 px-4">
        <BracketView
          matches={matches}
          participants={participants}
          isAdmin={isAdmin}
          onSelectMatch={setSelectedMatch}
        />
      </main>

      {/* Match result dialog */}
      {isAdmin && (
        <MatchResultDialog
          match={selectedMatch}
          participants={participants}
          tournamentId={tournament.id}
          onClose={() => setSelectedMatch(null)}
          onSaved={load}
        />
      )}
    </div>
  );
};

export default TournamentPage;
