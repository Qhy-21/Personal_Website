import { ref, computed } from 'vue'
import { getFlatSongList } from '../data/xusongSongs/index.js'
import { shuffle } from '../utils/shuffle.js'

const STORAGE_KEY = 'xusong-bot-state'
const flatSongList = getFlatSongList()
const songIds = new Set(flatSongList.map(song => song.id))

function validSong(song) {
  return song && songIds.has(song.id) && typeof song.title === 'string' && typeof song.album === 'string'
}

function validMatch(match, allowSolo = false) {
  return match && validSong(match.songA) && (validSong(match.songB) || (allowSolo && match.songB === null)) &&
    [null, 'A', 'B', 'tie'].includes(match.winner) &&
    (match.songB !== null || match.winner === 'A')
}

function validState(state) {
  if (!state || !['voting', 'complete'].includes(state.phase) || !Number.isInteger(state.round) || state.round < 1 ||
    !Number.isInteger(state.currentMatchIdx) || state.currentMatchIdx < 0 ||
    !Array.isArray(state.roundMatches) || !state.roundMatches.every(match => validMatch(match)) ||
    state.currentMatchIdx > state.roundMatches.length ||
    !Array.isArray(state.roundByes) || !state.roundByes.every(validSong) ||
    !Array.isArray(state.skippedQueue) || !state.skippedQueue.every(match => validMatch(match) && match.winner === null) ||
    !Array.isArray(state.allRounds) || !state.allRounds.every(item => item && Number.isInteger(item.round) && item.round > 0 &&
      Array.isArray(item.matches) && item.matches.every(match => validMatch(match, true) && match.winner !== null))) return false
  if (state.phase === 'complete') {
    return state.allRounds.length > 0 && state.allRounds.at(-1).matches.length > 0
  }
  return (state.roundMatches.length > 0 || state.skippedQueue.length > 0) &&
    state.roundMatches.every((match, index) => index < state.currentMatchIdx ? match.winner !== null : match.winner === null)
}

function readSavedState() {
  try {
    const raw = localStorage.getItem(STORAGE_KEY)
    if (!raw) return null
    const state = JSON.parse(raw)
    return validState(state) ? state : null
  } catch { return null }
}

function generateRound(participants) {
  const shuffled = shuffle(participants)
  const matches = []
  for (let i = 0; i < shuffled.length - 1; i += 2) {
    matches.push({ songA: shuffled[i], songB: shuffled[i + 1], winner: null })
  }
  const bye = shuffled.length % 2 === 1 ? shuffled[shuffled.length - 1] : null
  return { matches, bye }
}

function cloneState(state) {
  return JSON.parse(JSON.stringify(state))
}

