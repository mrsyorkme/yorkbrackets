import { supabase } from "@/integrations/supabase/client";

export interface Tournament {
  id: string;
  name: string;
  created_at: string;
  status: string;
  cover_image_url: string | null;
}

export interface Participant {
  id: string;
  tournament_id: string;
  name: string;
  seed: number;
  description: string | null;
}

export interface Match {
  id: string;
  tournament_id: string;
  round: number;
  match_number: number;
  participant1_id: string | null;
  participant2_id: string | null;
  winner_id: string | null;
  result_text: string | null;
  result_image_url: string | null;
}

function shuffle<T>(arr: T[]): T[] {
  const a = [...arr];
  for (let i = a.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [a[i], a[j]] = [a[j], a[i]];
  }
  return a;
}

function nextPowerOfTwo(n: number) {
  let p = 1;
  while (p < n) p *= 2;
  return p;
}

export async function createTournament(name: string, fighters: { name: string; description?: string }[]) {
  const { data: tournament, error: tErr } = await supabase
    .from("tournaments")
    .insert({ name })
    .select()
    .single();
  if (tErr || !tournament) throw tErr;

  const shuffled = shuffle(names);
  const bracketSize = nextPowerOfTwo(shuffled.length);

  const participants = shuffled.map((n, i) => ({
    tournament_id: tournament.id,
    name: n,
    seed: i + 1,
  }));

  const { data: parts, error: pErr } = await supabase
    .from("participants")
    .insert(participants)
    .select();
  if (pErr || !parts) throw pErr;

  // Create bracket matches
  const totalRounds = Math.log2(bracketSize);
  const matches: { tournament_id: string; round: number; match_number: number; participant1_id: string | null; participant2_id: string | null }[] = [];

  // Round 1
  for (let m = 0; m < bracketSize / 2; m++) {
    const p1 = parts[m * 2] ?? null;
    const p2 = parts[m * 2 + 1] ?? null;
    matches.push({
      tournament_id: tournament.id,
      round: 1,
      match_number: m + 1,
      participant1_id: p1?.id ?? null,
      participant2_id: p2?.id ?? null,
    });
  }

  // Later rounds (empty)
  for (let r = 2; r <= totalRounds; r++) {
    const matchesInRound = bracketSize / Math.pow(2, r);
    for (let m = 0; m < matchesInRound; m++) {
      matches.push({
        tournament_id: tournament.id,
        round: r,
        match_number: m + 1,
        participant1_id: null,
        participant2_id: null,
      });
    }
  }

  const { error: mErr } = await supabase.from("matches").insert(matches);
  if (mErr) throw mErr;

  // Auto-advance byes in round 1
  const byeMatches = matches.filter(
    m => m.round === 1 && (m.participant1_id === null || m.participant2_id === null) && (m.participant1_id !== null || m.participant2_id !== null)
  );

  for (const bm of byeMatches) {
    const winnerId = bm.participant1_id ?? bm.participant2_id;
    // Find the match in DB
    const { data: dbMatch } = await supabase
      .from("matches")
      .select("id")
      .eq("tournament_id", tournament.id)
      .eq("round", 1)
      .eq("match_number", bm.match_number)
      .single();
    if (dbMatch) {
      await setMatchWinner(tournament.id, dbMatch.id, winnerId!, "Bye");
    }
  }

  return tournament;
}

export async function setMatchWinner(tournamentId: string, matchId: string, winnerId: string, resultText?: string, imageFile?: File) {
  let imageUrl: string | null = null;

  if (imageFile) {
    const ext = imageFile.name.split(".").pop();
    const path = `${tournamentId}/${matchId}.${ext}`;
    const { error: upErr } = await supabase.storage.from("match-images").upload(path, imageFile, { upsert: true });
    if (upErr) throw upErr;
    const { data } = supabase.storage.from("match-images").getPublicUrl(path);
    imageUrl = data.publicUrl;
  }

  const updates: Record<string, unknown> = { winner_id: winnerId };
  if (resultText !== undefined) updates.result_text = resultText;
  if (imageUrl) updates.result_image_url = imageUrl;

  const { error } = await supabase.from("matches").update(updates).eq("id", matchId);
  if (error) throw error;

  // Advance winner to next round
  const { data: match } = await supabase.from("matches").select("*").eq("id", matchId).single();
  if (!match) return;

  const nextRound = match.round + 1;
  const nextMatchNumber = Math.ceil(match.match_number / 2);

  const { data: nextMatch } = await supabase
    .from("matches")
    .select("*")
    .eq("tournament_id", tournamentId)
    .eq("round", nextRound)
    .eq("match_number", nextMatchNumber)
    .single();

  if (nextMatch) {
    const isTopSlot = match.match_number % 2 === 1;
    const update = isTopSlot ? { participant1_id: winnerId } : { participant2_id: winnerId };
    await supabase.from("matches").update(update).eq("id", nextMatch.id);
  }
}

export async function fetchTournament(id: string) {
  const { data: tournament } = await supabase.from("tournaments").select("*").eq("id", id).single();
  const { data: participants } = await supabase.from("participants").select("*").eq("tournament_id", id).order("seed");
  const { data: matches } = await supabase.from("matches").select("*").eq("tournament_id", id).order("round").order("match_number");
  return { tournament, participants: participants ?? [], matches: matches ?? [] };
}

export async function fetchTournaments() {
  const { data } = await supabase.from("tournaments").select("*").order("created_at", { ascending: false });
  return data ?? [];
}

export async function deleteTournament(id: string) {
  const { error } = await supabase.from("tournaments").delete().eq("id", id);
  if (error) throw error;
}
