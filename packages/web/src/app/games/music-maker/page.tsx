'use client';

import { useState, useCallback, useRef, useEffect } from 'react';
import Link from 'next/link';

interface Note {
  id: string;
  name: string;
  frequency: number;
  color: string;
}

const notes: Note[] = [
  {
    id: 'C',
    name: 'C',
    frequency: 261.63,
    color: 'bg-white border-2 border-gray-800',
  },
  { id: 'C#', name: 'C#', frequency: 277.18, color: 'bg-gray-800' },
  {
    id: 'D',
    name: 'D',
    frequency: 293.66,
    color: 'bg-white border-2 border-gray-800',
  },
  { id: 'D#', name: 'D#', frequency: 311.13, color: 'bg-gray-800' },
  {
    id: 'E',
    name: 'E',
    frequency: 329.63,
    color: 'bg-white border-2 border-gray-800',
  },
  {
    id: 'F',
    name: 'F',
    frequency: 349.23,
    color: 'bg-white border-2 border-gray-800',
  },
  { id: 'F#', name: 'F#', frequency: 369.99, color: 'bg-gray-800' },
  {
    id: 'G',
    name: 'G',
    frequency: 392.0,
    color: 'bg-white border-2 border-gray-800',
  },
  { id: 'G#', name: 'G#', frequency: 415.3, color: 'bg-gray-800' },
  {
    id: 'A',
    name: 'A',
    frequency: 440.0,
    color: 'bg-white border-2 border-gray-800',
  },
  { id: 'A#', name: 'A#', frequency: 466.16, color: 'bg-gray-800' },
  {
    id: 'B',
    name: 'B',
    frequency: 493.88,
    color: 'bg-white border-2 border-gray-800',
  },
];

interface Song {
  id: string;
  title: string;
  sequence: string[];
  tempo: number;
}

const songs: Song[] = [
  {
    id: 'twinkle',
    title: 'Twinkle Twinkle Little Star',
    sequence: ['C', 'C', 'G', 'G', 'A', 'A', 'G'],
    tempo: 500,
  },
  {
    id: 'happy-birthday',
    title: 'Happy Birthday',
    sequence: ['C', 'C', 'D', 'C', 'F', 'E'],
    tempo: 400,
  },
  {
    id: 'mary-lamb',
    title: 'Mary Had a Little Lamb',
    sequence: ['E', 'D', 'C', 'D', 'E', 'E', 'E'],
    tempo: 450,
  },
];