export function useTournament() {
  const round = ref(1)
  const roundMatches = ref([])
  const currentMatchIdx = ref(0)
  const roundByes = ref([])
  const allRounds = ref([])
  const skippedQueue = ref([])
  const historyStack = ref([])
  const phase = ref('idle')

  const currentMatch = computed(() => {
    if (currentMatchIdx.value < roundMatches.value.length) {
      return roundMatches.value[currentMatchIdx.value]
    }
    return null
  })

  const totalMatches = computed(() => roundMatches.value.length)
  const votedCount = computed(() => currentMatchIdx.value)
  const progress = computed(() => {
    if (totalMatches.value === 0) return 0
    return Math.round((votedCount.value / totalMatches.value) * 100)
  })

  const hasSkipped = computed(() => skippedQueue.value.length > 0)
  const canUndo = computed(() => historyStack.value.length > 0)
  const totalSongs = flatSongList.length

  const champions = computed(() => {
    if (phase.value !== 'complete' || allRounds.value.length === 0) return []
    const lastRound = allRounds.value[allRounds.value.length - 1]
    const results = []
    for (const m of lastRound.matches) {
      if (m.winner === 'A') results.push(m.songA)
      else if (m.winner === 'B') results.push(m.songB)
      else if (m.winner === 'tie') { results.push(m.songA); results.push(m.songB) }
    }
    return results
  })

  function pushSnapshot() {
    historyStack.value.push({
      round: round.value,
      roundMatches: cloneState(roundMatches.value),
      currentMatchIdx: currentMatchIdx.value,
      roundByes: [...roundByes.value],
      allRounds: cloneState(allRounds.value),
      skippedQueue: cloneState(skippedQueue.value),
      phase: phase.value,
    })
  }

  function persist() {
    try {
      localStorage.setItem(STORAGE_KEY, JSON.stringify({
        round: round.value,
        roundMatches: roundMatches.value,
        currentMatchIdx: currentMatchIdx.value,
        roundByes: roundByes.value,
        allRounds: allRounds.value,
        skippedQueue: skippedQueue.value,
        phase: phase.value,
      }))
    } catch { /* storage full, silently ignore */ }
  }

  function loadState() {
    const s = readSavedState()
    if (!s) return false
    round.value = s.round
    roundMatches.value = s.roundMatches
    currentMatchIdx.value = s.currentMatchIdx
    roundByes.value = s.roundByes
    allRounds.value = s.allRounds
    skippedQueue.value = s.skippedQueue
    phase.value = s.phase
    historyStack.value = []
    if (phase.value === 'voting' && !currentMatch.value) finishCurrentRound()
    return true
  }

  function hasSavedState() {
    return readSavedState() !== null
  }

  function initTournament() {
    const shuffled = shuffle(flatSongList)
    const { matches, bye } = generateRound(shuffled)
    historyStack.value = []
    round.value = 1
    roundMatches.value = matches
    currentMatchIdx.value = 0
    roundByes.value = bye ? [bye] : []
    allRounds.value = []
    skippedQueue.value = []
    phase.value = 'voting'
    persist()
  }

  function advanceRound() {
    const winners = []
    for (const m of roundMatches.value) {
      if (m.winner === 'A') winners.push(m.songA)
      else if (m.winner === 'B') winners.push(m.songB)
      else if (m.winner === 'tie') { winners.push(m.songA); winners.push(m.songB) }
    }

    const allWinners = [...winners, ...roundByes.value]
    allRounds.value = [...allRounds.value, {
      round: round.value,
      matches: cloneState(roundMatches.value),
    }]

    const participants = roundMatches.value.length * 2 + roundByes.value.length
    const isSingleMatch = roundMatches.value.length === 1
    const lastMatchWasTie = isSingleMatch && roundMatches.value[0].winner === 'tie'

    if (allWinners.length <= 1 || lastMatchWasTie || (allWinners.length === participants)) {
      if (allWinners.length >= 1) {
        allRounds.value = [...allRounds.value, {
          round: round.value + 1,
          matches: allWinners.map(w => ({ songA: w, songB: null, winner: 'A' })),
        }]
      }
      phase.value = 'complete'
      roundMatches.value = []
      currentMatchIdx.value = 0
      roundByes.value = []
      persist()
      return
    }

    const { matches, bye } = generateRound(allWinners)
    round.value++
    roundMatches.value = matches
    currentMatchIdx.value = 0
    roundByes.value = bye ? [bye] : []
    persist()
  }

  function vote(choice) {
    if (!['A', 'B'].includes(choice) || !currentMatch.value || phase.value !== 'voting') return
    pushSnapshot()
    roundMatches.value[currentMatchIdx.value].winner = choice
    currentMatchIdx.value++

    if (currentMatchIdx.value >= roundMatches.value.length) {
      finishCurrentRound()
    } else {
      persist()
    }
  }

  function skipCurrent() {
    if (!currentMatch.value || phase.value !== 'voting') return
    pushSnapshot()
    const match = roundMatches.value.splice(currentMatchIdx.value, 1)[0]
    skippedQueue.value = [...skippedQueue.value, match]
    if (currentMatchIdx.value >= roundMatches.value.length) {
      finishCurrentRound()
    } else {
      persist()
    }
  }

  function pickRandomSkipped() {
    if (skippedQueue.value.length === 0) return
    pushSnapshot()
    const idx = Math.floor(Math.random() * skippedQueue.value.length)
    const match = skippedQueue.value.splice(idx, 1)[0]
    match.winner = null
    roundMatches.value = [...roundMatches.value, match]
    skippedQueue.value = [...skippedQueue.value]
    persist()
  }

  function pass() {
    if (!currentMatch.value || phase.value !== 'voting') return
    pushSnapshot()
    roundMatches.value[currentMatchIdx.value].winner = 'tie'
    currentMatchIdx.value++

    if (currentMatchIdx.value >= roundMatches.value.length) {
      finishCurrentRound()
    } else {
      persist()
    }
  }

  function undo() {
    if (historyStack.value.length === 0) return
    const snap = historyStack.value.pop()
    round.value = snap.round
    roundMatches.value = snap.roundMatches
    currentMatchIdx.value = snap.currentMatchIdx
    roundByes.value = snap.roundByes
    allRounds.value = snap.allRounds
    skippedQueue.value = snap.skippedQueue
    phase.value = snap.phase
    persist()
  }

  function clearAll() {
    historyStack.value = []
    round.value = 1
    roundMatches.value = []
    currentMatchIdx.value = 0
    roundByes.value = []
    allRounds.value = []
    skippedQueue.value = []
    phase.value = 'idle'
    try { localStorage.removeItem(STORAGE_KEY) } catch { /* */ }
  }

  function resumeFromSaved() {
    return loadState()
  }

  function finishCurrentRound() {
    // Saved matchups still belong to this round: resolve them before advancing.
    if (skippedQueue.value.length) {
      roundMatches.value = [...roundMatches.value, ...shuffle(skippedQueue.value)]
      skippedQueue.value = []
      persist()
      return
    }
    advanceRound()
  }

  return {
    round,
    roundMatches,
    currentMatchIdx,
    roundByes,
    allRounds,
    skippedQueue,
    historyStack,
    phase,
    currentMatch,
    totalMatches,
    votedCount,
    progress,
    hasSkipped,
    canUndo,
    totalSongs,
    champions,
    initTournament,
    vote,
    skipCurrent,
    pass,
    pickRandomSkipped,
    undo,
    clearAll,
    loadState,
    hasSavedState,
    resumeFromSaved,
  }
}
