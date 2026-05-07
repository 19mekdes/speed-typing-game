/* eslint-disable @typescript-eslint/no-unused-vars */
/* eslint-disable react-hooks/exhaustive-deps */
/* eslint-disable react-hooks/set-state-in-effect */
'use client';

import { useState, useEffect, useRef } from 'react';


const texts = {
  easy: [
    "The cat sat on the mat and looked at the sun. It was a warm and happy day for the little cat.",
    "A quick brown fox jumps over the lazy dog near the river. The dog just sleeps all day long.",
    "She sells sea shells by the sea shore every morning. The shells shine bright in the sun light.",
    "The bird flies high in the blue sky. It sings a sweet song for everyone to hear.",
    "My dog loves to play fetch in the park. He runs fast and brings the ball back to me."
  ],
  medium: [
    "Technology has transformed the way we communicate with each other across the globe. Many people now work remotely from their homes using digital tools.",
    "The scientist conducted a series of experiments to test the hypothesis. After months of research, the results were finally published in a prestigious journal.",
    "Exploring new places and experiencing different cultures can broaden your perspective about life. Travel teaches us valuable lessons that cannot be learned from books.",
    "The company implemented new strategies to improve productivity and employee satisfaction. These changes resulted in significant growth over the following quarter.",
    "Learning a new language requires dedication and consistent practice. Many people find that immersion is the most effective way to become fluent."
  ],
  hard: [
    "The phenomenon of quantum entanglement suggests that particles can instantaneously influence each other regardless of distance. This challenges our classical understanding of physics and reality itself.",
    "Implementing sustainable architectural designs requires balancing ecological responsibility with aesthetic functionality. Modern green buildings integrate renewable energy systems and passive climate control strategies.",
    "The intricate relationship between socioeconomic factors and educational outcomes demonstrates systemic inequality. Longitudinal studies reveal that early childhood interventions significantly impact long-term academic achievement.",
    "Cryptocurrency and blockchain technology have revolutionized financial transactions by introducing decentralized verification systems. This innovation eliminates the need for traditional banking intermediaries.",
    "The philosophical implications of artificial intelligence extend beyond technical capabilities to question consciousness, ethics, and the nature of human uniqueness in an increasingly automated world."
  ]
};


const simpleWords = new Set(['a', 'an', 'the', 'and', 'of', 'to', 'in', 'for', 'on', 'with', 'at', 'by', 'is', 'was', 'are']);
const mediumWords = new Set(['but', 'from', 'have', 'this', 'that', 'they', 'will', 'their', 'what', 'about']);