export default function MusicMakerPage() {
  const [gameStatus, setGameStatus] = useState<
    'menu' | 'freeplay' | 'learning' | 'playing' | 'success'
  >('menu');
  const [score, setScore] = useState(0);
  const [currentSong, setCurrentSong] = useState<Song | null>(null);
  const [playerSequence, setPlayerSequence] = useState<string[]>([]);
  const [currentNoteIndex, setCurrentNoteIndex] = useState(0);
  const [isPlaying, setIsPlaying] = useState(false);
  const [recordedMelody, setRecordedMelody] = useState<string[]>([]);
  const [showResult, setShowResult] = useState(false);
  const [isCorrect, setIsCorrect] = useState(false);

  const audioContextRef = useRef<AudioContext | null>(null);

  useEffect(() => {
    // Initialize audio context
    if (typeof window !== 'undefined') {
      audioContextRef.current = new (window.AudioContext ||
        (window as any).webkitAudioContext)();
    }

    return () => {
      if (audioContextRef.current) {
        audioContextRef.current.close();
      }
    };
  }, []);

  const playNote = useCallback((note: Note, duration: number = 300) => {
    if (!audioContextRef.current) return;

    const oscillator = audioContextRef.current.createOscillator();
    const gainNode = audioContextRef.current.createGain();

    oscillator.connect(gainNode);
    gainNode.connect(audioContextRef.current.destination);

    oscillator.frequency.setValueAtTime(
      note.frequency,
      audioContextRef.current.currentTime
    );
    oscillator.type = 'sine';

    gainNode.gain.setValueAtTime(0.3, audioContextRef.current.currentTime);
    gainNode.gain.exponentialRampToValueAtTime(
      0.01,
      audioContextRef.current.currentTime + duration / 1000
    );

    oscillator.start();
    oscillator.stop(audioContextRef.current.currentTime + duration / 1000);
  }, []);

  const handleNoteClick = useCallback(
    (note: Note) => {
      playNote(note);

      if (gameStatus === 'freeplay') {
        setRecordedMelody(prev => [...prev, note.id]);
      } else if (gameStatus === 'playing' && currentSong) {
        const expectedNote = currentSong.sequence[currentNoteIndex];
        const correct = note.id === expectedNote;

        setIsCorrect(correct);
        setPlayerSequence(prev => [...prev, note.id]);

        if (correct) {
          setScore(prev => prev + 10);
          setCurrentNoteIndex(prev => prev + 1);

          if (currentNoteIndex + 1 >= currentSong.sequence.length) {
            setGameStatus('success');
          }
        } else {
          setShowResult(true);
          setTimeout(() => {
            setShowResult(false);
            // Reset the current note index to try again
            setPlayerSequence([]);
            setCurrentNoteIndex(0);
          }, 2000);
        }
      }
    },
    [gameStatus, currentSong, currentNoteIndex, playNote]
  );

  const startLearning = useCallback((song: Song) => {
    setCurrentSong(song);
    setPlayerSequence([]);
    setCurrentNoteIndex(0);
    setGameStatus('learning');
  }, []);

  const startPlaying = useCallback(() => {
    setGameStatus('playing');
  }, []);

  const playSong = useCallback(
    (song: Song) => {
      if (!audioContextRef.current) return;

      setIsPlaying(true);
      song.sequence.forEach((noteId, index) => {
        setTimeout(() => {
          const note = notes.find(n => n.id === noteId);
          if (note) {
            playNote(note, song.tempo * 0.8);
          }

          if (index === song.sequence.length - 1) {
            setIsPlaying(false);
          }
        }, index * song.tempo);
      });
    },
    [playNote]
  );

  const clearMelody = useCallback(() => {
    setRecordedMelody([]);
  }, []);

  const playRecordedMelody = useCallback(() => {
    if (recordedMelody.length === 0) return;

    setIsPlaying(true);
    recordedMelody.forEach((noteId, index) => {
      setTimeout(() => {
        const note = notes.find(n => n.id === noteId);
        if (note) {
          playNote(note, 400);
        }

        if (index === recordedMelody.length - 1) {
          setIsPlaying(false);
        }
      }, index * 400);
    });
  }, [recordedMelody, playNote]);

  const isBlackKey = (noteId: string) => noteId.includes('#');

  return (
    <div className="min-h-screen bg-gradient-to-br from-pink-50 via-purple-50 to-rose-50">
      <header className="bg-white shadow-sm">
        <nav className="container mx-auto px-4 py-4">
          <div className="flex items-center justify-between">
            <Link
              href="/games"
              className="flex items-center space-x-2 text-pink-600 hover:text-pink-700"
            >
              <span>← Back to Games</span>
            </Link>
            <div className="flex items-center space-x-4">
              <div className="text-sm text-gray-600">
                Score: <span className="font-bold text-pink-600">{score}</span>
              </div>
              <span className="text-xl font-bold text-gray-900">
                🎵 Music Maker
              </span>
            </div>
          </div>
        </nav>
      </header>

      <main className="container mx-auto px-4 py-8">
        <div className="text-center mb-8">
          <h1 className="text-4xl font-bold text-gray-900 mb-4">
            🎵 Music Maker
          </h1>
          <p className="text-lg text-gray-600">
            Compose melodies and learn about rhythm and notes!
          </p>
        </div>

        {gameStatus === 'menu' && (
          <div className="max-w-4xl mx-auto">
            <div className="text-center mb-8">
              <div className="text-6xl mb-4">🎹</div>
              <h2 className="text-2xl font-bold text-gray-900 mb-8">
                Choose Your Musical Adventure
              </h2>
            </div>

            <div className="grid md:grid-cols-2 gap-8">
              <div className="bg-white rounded-lg shadow-lg p-8 text-center">
                <div className="text-4xl mb-4">🎼</div>
                <h3 className="text-xl font-bold text-gray-900 mb-4">
                  Free Play Mode
                </h3>
                <p className="text-gray-600 mb-6">
                  Create your own melodies by clicking the piano keys. Let your
                  creativity flow!
                </p>
                <button
                  onClick={() => setGameStatus('freeplay')}
                  className="bg-gradient-to-r from-pink-500 to-purple-500 text-white px-8 py-4 rounded-lg font-bold text-lg hover:shadow-lg transition-all duration-200 transform hover:scale-105"
                >
                  🎹 Start Playing
                </button>
              </div>

              <div className="bg-white rounded-lg shadow-lg p-8 text-center">
                <div className="text-4xl mb-4">🎓</div>
                <h3 className="text-xl font-bold text-gray-900 mb-4">
                  Learn Songs
                </h3>
                <p className="text-gray-600 mb-6">
                  Learn to play popular songs by following the notes. Perfect
                  for beginners!
                </p>
                <div className="space-y-2">
                  {songs.map(song => (
                    <button
                      key={song.id}
                      onClick={() => startLearning(song)}
                      className="w-full bg-gradient-to-r from-blue-500 to-green-500 text-white px-4 py-2 rounded-lg font-bold hover:shadow-lg transition-all duration-200 transform hover:scale-105"
                    >
                      🎵 {song.title}
                    </button>
                  ))}
                </div>
              </div>
            </div>
          </div>
        )}

        {gameStatus === 'freeplay' && (
          <div className="max-w-4xl mx-auto">
            <div className="bg-white rounded-lg shadow-lg p-6 mb-6">
              <div className="flex justify-between items-center mb-4">
                <h2 className="text-2xl font-bold text-gray-900">
                  Free Play Mode
                </h2>
                <button
                  onClick={() => setGameStatus('menu')}
                  className="bg-gray-500 text-white px-4 py-2 rounded-lg font-bold hover:shadow-lg transition-all duration-200"
                >
                  🏠 Back to Menu
                </button>
              </div>

              {recordedMelody.length > 0 && (
                <div className="mb-4 p-4 bg-purple-50 rounded-lg">
                  <h3 className="text-lg font-bold text-gray-900 mb-2">
                    Your Melody:
                  </h3>
                  <div className="flex flex-wrap gap-2 mb-3">
                    {recordedMelody.map((noteId, index) => (
                      <span
                        key={index}
                        className="bg-purple-200 text-purple-800 px-2 py-1 rounded text-sm font-bold"
                      >
                        {noteId}
                      </span>
                    ))}
                  </div>
                  <div className="space-x-2">
                    <button
                      onClick={playRecordedMelody}
                      disabled={isPlaying}
                      className="bg-green-500 text-white px-4 py-2 rounded-lg font-bold hover:shadow-lg transition-all duration-200 disabled:opacity-50"
                    >
                      ▶️ Play Melody
                    </button>
                    <button
                      onClick={clearMelody}
                      className="bg-red-500 text-white px-4 py-2 rounded-lg font-bold hover:shadow-lg transition-all duration-200"
                    >
                      🗑️ Clear
                    </button>
                  </div>
                </div>
              )}

              {/* Piano Keys */}
              <div className="relative bg-gray-100 p-4 rounded-lg">
                <div className="flex">
                  {notes
                    .filter(note => !isBlackKey(note.id))
                    .map(note => (
                      <button
                        key={note.id}
                        onClick={() => handleNoteClick(note)}
                        className={`${note.color} h-32 flex-1 mx-px flex items-end justify-center pb-4 text-gray-800 font-bold hover:bg-gray-50 transition-all duration-150 transform hover:scale-105 active:scale-95`}
                      >
                        {note.name}
                      </button>
                    ))}
                </div>
                <div className="absolute top-4 left-4 flex">
                  {notes
                    .filter(note => isBlackKey(note.id))
                    .map((note, index) => {
                      const positions = [13, 21, 37, 45, 53]; // Approximate positions for black keys
                      return (
                        <button
                          key={note.id}
                          onClick={() => handleNoteClick(note)}
                          className={`${note.color} text-white h-20 w-8 absolute font-bold hover:bg-gray-700 transition-all duration-150 transform hover:scale-105 active:scale-95`}
                          style={{ left: `${positions[index]}%` }}
                        >
                          {note.name}
                        </button>
                      );
                    })}
                </div>
              </div>
            </div>
          </div>
        )}

        {(gameStatus === 'learning' || gameStatus === 'playing') &&
          currentSong && (
            <div className="max-w-4xl mx-auto">
              <div className="bg-white rounded-lg shadow-lg p-6 mb-6">
                <div className="flex justify-between items-center mb-4">
                  <h2 className="text-2xl font-bold text-gray-900">
                    {currentSong.title}
                  </h2>
                  <button
                    onClick={() => setGameStatus('menu')}
                    className="bg-gray-500 text-white px-4 py-2 rounded-lg font-bold hover:shadow-lg transition-all duration-200"
                  >
                    🏠 Back to Menu
                  </button>
                </div>

                {gameStatus === 'learning' && (
                  <div className="mb-6">
                    <h3 className="text-lg font-bold text-gray-900 mb-3">
                      Song Notes:
                    </h3>
                    <div className="flex flex-wrap gap-2 mb-4">
                      {currentSong.sequence.map((noteId, index) => (
                        <span
                          key={index}
                          className="bg-blue-200 text-blue-800 px-3 py-1 rounded-lg text-lg font-bold"
                        >
                          {noteId}
                        </span>
                      ))}
                    </div>
                    <div className="space-x-2">
                      <button
                        onClick={() => playSong(currentSong)}
                        disabled={isPlaying}
                        className="bg-blue-500 text-white px-6 py-3 rounded-lg font-bold hover:shadow-lg transition-all duration-200 disabled:opacity-50"
                      >
                        🎵 Listen to Song
                      </button>
                      <button
                        onClick={startPlaying}
                        className="bg-green-500 text-white px-6 py-3 rounded-lg font-bold hover:shadow-lg transition-all duration-200"
                      >
                        🎹 Try Playing
                      </button>
                    </div>
                  </div>
                )}

                {gameStatus === 'playing' && (
                  <div className="mb-6">
                    <h3 className="text-lg font-bold text-gray-900 mb-3">
                      Play the notes in order: (Note {currentNoteIndex + 1} of{' '}
                      {currentSong.sequence.length})
                    </h3>
                    <div className="flex flex-wrap gap-2 mb-4">
                      {currentSong.sequence.map((noteId, index) => (
                        <span
                          key={index}
                          className={`px-3 py-1 rounded-lg text-lg font-bold ${
                            index < currentNoteIndex
                              ? 'bg-green-200 text-green-800'
                              : index === currentNoteIndex
                                ? 'bg-yellow-200 text-yellow-800 animate-pulse'
                                : 'bg-gray-200 text-gray-600'
                          }`}
                        >
                          {noteId}
                        </span>
                      ))}
                    </div>
                  </div>
                )}

                {/* Piano Keys */}
                <div className="relative bg-gray-100 p-4 rounded-lg">
                  <div className="flex">
                    {notes
                      .filter(note => !isBlackKey(note.id))
                      .map(note => (
                        <button
                          key={note.id}
                          onClick={() => handleNoteClick(note)}
                          className={`${note.color} h-32 flex-1 mx-px flex items-end justify-center pb-4 text-gray-800 font-bold hover:bg-gray-50 transition-all duration-150 transform hover:scale-105 active:scale-95`}
                        >
                          {note.name}
                        </button>
                      ))}
                  </div>
                  <div className="absolute top-4 left-4 flex">
                    {notes
                      .filter(note => isBlackKey(note.id))
                      .map((note, index) => {
                        const positions = [13, 21, 37, 45, 53];
                        return (
                          <button
                            key={note.id}
                            onClick={() => handleNoteClick(note)}
                            className={`${note.color} text-white h-20 w-8 absolute font-bold hover:bg-gray-700 transition-all duration-150 transform hover:scale-105 active:scale-95`}
                            style={{ left: `${positions[index]}%` }}
                          >
                            {note.name}
                          </button>
                        );
                      })}
                  </div>
                </div>
              </div>

              {showResult && (
                <div className="fixed inset-0 flex items-center justify-center bg-black bg-opacity-50 z-50">
                  <div className="bg-white rounded-lg p-8 text-center">
                    <div className="text-6xl mb-4">🎵</div>
                    <h3 className="text-2xl font-bold text-orange-600 mb-2">
                      Try Again!
                    </h3>
                    <p className="text-gray-600">
                      That wasn't quite right. Listen to the song again and try!
                    </p>
                  </div>
                </div>
              )}
            </div>
          )}

        {gameStatus === 'success' && (
          <div className="max-w-md mx-auto bg-white rounded-lg shadow-lg p-8 text-center">
            <div className="text-6xl mb-4">🎉</div>
            <h2 className="text-2xl font-bold text-gray-900 mb-4">
              Beautiful Music!
            </h2>
            <p className="text-gray-600 mb-6">
              You played {currentSong?.title} perfectly! You're becoming a great
              musician.
            </p>
            <button
              onClick={() => setGameStatus('menu')}
              className="bg-gradient-to-r from-pink-500 to-purple-500 text-white px-8 py-4 rounded-lg font-bold text-lg hover:shadow-lg transition-all duration-200 transform hover:scale-105"
            >
              🎵 Play More Music
            </button>
          </div>
        )}
      </main>
    </div>
  );
}
