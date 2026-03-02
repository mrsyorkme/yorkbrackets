import { useState } from "react";
import { Match, Participant } from "@/lib/tournament";
import { Trophy, Camera, Info } from "lucide-react";
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";
import { Dialog, DialogContent } from "@/components/ui/dialog";

interface BracketViewProps {
  matches: Match[];
  participants: Participant[];
  isAdmin?: boolean;
  onSelectMatch?: (match: Match) => void;
}

const BracketView = ({ matches, participants, isAdmin, onSelectMatch }: BracketViewProps) => {
  const [lightboxUrl, setLightboxUrl] = useState<string | null>(null);
  const participantMap = new Map(participants.map(p => [p.id, p]));
  const rounds = [...new Set(matches.map(m => m.round))].sort((a, b) => a - b);
  const totalRounds = rounds.length;

  const getParticipant = (id: string | null) => {
    if (!id) return null;
    return participantMap.get(id) ?? null;
  };

  const ParticipantName = ({ participantId, isWinner, isLoser }: { participantId: string | null; isWinner: boolean; isLoser: boolean }) => {
    const participant = getParticipant(participantId);
    if (!participant) return <span className="truncate">—</span>;

    const nameEl = <span className="truncate">{participant.name}</span>;

    if (!participant.description) {
      return (
        <>
          {isWinner && <Trophy className="h-3.5 w-3.5 text-winner flex-shrink-0" />}
          {nameEl}
        </>
      );
    }

    return (
      <>
        {isWinner && <Trophy className="h-3.5 w-3.5 text-winner flex-shrink-0" />}
        <Popover>
          <PopoverTrigger asChild>
            <button
              className="flex items-center gap-1.5 truncate print:pointer-events-none"
              onClick={(e) => e.stopPropagation()}
            >
              {nameEl}
              <Info className="h-3 w-3 text-muted-foreground flex-shrink-0 print:hidden" />
            </button>
          </PopoverTrigger>
          <PopoverContent className="w-64 print:hidden" side="right">
            <div className="space-y-1.5">
              <p className="font-medium text-sm">{participant.name}</p>
              <p className="text-xs text-muted-foreground">{participant.description}</p>
            </div>
          </PopoverContent>
        </Popover>
      </>
    );
  };

  return (
    <div className="flex gap-4 overflow-x-auto pb-6 px-2">
      {rounds.map((round, roundIndex) => {
        const roundMatches = matches.filter(m => m.round === round && (m.participant1_id || m.participant2_id)).sort((a, b) => a.match_number - b.match_number);
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
                const hasP1 = !!match.participant1_id;
                const hasP2 = !!match.participant2_id;
                const hasWinner = !!match.winner_id;
                const isP1Winner = match.winner_id === match.participant1_id;
                const isP2Winner = match.winner_id === match.participant2_id;
                const canEdit = isAdmin && hasP1 && hasP2 && !hasWinner;

                return (
                  <div
                    key={match.id}
                    className={`rounded-lg border overflow-hidden transition-all ${
                      canEdit ? "cursor-pointer hover:border-primary hover:shadow-md" : ""
                    } ${hasWinner ? "border-border" : "border-border"}`}
                    onClick={() => canEdit && onSelectMatch?.(match)}
                    style={{ marginBottom: roundIndex > 0 ? `${Math.pow(2, roundIndex) * 16}px` : 0 }}
                  >
                    {/* Match result image thumbnail */}
                    {match.result_image_url && (
                      <button
                        className="w-full h-16 overflow-hidden block print:h-28"
                        onClick={(e) => { e.stopPropagation(); setLightboxUrl(match.result_image_url); }}
                      >
                        <img
                          src={match.result_image_url}
                          alt="Match result"
                          className="w-full h-full object-cover"
                        />
                      </button>
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
                      <ParticipantName participantId={match.participant1_id} isWinner={isP1Winner} isLoser={hasWinner && !isP1Winner} />
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
                      <ParticipantName participantId={match.participant2_id} isWinner={isP2Winner} isLoser={hasWinner && !isP2Winner} />
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

    {/* Image lightbox */}
    <Dialog open={!!lightboxUrl} onOpenChange={() => setLightboxUrl(null)}>
      <DialogContent className="max-w-3xl p-2 print:hidden">
        <img src={lightboxUrl ?? ""} alt="Match result" className="w-full h-auto rounded" />
      </DialogContent>
    </Dialog>
    </>
  );
};

export default BracketView;