export default function TypingGame() {
  const [currentText, setCurrentText] = useState('');
  const [userInput, setUserInput] = useState('');
  const [timeLeft, setTimeLeft] = useState(60);
  const [isActive, setIsActive] = useState(false);
  const [wpm, setWpm] = useState(0);
  const [accuracy, setAccuracy] = useState(100);
  const [difficulty, setDifficulty] = useState('medium');
  const [showResults, setShowResults] = useState(false);
  const [finalStats, setFinalStats] = useState('');
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const [history, setHistory] = useState<any[]>([]);
  
  const timerRef = useRef<NodeJS.Timeout | null>(null);
  const textareaRef = useRef<HTMLTextAreaElement>(null);

  // Calculate weighted WPM (Extra Challenge)
  const calculateWeightedWPM = (text: string, typedText: string): number => {
    const originalWords = text.toLowerCase().split(/\s+/);
    const typedWords = typedText.toLowerCase().trim().split(/\s+/);
    let totalWeight = 0;
    let earnedWeight = 0;
    
    for(let i = 0; i < originalWords.length && i < typedWords.length; i++) {
      const word = originalWords[i];
      let weight = 1;
      if(simpleWords.has(word)) weight = 0.6;
      else if(mediumWords.has(word)) weight = 0.8;
      else weight = 1.2;  // difficult words weigh more
      
      totalWeight += weight;
      if(typedWords[i] === word) earnedWeight += weight;
    }
    
    const elapsedMinutes = (60 - timeLeft) / 60;
    if(elapsedMinutes <= 0) return 0;
    return Math.floor(earnedWeight / elapsedMinutes);
  };

  // Load random text based on difficulty
  const loadText = () => {
    const textArray = texts[difficulty as keyof typeof texts];
    const randomIndex = Math.floor(Math.random() * textArray.length);
    setCurrentText(textArray[randomIndex]);
  };

  // Update WPM and accuracy in real-time
  const updateStats = () => {
    if (!isActive) return;
    
    let correctCount = 0;
    for(let i = 0; i < userInput.length && i < currentText.length; i++) {
      if(userInput[i] === currentText[i]) correctCount++;
    }
    
    const elapsedMinutes = (60 - timeLeft) / 60;
    let standardWPM = 0;
    if(elapsedMinutes > 0 && correctCount > 0) {
      const wordsTyped = correctCount / 5; // 5 characters = 1 word
      standardWPM = Math.floor(wordsTyped / elapsedMinutes);
    }
    
    const weightedWPM = calculateWeightedWPM(currentText, userInput);
    setWpm(Math.max(standardWPM, weightedWPM) || 0);
    
    if(userInput.length > 0) {
      const acc = (correctCount / userInput.length) * 100;
      setAccuracy(Math.floor(acc));
    } else {
      setAccuracy(100);
    }
  };

  // End game and show results
  const endGame = () => {
    setIsActive(false);
    
    let correct = 0;
    for(let i = 0; i < userInput.length && i < currentText.length; i++) {
      if(userInput[i] === currentText[i]) correct++;
    }
    const finalAccuracy = userInput.length > 0 ? (correct / userInput.length) * 100 : 0;
    const finalWPM = calculateWeightedWPM(currentText, userInput);
    
    const originalWords = currentText.toLowerCase().split(/\s+/);
    const typedWords = userInput.toLowerCase().trim().split(/\s+/);
    let completedWords = 0;
    for(let i = 0; i < originalWords.length; i++) {
      if(typedWords[i] === originalWords[i]) completedWords++;
    }
    
    setFinalStats(`
      ✅ Typing Speed: ${finalWPM} WPM (weighted)
      📝 Accuracy: ${Math.floor(finalAccuracy)}%
      🎯 Words completed correctly: ${completedWords} / ${originalWords.length}
      ⌨️ Characters typed: ${userInput.length} / ${currentText.length}
    `);
    setShowResults(true);
    
    
    const testResult = {
      timestamp: Date.now(),
      wpm: finalWPM,
      accuracy: Math.floor(finalAccuracy),
      difficulty: difficulty,
      date: new Date().toLocaleString()
    };
    
    try {
      const storedHistory = localStorage.getItem('typingHistory');
      if(storedHistory) {
        const arr = JSON.parse(storedHistory);
        arr.push(testResult);
        localStorage.setItem('typingHistory', JSON.stringify(arr.slice(-5))); // Keep last 5 results
        setHistory(arr.slice(-5));
      } else {
        localStorage.setItem('typingHistory', JSON.stringify([testResult]));
        setHistory([testResult]);
      }
    } catch (error) {
      console.error('Failed to save to localStorage:', error);
    }
  };

  // Start the game
  const startGame = () => {
    // Clear existing timer
    if (timerRef.current) {
      clearInterval(timerRef.current);
      timerRef.current = null;
    }
    
    loadText();
    setUserInput('');
    setTimeLeft(60);
    setWpm(0);
    setAccuracy(100);
    setIsActive(true);
    setShowResults(false);
    
    // Focus on textarea
    setTimeout(() => {
      if (textareaRef.current) {
        textareaRef.current.focus();
      }
    }, 100);
    
    // Start countdown timer
    timerRef.current = setInterval(() => {
      setTimeLeft((prev) => {
        if (prev <= 1) {
          // Time's up
          if (timerRef.current) clearInterval(timerRef.current);
          setIsActive(false);
          return 0;
        }
        return prev - 1;
      });
    }, 1000);
  };

  
  const handleInputChange = (e: React.ChangeEvent<HTMLTextAreaElement>) => {
    if (!isActive) return;
    const value = e.target.value;
    setUserInput(value);
    
    // Auto-complete when user types all characters
    if (value.length >= currentText.length) {
      if (timerRef.current) clearInterval(timerRef.current);
      setIsActive(false);
      endGame();
    }
  };

  
  const renderHighlightedText = () => {
    if (!currentText) return null;
    
    return currentText.split('').map((char, index) => {
      let className = 'char';
      if (index < userInput.length) {
        className += userInput[index] === char ? ' correct' : ' incorrect';
      }
      if (index === userInput.length && isActive && timeLeft > 0) {
        className += ' current';
      }
      return (
        <span key={index} className={className}>
          {char}
        </span>
      );
    });
  };

 useEffect(() => {
    try {
      const storedHistory = localStorage.getItem('typingHistory');
      if (storedHistory) {
        setHistory(JSON.parse(storedHistory));
      }
    } catch (error) {
      console.error('Failed to load history:', error);
    }
  }, []);

  // Update stats when userInput or timeLeft changes
  useEffect(() => {
    if (isActive) {
      updateStats();
    }
  }, [userInput, timeLeft, isActive]);

  // Load new text when difficulty changes
  useEffect(() => {
    if (!isActive) {
      loadText();
    }
  }, [difficulty]);

  useEffect(() => {
    return () => {
      if (timerRef.current) clearInterval(timerRef.current);
    };
  }, []);

  // Auto-end game when time reaches 0
  useEffect(() => {
    if (timeLeft === 0 && isActive) {
      endGame();
    }
  }, [timeLeft]);

  return (
    <div className="game-container">
      <h1>⚡ SPEED TYPING ARENA ⚡</h1>
      
      <div className="controls">
        <div className="difficulty-selector">
          <label>📊 Difficulty:</label>
          <select 
            value={difficulty} 
            onChange={(e) => setDifficulty(e.target.value)}
            disabled={isActive}
          >
            <option value="easy">🌟 Easy - Simple Words</option>
            <option value="medium" selected>⚡ Medium - Mixed</option>
            <option value="hard">🔥 Hard - Complex Text</option>
          </select>
        </div>
        
        <div className="stats">
          <div className="stat">
            <div className="stat-value">{timeLeft}</div>
            <div className="stat-label">Seconds</div>
          </div>
          <div className="stat">
            <div className="stat-value">{wpm}</div>
            <div className="stat-label">WPM</div>
          </div>
          <div className="stat">
            <div className="stat-value">{accuracy}</div>
            <div className="stat-label">Accuracy %</div>
          </div>
        </div>
        
        <button onClick={startGame} disabled={isActive}>
           START TEST
        </button>
      </div>
      
      <div className="text-display">
        <div className="reference-text">
          {renderHighlightedText()}
        </div>
      </div>
      
      <div className="input-area">
        <textarea
          ref={textareaRef}
          value={userInput}
          onChange={handleInputChange}
          placeholder={isActive ? "Start typing here..." : "Click START to begin the test..."}
          disabled={!isActive}
          rows={5}
        />
      </div>
      
      {showResults && (
        <div className="results">
          <h3>📊 Test Complete!</h3>
          <p style={{ whiteSpace: 'pre-line' }}>{finalStats}</p>
          <div className="accuracy-bar">
            <div 
              className="accuracy-fill" 
              style={{ width: `${accuracy}%` }}
            />
          </div>
          {history.length > 0 && (
            <div style={{ marginTop: '15px', fontSize: '12px', color: '#aaa' }}>
              🏆 Last Score: {history[history.length-1]?.wpm} WPM | {history[history.length-1]?.accuracy}% Accuracy
            </div>
          )}
        </div>
      )}
    </div>
  );
}