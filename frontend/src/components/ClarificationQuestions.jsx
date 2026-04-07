import { useState } from "react";
import { HelpCircle, ChevronRight, CheckCircle2, AlertCircle } from "lucide-react";
import { Button } from "./ui/button";
import { motion, AnimatePresence } from "framer-motion";

export const ClarificationQuestions = ({ 
  questions = [], 
  onAnswer, 
  onSkip,
  productDescription 
}) => {
  const [answers, setAnswers] = useState({});
  const [currentIndex, setCurrentIndex] = useState(0);

  if (!questions || questions.length === 0) {
    return null;
  }

  const currentQuestion = questions[currentIndex];
  const isLastQuestion = currentIndex === questions.length - 1;
  const hasAnsweredCurrent = answers[currentIndex] !== undefined;

  const handleOptionSelect = (option) => {
    setAnswers({ ...answers, [currentIndex]: option });
  };

  const handleNext = () => {
    if (isLastQuestion) {
      // Build clarified description
      const clarifications = Object.entries(answers)
        .map(([idx, answer]) => `${questions[parseInt(idx)].question.replace("¿", "").replace("?", "")}: ${answer}`)
        .join(". ");
      
      const clarifiedDescription = `${productDescription}. Detalles adicionales: ${clarifications}`;
      onAnswer(clarifiedDescription, answers);
    } else {
      setCurrentIndex(currentIndex + 1);
    }
  };

  const handleSkip = () => {
    if (onSkip) {
      onSkip();
    }
  };

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      className="cyber-card p-6 border-l-4 border-l-amber-400"
      data-testid="clarification-questions"
    >
      <div className="flex items-start gap-3 mb-4">
        <div className="w-10 h-10 bg-amber-500/20 rounded-lg flex items-center justify-center flex-shrink-0">
          <HelpCircle className="w-5 h-5 text-amber-400" />
        </div>
        <div>
          <h3 className="font-semibold text-amber-400 mb-1">
            Información adicional requerida
          </h3>
          <p className="text-gray-400 text-sm">
            Para darte un código TARIC más preciso, necesitamos algunos detalles adicionales
          </p>
        </div>
      </div>

      {/* Progress indicator */}
      <div className="flex items-center gap-2 mb-6">
        {questions.map((_, idx) => (
          <div
            key={idx}
            className={`h-1 flex-1 rounded-full transition-colors ${
              idx < currentIndex
                ? "bg-green-400"
                : idx === currentIndex
                ? "bg-cyan-400"
                : "bg-gray-700"
            }`}
          />
        ))}
        <span className="text-xs text-gray-500 ml-2">
          {currentIndex + 1} / {questions.length}
        </span>
      </div>

      {/* Current Question */}
      <AnimatePresence mode="wait">
        <motion.div
          key={currentIndex}
          initial={{ opacity: 0, x: 20 }}
          animate={{ opacity: 1, x: 0 }}
          exit={{ opacity: 0, x: -20 }}
          className="space-y-4"
        >
          <div className="flex items-start gap-2">
            <AlertCircle className="w-5 h-5 text-cyan-400 flex-shrink-0 mt-0.5" />
            <div>
              <p className="text-white font-medium">{currentQuestion.question}</p>
              {currentQuestion.impacts && (
                <p className="text-gray-500 text-xs mt-1">
                  {currentQuestion.impacts}
                </p>
              )}
            </div>
          </div>

          {/* Options */}
          <div className="grid grid-cols-2 gap-2">
            {currentQuestion.options.map((option, idx) => (
              <button
                key={idx}
                type="button"
                onClick={() => handleOptionSelect(option)}
                className={`p-3 rounded-lg border text-left transition-all ${
                  answers[currentIndex] === option
                    ? "bg-cyan-500/20 border-cyan-500/50 text-cyan-400"
                    : "bg-[#0a0f1a] border-cyan-500/10 text-gray-300 hover:border-cyan-500/30"
                }`}
              >
                <div className="flex items-center gap-2">
                  {answers[currentIndex] === option && (
                    <CheckCircle2 className="w-4 h-4 text-cyan-400" />
                  )}
                  <span>{option}</span>
                </div>
              </button>
            ))}
          </div>

          {/* Actions */}
          <div className="flex items-center justify-between pt-4 border-t border-cyan-500/10">
            <Button
              type="button"
              variant="ghost"
              className="text-gray-400 hover:text-white"
              onClick={handleSkip}
            >
              Saltar preguntas
            </Button>
            <Button
              type="button"
              className="btn-cyber"
              disabled={!hasAnsweredCurrent}
              onClick={handleNext}
            >
              {isLastQuestion ? "Clasificar con detalles" : "Siguiente"}
              <ChevronRight className="w-4 h-4 ml-1" />
            </Button>
          </div>
        </motion.div>
      </AnimatePresence>
    </motion.div>
  );
};

export default ClarificationQuestions;
