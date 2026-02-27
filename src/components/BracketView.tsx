import { Match, Participant } from "@/lib/tournament";
import { Trophy, Camera } from "lucide-react";

interface BracketViewProps {
  matches: Match[];
  participants: Participant[];
  isAdmin?: boolean;
  onSelectMatch?: (match: Match) => void;
}

const BracketView = ({ matches, participants, isAdmin, onSelectMatch }: BracketViewProps) => {
  const participantMap = new Map(participants.map(p => [p.id, p]));
  const rounds = [...new Set(matches.map(m => m.round))].sort((a, b) => a - b);
  const totalRounds = rounds.length;

  const getName = (id: string | null) => {
    if (!id) return null;
    return participantMap.get(id)?.name ?? "TBD";
  };

  return (
    <div className="flex gap-4 overflow-x-auto pb-6 px-2">
      {rounds.map((round, roundIndex) => {
        const roundMatches = matches.filter(m => m.round === round).sort((a, b) => a.match_number - b.match_number);
        const isFinal = round === totalRounds;
        const roundLabel = isFinal ? "FINAL" : round === totalRounds - 1 ? "SEMIS" : `ROUND ${round}`;

        return (
          <div key={round} className="flex flex-col flex-shrink-0" style={{ minWidth: 220 }}>
            <h3 className="font-display text-lg tracking-wider text-muted-foreground mb-3 text-center">
              {roundLabel}
            </h3>
            <div
              className="flex flex-col justify-around flex-1 gap-4"
              style={{ paddingTop: roundIndex > 0 ? `${Math.pow(2, roundIndex - 1) * 24}px` : 0 }}
            >
              {roundMatches.map(match => {
                const p1Name = getName(match.participant1_id);
                const p2Name = getName(match.participant2_id);
                const hasWinner = !!match.winner_id;
                const isP1Winner = match.winner_id === match.participant1_id;
                const isP2Winner = match.winner_id === match.participant2_id;
                const canEdit = isAdmin && p1Name && p2Name && !hasWinner;

                return (
                  <div
                    key={match.id}
                    className={`rounded-lg border overflow-hidden transition-all ${
                      canEdit ? "cursor-pointer hover:border-primary hover:shadow-md" : ""
                    } ${hasWinner ? "border-border" : "border-border"}`}
                    onClick={() => canEdit && onSelectMatch?.(match)}
                    style={{ marginBottom: roundIndex > 0 ? `${Math.pow(2, roundIndex) * 16}px` : 0 }}
                  >
                    {/* Match result image */}
                    {match.result_image_url && (
                      <div className="w-full h-28 overflow-hidden">
                        <img
                          src={match.result_image_url}
                          alt="Match result"
                          className="w-full h-full object-cover"
                        />
                      </div>
                    )}

                    {/* Participant 1 */}
                    <div
                      className={`flex items-center gap-2 px-3 py-2.5 text-sm font-medium transition-colors ${
                        isP1Winner
                          ? "bg-winner/10 text-winner font-bold"
                          : hasWinner && !isP1Winner
                          ? "text-muted-foreground line-through opacity-60"
                          : "text-foreground"
                      }`}
                    >
                      {isP1Winner && <Trophy className="h-3.5 w-3.5 text-winner flex-shrink-0" />}
                      <span className="truncate">{p1Name ?? "—"}</span>
                    </div>

                    <div className="h-px bg-border" />

                    {/* Participant 2 */}
                    <div
                      className={`flex items-center gap-2 px-3 py-2.5 text-sm font-medium transition-colors ${
                        isP2Winner
                          ? "bg-winner/10 text-winner font-bold"
                          : hasWinner && !isP2Winner
                          ? "text-muted-foreground line-through opacity-60"
                          : "text-foreground"
                      }`}
                    >
                      {isP2Winner && <Trophy className="h-3.5 w-3.5 text-winner flex-shrink-0" />}
                      <span className="truncate">{p2Name ?? "—"}</span>
                    </div>

                    {/* Result text */}
                    {match.result_text && match.result_text !== "Bye" && (
                      <div className="border-t border-border bg-muted/50 px-3 py-1.5">
                        <p className="text-xs text-muted-foreground">{match.result_text}</p>
                      </div>
                    )}

                    {/* Admin hint */}
                    {canEdit && (
                      <div className="border-t border-border bg-primary/5 px-3 py-1.5 flex items-center gap-1.5 text-xs text-primary">
                        <Camera className="h-3 w-3" />
                        Click to set winner
                      </div>
                    )}
                  </div>
                );
              })}
            </div>
          </div>
        );
      })}
    </div>
  );
};

export default BracketView;
