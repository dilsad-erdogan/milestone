"use client";

import { useState, useEffect, useRef } from "react";
import { useParams, useRouter } from "next/navigation";
import { useAuth } from "@/context/AuthContext";
import { useLanguage } from "@/context/LanguageContext";
import AuthGuard from "@/components/AuthGuard";
import { useDispatch, useSelector } from "react-redux";
import { RootState, AppDispatch } from "../../store";
import { fetchAppData } from "../../store/slices/appSlice";
import { saveQuizResult } from "@/firebase/quizzes";
import QuizTimer from "@/components/quiz/QuizTimer";
import QuizProgress from "@/components/quiz/QuizProgress";
import { ArrowRight, Check, X } from "lucide-react";
import confetti from "canvas-confetti";

type AnswerStatus = "correct" | "wrong" | "empty" | "locked";

interface Question {
    id: string;
    letter: string;
    question: string;
    correctAnswer: string;
    validAnswers: string[]; // Support multiple correct answers
    status: AnswerStatus;
    userAnswer?: string;
    isLocked: boolean;
}

interface QuizPlayClientProps {
    mode?: 'normal' | 'daily';
    overrideWords?: any[];
}

export default function QuizPlayClient({ mode = 'normal', overrideWords = [] }: QuizPlayClientProps) {
    const params = useParams();
    const router = useRouter();
    const { user } = useAuth();
    const { t } = useLanguage();
    const direction = params.direction as 'eng-tr' | 'tr-eng';

    // Redispatch if needed
    const dispatch = useDispatch<AppDispatch>();
    const { userWords, loading: reduxLoading, initialized } = useSelector((state: RootState) => state.app);

    // Determine words source
    const activeWords = mode === 'daily' ? overrideWords : userWords;
    const isDaily = mode === 'daily';

    // State
    const [loading, setLoading] = useState(true);
    const [loadingMessage, setLoadingMessage] = useState("Quiz hazırlanıyor...");
    const [questions, setQuestions] = useState<Question[]>([]);
    const [currentIndex, setCurrentIndex] = useState(0);
    const [inputValue, setInputValue] = useState("");
    const [quizFinished, setQuizFinished] = useState(false);
    const [timeLeft, setTimeLeft] = useState(300); // 5 mins
    const [resultSaving, setResultSaving] = useState(false);
    const [showHalftimeAlert, setShowHalftimeAlert] = useState(false);

    // Refs for preventing double submission
    const submittedRef = useRef<Set<string>>(new Set());

    // Prevent accidental navigation/refresh
    useEffect(() => {
        const handleBeforeUnload = (e: BeforeUnloadEvent) => {
            if (!quizFinished) {
                e.preventDefault();
                e.returnValue = '';
            }
        };

        window.addEventListener('beforeunload', handleBeforeUnload);
        return () => window.removeEventListener('beforeunload', handleBeforeUnload);
    }, [quizFinished]);

    // Initialize Data
    useEffect(() => {
        if (user && !initialized && mode !== 'daily') {
            dispatch(fetchAppData(user.uid));
        }
    }, [user, initialized, dispatch, mode]);

    // Check availability and Start Quiz Sequence
    useEffect(() => {
        // Wait for Redux to be ready ONLY if normal mode
        if (mode === 'normal' && (!initialized || reduxLoading)) return;

        // If loaded but no user words?
        if (mode === 'normal' && userWords.length === 0) {
            // Already handled below
        }

        const startQuizSequence = async () => {
            // 1. Validation
            if (activeWords.length === 0) {
                if (mode === 'normal') {
                    alert(t.quiz.notEnoughWords);
                    router.push('/');
                }
                return;
            }

            // 2. Prepare Data
            const groupedWords: Record<string, any[]> = {};

            activeWords.forEach((word: any) => {
                // Determine answer based on direction
                const answer = (direction === 'eng-tr' ? word.tr : word.eng)?.trim();
                if (!answer) return;

                // Standardize letter with tr-TR locale
                const letter = answer.charAt(0).toLocaleUpperCase('tr-TR');

                if (!groupedWords[letter]) {
                    groupedWords[letter] = [];
                }
                groupedWords[letter].push(word);
            });

            // 3. Determine Alphabet (Only Used Letters)
            const usedLetters = Object.keys(groupedWords);
            const targetAlphabet = usedLetters.sort((a, b) => new Intl.Collator('tr-TR').compare(a, b));

            // 4. Generate Questions for each letter in Alphabet
            const quizQuestions: Question[] = targetAlphabet.map((letter) => {
                const availableWords = groupedWords[letter];

                if (availableWords && availableWords.length > 0) {
                    // Randomly select one word
                    const randomWord = availableWords[Math.floor(Math.random() * availableWords.length)];

                    // FIND ALL VALID ANSWERS
                    const questionText = direction === 'eng-tr' ? randomWord.eng : randomWord.tr;

                    // Filter from Redux userWords
                    const validAnswerList = userWords
                        .filter((w: any) => {
                            const q = direction === 'eng-tr' ? w.eng : w.tr;
                            return q?.trim().toLocaleUpperCase('tr-TR') === questionText?.trim().toLocaleUpperCase('tr-TR');
                        })
                        .map((w: any) => direction === 'eng-tr' ? w.tr : w.eng);

                    // Ensure the primary answer is included
                    const primaryAnswer = direction === 'eng-tr' ? randomWord.tr : randomWord.eng;
                    if (!validAnswerList.includes(primaryAnswer)) {
                        validAnswerList.push(primaryAnswer);
                    }

                    return {
                        id: randomWord.id,
                        letter: letter,
                        question: questionText,
                        correctAnswer: primaryAnswer,
                        validAnswers: validAnswerList,
                        status: 'empty',
                        isLocked: false
                    };
                } else {
                    return {
                        id: `locked-${letter}`,
                        letter: letter,
                        question: '',
                        correctAnswer: '',
                        validAnswers: [],
                        status: 'locked',
                        isLocked: true
                    };
                }
            });

            setQuestions(quizQuestions);

            // Find first unlocked question
            const firstUnlocked = quizQuestions.findIndex(q => !q.isLocked);
            if (firstUnlocked !== -1) setCurrentIndex(firstUnlocked);

            // 5. Fake Loading Sequence (Preserve Experience)
            const quizT = t.quiz as any;
            const messages = [
                quizT.loading1 || "Kelime havuzun taranıyor...",
                quizT.loading2 || "Zorluk seviyesi ayarlanıyor...",
                quizT.loading3 || "Sorular hazırlanıyor...",
                quizT.loading4 || "Son kontroller yapılıyor...",
                quizT.loading5 || "Quiz başlamak üzere!"
            ];

            for (let i = 0; i < messages.length; i++) {
                setLoadingMessage(messages[i]);
                // Random delay between 2-4 seconds for each step (total ~15s)
                // Reducing slightly since data is faster now, but user likes the "feel".
                await new Promise(r => setTimeout(r, 1500 + Math.random() * 1000));
            }

            setLoading(false);
        };

        startQuizSequence();

    }, [userWords, initialized, reduxLoading, direction, router]);

    // Cleanup localstorage on mount
    useEffect(() => {
        localStorage.removeItem('quiz_time_left');
    }, []);

    const handleTimeUp = () => {
        finishQuiz(true);
    };

    const handleTick = (currentTime: number) => {
        // Notify when half time is passed (150 seconds remaining of 300)
        if (currentTime === 150) {
            setShowHalftimeAlert(true);
            setTimeout(() => setShowHalftimeAlert(false), 3000);
        }
    };

    const normalizeString = (str: string) => {
        return str
            .toLocaleLowerCase(direction === 'eng-tr' ? 'tr-TR' : 'en-US')
            .trim()
            .replace(/ı/g, 'i') // Tolerances
            .replace(/i/g, 'i')
            .replace(/ğ/g, 'g')
            .replace(/ü/g, 'u')
            .replace(/ş/g, 's')
            .replace(/ö/g, 'o')
            .replace(/ç/g, 'c');
    };

    const handleSubmitAnswer = () => {
        const currentQ = questions[currentIndex];
        if (!currentQ || currentQ.isLocked) return;

        // Prevent re-answering if already correct or wrong (but allow if empty/skipped before?)
        // User requirements: "yanlış soruya dönülmesin", "boş bırakılan soruya dönülebilsin"
        // So if status is 'correct' or 'wrong', we can't change it.
        // But we are here meaning user clicked Submit.

        if (currentQ.status === 'correct' || currentQ.status === 'wrong') return;

        const normalizedInput = normalizeString(inputValue);

        // Check against ALL valid answers
        const isCorrect = currentQ.validAnswers.some(ans =>
            normalizeString(ans) === normalizedInput
        );

        const updatedQuestions = [...questions];
        updatedQuestions[currentIndex] = {
            ...currentQ,
            userAnswer: inputValue,
            status: isCorrect ? 'correct' : 'wrong' // Yanlışsa 'wrong' olur ve bir daha değişmez
        };

        setQuestions(updatedQuestions);
        setInputValue(""); // Clear input

        if (isCorrect) {
            // Optional: Small confetti or sound
        }

        // Auto advance to next unlocked question
        goToNextQuestion(updatedQuestions);
    };

    const goToNextQuestion = (currentQuestions = questions) => {
        let nextIndex = currentIndex + 1;
        while (nextIndex < currentQuestions.length) {
            if (!currentQuestions[nextIndex].isLocked) {
                setCurrentIndex(nextIndex);
                setInputValue(currentQuestions[nextIndex].userAnswer || ""); // Restore draft answer if any
                return;
            }
            nextIndex++;
        }
        // If end of list, verify if all regular questions answered?
        // Or just stay at last question? 
        // Let's loop back to start to find unanswered 'empty' questions?
        // User logic: "sonrakine geçildi" -> linear flow usually.
        // But user wants to return to empty questions.
        // Let's just find the next available. If none, stay.

        // Find first empty question from start
        const firstEmpty = currentQuestions.findIndex(q => !q.isLocked && q.status === 'empty');
        if (firstEmpty !== -1 && firstEmpty !== currentIndex) {
            setCurrentIndex(firstEmpty);
            setInputValue("");
        } else {
            // All answered or we are at the only one left.
            // Maybe show Finish button?
        }
    };

    const goToPreviousQuestion = () => {
        let prevIndex = currentIndex - 1;
        while (prevIndex >= 0) {
            if (!questions[prevIndex].isLocked) {
                setCurrentIndex(prevIndex);
                // If it was already answered (correct/wrong), showing the answer is fine but locked input
                // If empty, restore input (but we clear input on submit usually)
                setInputValue(questions[prevIndex].status === 'correct' || questions[prevIndex].status === 'wrong'
                    ? questions[prevIndex].correctAnswer // Show correct answer if finished? Or user answer?
                    // Proposal: If answered, show user answer and status. Handled in UI.
                    : ""
                );
                return;
            }
            prevIndex--;
        }
    };

    // Explicit Finish
    const finishQuiz = async (isTimeUp = false) => {
        if (resultSaving) return;
        setResultSaving(true);
        setQuizFinished(true);

        // Calculate Score
        let correctCount = 0;
        let wrongCount = 0;
        let emptyCount = 0;
        let score = 0;

        questions.forEach(q => {
            if (q.isLocked) return;
            if (q.status === 'correct') {
                score += 15;
                correctCount++;
            } else if (q.status === 'wrong') {
                score -= 5;
                wrongCount++;
            } else { // empty
                score -= 2;
                emptyCount++;
            }
        });

        // Time Bonus (10s = 1pt)
        // If time is up, timeLeft is 0. 
        // We need the ACTUAL time left when finish was called.
        // We can get it from ref or localized state if we stop timer first.
        const currentTimeLeft = isTimeUp ? 0 : parseInt(localStorage.getItem('quiz_time_left') || '0', 10);
        const timeBonus = 0; // Time bonus removed
        // score += timeBonus; // Disabled
        if (score < 0) score = 0;

        // Sanitize data -> Remove undefined values and ensure types
        const resultData = {
            direction: direction || 'unknown',
            finalScore: Math.max(0, score || 0),
            correctCount: correctCount || 0,
            wrongCount: wrongCount || 0,
            emptyCount: emptyCount || 0,
            timeBonus: timeBonus || 0,
            answers: questions.map(q => ({
                id: q.id || 'unknown',
                letter: q.letter || '?',
                question: q.question || '',
                correctAnswer: q.correctAnswer || '',
                userAnswer: q.userAnswer || '',
                status: q.status || 'empty',
                isLocked: !!q.isLocked
            })),
            totalQuestions: questions.filter(q => !q.isLocked).length || 0,
            timeTaken: Math.max(0, (300 - currentTimeLeft) || 0),
            type: mode, // 'normal' or 'daily'
            quizDate: mode === 'daily' ? new Date().toISOString().split('T')[0] : null
        };

        // Deep sanitize to remove any remaining undefined which Firestore hates
        const sanitizedData = JSON.parse(JSON.stringify(resultData));

        try {
            if (user) {
                // Use fully sanitized data
                const result = await saveQuizResult(user.uid, sanitizedData);

                // Trigger confetti
                confetti({
                    particleCount: 150,
                    spread: 70,
                    origin: { y: 0.6 }
                });

                // Redirect to detailed result page
                if (result && result.id) {
                    setTimeout(() => router.push(`/quiz/result?id=${result.id}`), 500); // Small delay for confetti
                    return;
                }
            }
        } catch (error: any) {
            console.error("Error saving result (Detailed):", error);
            alert(`Sonuç kaydedilirken bir hata oluştu: ${error.message || 'Bilinmeyen hata'}`);
        } finally {
            setResultSaving(false);
        }
    };

    // Check if can submit (not empty)
    const canSubmit = inputValue.trim().length > 0;
    const currentQ = questions[currentIndex];
    const isCurrentAnswered = currentQ?.status === 'correct' || currentQ?.status === 'wrong';

    if (loading) {
        return (
            <div className="min-h-screen flex flex-col items-center justify-center bg-[#F9FAFB] p-4 pt-20">
                <div className="w-full max-w-sm text-center">
                    <div className="relative w-24 h-24 mx-auto mb-8">
                        <div className="absolute inset-0 border-4 border-slate-100 rounded-full"></div>
                        <div className="absolute inset-0 border-4 border-[#3FB8F5] rounded-full border-t-transparent animate-spin"></div>
                        <div className="absolute inset-0 flex items-center justify-center">
                            <span className="text-2xl animate-bounce">⚡</span>
                        </div>
                    </div>
                    <h2 className="text-2xl font-bold text-slate-800 mb-2 animate-pulse transition-all duration-500">
                        {loadingMessage}
                    </h2>
                    <p className="text-slate-400 text-sm">Lütfen bekleyin...</p>

                    {/* Fake Progress Bar */}
                    <div className="mt-8 bg-slate-100 rounded-full h-2 w-full overflow-hidden">
                        <div className="h-full bg-[#3FB8F5] animate-[progress_15s_ease-in-out_forwards] w-full origin-left"></div>
                    </div>
                </div>
                <style jsx>{`
                    @keyframes progress {
                        0% { transform: scaleX(0); }
                        100% { transform: scaleX(1); }
                    }
                `}</style>
            </div>
        );
    }

    if (quizFinished && !resultSaving) {
        return (
            <div className="h-screen flex items-center justify-center bg-[#F9FAFB]">
                <div className="text-center">
                    <h2 className="text-2xl font-bold text-slate-800 mb-4">{t.quiz.completed}</h2>
                    <p className="text-slate-500 mb-6">Sonuçlar kaydediliyor ve yönlendiriliyorsunuz...</p>
                    <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-500 mx-auto"></div>
                </div>
            </div>
        );
    }

    return (
        <AuthGuard>
            <div className="min-h-screen bg-[#F9FAFB] flex flex-col pt-16">
                {/* Header */}
                <div className="bg-white border-b border-slate-200 p-4 sticky top-16 z-40 shadow-sm">
                    <div className="max-w-4xl mx-auto flex items-center justify-between">
                        <div className="w-24">
                            <button onClick={() => {
                                finishQuiz();
                                setTimeout(() => router.push('/'), 100);
                            }} className="text-slate-400 hover:text-red-500 transition-colors">
                                <X className="w-6 h-6" />
                            </button>
                        </div>

                        <QuizTimer
                            initialTime={timeLeft}
                            onTimeUp={handleTimeUp}
                            onTick={handleTick}
                            isActive={!quizFinished}
                        />

                        <div className="w-24 flex justify-end">
                            <button
                                onClick={() => finishQuiz()}
                                className="text-xs font-bold text-red-500 hover:text-white border border-red-200 hover:bg-red-500 px-4 py-2 rounded-full transition-all shadow-sm"
                            >
                                {t.quiz.finish}
                            </button>
                        </div>
                    </div>

                    <div className="mt-6 max-w-4xl mx-auto">
                        <QuizProgress
                            letters={questions.map(q => q.letter)}
                            currentLetter={currentQ?.letter}
                            answeredLetters={questions.reduce((acc, q) => {
                                acc[q.letter] = q.status;
                                return acc;
                            }, {} as any)}
                            onLetterClick={(letter) => {
                                const idx = questions.findIndex(q => q.letter === letter);
                                if (idx !== -1 && !questions[idx].isLocked) {
                                    setCurrentIndex(idx);
                                    if (questions[idx].status === 'empty') setInputValue("");
                                }
                            }}
                        />
                    </div>
                </div>

                {/* Halftime Notification */}
                {showHalftimeAlert && (
                    <div className="fixed top-24 left-1/2 transform -translate-x-1/2 z-50 animate-bounce">
                        <div className="bg-orange-500 text-white px-6 py-3 rounded-full shadow-lg font-bold flex items-center gap-2">
                            <span className="text-xl">⚠️</span>
                            {t.quiz.halfTime || "Sürenin yarısı doldu!"}
                        </div>
                    </div>
                )}

                {/* Main Content */}
                <div className="flex-1 flex flex-col items-center justify-center p-4">
                    <div className="max-w-2xl w-full">
                        {currentQ ? (
                            <div className="bg-white rounded-[2rem] shadow-xl p-8 md:p-12 text-center relative overflow-hidden">
                                {isCurrentAnswered && (
                                    <div className={`absolute top-0 left-0 w-full h-2 ${currentQ.status === 'correct' ? 'bg-[#43C000]' : 'bg-[#FF4B4B]'}`}></div>
                                )}

                                <span className="inline-block py-1 px-3 rounded-full bg-slate-100 text-slate-500 text-xs font-extrabold tracking-widest mb-6">
                                    {t.quiz.question} {questions.filter(q => !q.isLocked).indexOf(currentQ) + 1} {t.quiz.of} {questions.filter(q => !q.isLocked).length}
                                </span>

                                <h2 className="text-4xl md:text-5xl font-black text-slate-800 mb-12 tracking-tight">
                                    {currentQ.question}
                                </h2>

                                {/* Input Area */}
                                <div className="relative max-w-md mx-auto mb-8">
                                    {isCurrentAnswered ? (
                                        <div className={`
                                            w-full py-4 px-6 rounded-2xl text-xl font-bold border-2
                                            ${currentQ.status === 'correct'
                                                ? 'bg-green-50 border-[#43C000] text-[#43C000]'
                                                : 'bg-red-50 border-[#FF4B4B] text-[#FF4B4B]'}
                                        `}>
                                            <div className="flex items-center justify-center gap-2">
                                                {currentQ.status === 'correct' ? <Check className="w-6 h-6" /> : <X className="w-6 h-6" />}
                                                {currentQ.userAnswer}
                                            </div>
                                            {currentQ.status === 'wrong' && (
                                                <div className="text-sm mt-1 text-slate-500 font-normal">
                                                    {t.quiz.correctAnswer}: <span className="font-bold">{currentQ.validAnswers.join(', ')}</span>
                                                </div>
                                            )}
                                        </div>
                                    ) : (
                                        <input
                                            type="text"
                                            value={inputValue}
                                            onChange={(e) => setInputValue(e.target.value.toLocaleUpperCase('tr-TR'))}
                                            onKeyDown={(e) => e.key === 'Enter' && canSubmit && handleSubmitAnswer()}
                                            disabled={isCurrentAnswered}
                                            placeholder={`${currentQ.letter} ile başlayan...`}
                                            className="w-full bg-slate-50 border-2 border-slate-200 focus:border-blue-500 focus:bg-white rounded-2xl py-4 px-6 text-xl font-bold text-center outline-none transition-all placeholder:text-slate-300 text-slate-800"
                                            autoFocus
                                        />
                                    )}
                                </div>

                                {/* Controls */}
                                <div className="flex items-center justify-center gap-4">

                                    {!isCurrentAnswered ? (
                                        <>
                                            <button
                                                onClick={() => goToNextQuestion()}
                                                className="w-12 h-12 flex items-center justify-center rounded-full bg-slate-100 text-slate-400 hover:bg-slate-200 hover:text-slate-600 transition-colors"
                                            >
                                                <ArrowRight className="w-5 h-5" />
                                            </button>

                                            <button
                                                onClick={handleSubmitAnswer}
                                                disabled={!canSubmit}
                                                className="bg-[#3FB8F5] disabled:opacity-50 disabled:cursor-not-allowed hover:bg-[#329fd6] text-white font-bold py-3 px-10 rounded-xl shadow-lg shadow-blue-200 transition-all active:scale-95"
                                            >
                                                {t.quiz.submit}
                                            </button>
                                        </>
                                    ) : (
                                        <div className="flex gap-3">
                                            <button
                                                onClick={() => finishQuiz()}
                                                className="bg-red-500 hover:bg-red-600 text-white font-bold py-3 px-6 rounded-xl shadow-lg shadow-red-200 transition-all active:scale-95 text-sm"
                                            >
                                                {t.quiz.finish}
                                            </button>
                                            <button
                                                onClick={() => goToNextQuestion()}
                                                className="bg-slate-800 hover:bg-slate-700 text-white font-bold py-3 px-8 rounded-xl shadow-lg transition-all active:scale-95 flex items-center gap-2"
                                            >
                                                {t.quiz.next} <ArrowRight className="w-4 h-4" />
                                            </button>
                                        </div>
                                    )}
                                </div>
                                <div className="mt-6">
                                    <button
                                        onClick={() => finishQuiz()}
                                        className="text-slate-400 hover:text-slate-600 text-sm font-medium underline decoration-slate-200 hover:decoration-slate-400 transition-colors"
                                    >
                                        {t.quiz.finish}
                                    </button>
                                </div>

                            </div>
                        ) : (
                            <div className="text-center text-slate-400">Loading...</div>
                        )}
                    </div>
                </div>
            </div>
        </AuthGuard>
    );
}
