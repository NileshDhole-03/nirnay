import React, { useState } from 'react';
import ReactMarkdown from 'react-markdown';
import remarkMath from 'remark-math';
import rehypeKatex from 'rehype-katex';
import 'katex/dist/katex.min.css';

const restoreMangledLatex = (str) => {
  if (!str) return '';
  let s = str
    .replace(/[\x08]/g, '\\b')   // backspace → \b
    .replace(/\t/g, '\\t')       // tab → \t
    .replace(/\f/g, '\\f')       // form feed → \f
    .replace(/\r/g, '\\r')       // carriage return → \r
    .replace(/\v/g, '\\v')       // vertical tab → \v
    .replace(/\0/g, '')          // null bytes → remove
    .replace(/\\u([0-9a-fA-F]{4})/g, (match, p1) => String.fromCharCode(parseInt(p1, 16))); // Decode literal \uXXXX sequences

  return s;
};

const QuestionBlock = ({ question, index }) => {
  const [selectedOption, setSelectedOption] = useState('');
  const [showSolution, setShowSolution] = useState(false);

  const handleCheckAnswer = () => {
    setShowSolution(!showSolution);
  };

  return (
    <div className="bg-gray-900 border border-gray-800 rounded-xl p-6 mb-8 shadow-lg">
      <div className="flex items-start gap-4 mb-6">
        <div className="flex-shrink-0 bg-white text-black font-bold w-10 h-10 flex items-center justify-center text-lg">
          {index + 1}
        </div>
        <div className="pt-1 text-lg text-gray-200">
          <ReactMarkdown
            remarkPlugins={[remarkMath]}
            rehypePlugins={[rehypeKatex]}
            components={{ p: ({node, ...props}) => <span {...props} /> }}
          >
            {restoreMangledLatex(question.questionText)}
          </ReactMarkdown>
        </div>
      </div>

      <div className="flex flex-col gap-3 pl-14 mb-8">
        {question.options.map((option, idx) => {
          const isSelected = selectedOption === option;
          const isCorrect = showSolution && option === question.correctAnswer;
          const isWrong = showSolution && isSelected && !isCorrect;

          let optionStyle = "border-gray-700 bg-gray-800 text-gray-300 hover:bg-gray-750 hover:border-white/50 cursor-pointer";

          if (isSelected && !showSolution) {
            optionStyle = "border-white bg-white/10 text-white";
          } else if (showSolution && isCorrect) {
            optionStyle = "border-green-500 bg-green-500/20 text-green-400";
          } else if (showSolution && isWrong) {
            optionStyle = "border-red-500 bg-red-500/20 text-red-400";
          }

          return (
            <label 
              key={idx} 
              className={`flex items-center gap-4 p-4 rounded-lg border transition-all duration-200 ${optionStyle}`}
            >
              <input
                type="radio"
                name={`question-${question._id}`}
                value={option}
                checked={isSelected}
                onChange={() => setSelectedOption(option)}
                disabled={showSolution}
                className="radio radio-sm border-gray-600 checked:bg-white checked:border-white"
              />
              <span className="text-md">
                <ReactMarkdown
                  remarkPlugins={[remarkMath]}
                  rehypePlugins={[rehypeKatex]}
                  components={{ p: ({node, ...props}) => <span {...props} /> }}
                >
                  {restoreMangledLatex(option)}
                </ReactMarkdown>
              </span>
            </label>
          );
        })}
      </div>

      <div className="pl-14">
        <button 
          onClick={handleCheckAnswer}
          className="bg-white text-black font-bold text-sm tracking-widest uppercase px-6 py-3 border-none hover:bg-gray-200 transition-colors duration-200 cursor-pointer"
        >
          {showSolution ? 'Hide Solution' : 'Check Answer / Show Solution'}
        </button>

        {showSolution && (
          <div className="mt-6 bg-gray-800/50 border border-gray-700 rounded-lg p-5 animate-fade-in-down">
            <h4 className="text-white font-bold mb-2 flex items-center gap-2">
              <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" viewBox="0 0 20 20" fill="currentColor">
                <path fillRule="evenodd" d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7-4a1 1 0 11-2 0 1 1 0 012 0zM9 9a1 1 0 000 2v3a1 1 0 001 1h1a1 1 0 100-2v-3a1 1 0 00-1-1H9z" clipRule="evenodd" />
              </svg>
              Solution
            </h4>
            <div className="text-gray-300 whitespace-pre-wrap leading-relaxed">
              <span className="font-semibold flex flex-row items-center gap-2 mb-2 text-white">
                <span>Correct Answer:</span>
                <ReactMarkdown
                  remarkPlugins={[remarkMath]}
                  rehypePlugins={[rehypeKatex]}
                  components={{ p: ({node, ...props}) => <span {...props} /> }}
                >
                  {restoreMangledLatex(question.correctAnswer)}
                </ReactMarkdown>
              </span>
              <div className="explanation-content mt-4 border-t border-gray-700/50 pt-4 text-sm sm:text-base leading-loose text-gray-300">
                <ReactMarkdown
                  remarkPlugins={[remarkMath]}
                  rehypePlugins={[rehypeKatex]}
                  components={{
                    p: ({node, ...props}) => <p className="mb-4" {...props} />,
                    strong: ({node, ...props}) => <strong className="text-white font-semibold" {...props} />
                  }}
                >
                  {restoreMangledLatex(question.explanation)}
                </ReactMarkdown>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default QuestionBlock;
