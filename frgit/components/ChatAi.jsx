import { useState, useRef, useEffect } from "react";
import { useForm } from "react-hook-form";
import axiosClient from "../utils/axiosClient";
import { Send, Bot, User, Loader2, RotateCcw, Sparkles, Code2 } from 'lucide-react';
import ReactMarkdown from 'react-markdown';

const DEFAULT_MESSAGE = {
    role: 'model',
    parts: [{ text: "**Hello!** I'm ready to help you ask questions about your code." }]
};

function ChatAi({ problem, editorRef }) {
    const [messages, setMessages] = useState([DEFAULT_MESSAGE]);
    const [isLoading, setIsLoading] = useState(false);
    const [historyLoaded, setHistoryLoaded] = useState(false);

    const { register, handleSubmit, reset, formState: { errors } } = useForm();
    const messagesEndRef = useRef(null);

    // Load chat history from database on mount
    useEffect(() => {
        const loadHistory = async () => {
            if (!problem?._id || historyLoaded) return;

            try {
                const response = await axiosClient.get(`/ai/history/${problem._id}`);
                if (response.data.messages && response.data.messages.length > 0) {
                    setMessages(response.data.messages);
                }
            } catch (error) {
                console.error("Error loading chat history:", error);
                // Keep default message on error
            } finally {
                setHistoryLoaded(true);
            }
        };

        loadHistory();
    }, [problem?._id, historyLoaded]);

    useEffect(() => {
        messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
    }, [messages, isLoading]);

    // Clear chat history from database
    const handleClearChat = async () => {
        setMessages([{ role: 'model', parts: [{ text: "Chat cleared. How can I help?" }] }]);

        if (problem?._id) {
            try {
                await axiosClient.delete(`/ai/history/${problem._id}`);
            } catch (error) {
                console.error("Error clearing chat history:", error);
            }
        }
    };

    const onSubmit = async (data) => {
        const userText = data.message;
        const currentCode = editorRef?.current ? editorRef.current.getValue() : "";

        const newMessage = { role: 'user', parts: [{ text: userText }] };
        const updatedHistory = [...messages, newMessage];

        setMessages(prev => [...prev, newMessage]);
        reset();
        setIsLoading(true);

        try {
            const response = await axiosClient.post("/ai/chat", {
                messages: updatedHistory,
                title: problem.title,
                description: problem.description,
                testCases: problem.visibleTestCases,
                startCode: problem.startCode,
                userCode: currentCode,
                problemId: problem._id  // Send problemId for DB storage
            });

            setMessages(prev => [...prev, {
                role: 'model',
                parts: [{ text: response.data.message }]
            }]);
        } catch (error) {
            console.error("API Error:", error);
            setMessages(prev => [...prev, {
                role: 'model',
                parts: [{ text: "Error: Could not connect to server." }]
            }]);
        } finally {
            setIsLoading(false);
        }
    };

    return (
        // Main Container: Deep Dark Background
        <div className="flex flex-col h-full bg-[#131314] font-sans text-sm relative">

            {/* Header: Nirnay Assistant */}
            <div className="h-14 flex items-center justify-between px-6 bg-[#131314] border-b border-[#333537] z-10">
                <span className="font-medium text-[#E3E3E3] flex items-center gap-2">
                    {/* Logo Icon */}
                    <div className="w-6 h-6 bg-blue-600 rounded-md flex items-center justify-center">
                        <Code2 size={14} className="text-white" strokeWidth={2.5} />
                    </div>
                    <span className="text-lg font-semibold tracking-tight text-white">
                        Nirnay Assistant
                    </span>
                </span>
                <button
                    onClick={() => {
                        setMessages([{ role: 'model', parts: [{ text: "Chat cleared. How can I help?" }] }]);
                        if (storageKey) localStorage.removeItem(storageKey);
                    }}
                    className="p-2 rounded-full hover:bg-[#282A2C] text-[#C4C7C5] transition-all duration-200"
                    title="Clear Chat"
                >
                    <RotateCcw size={16} />
                </button>
            </div>

            {/* Messages Container */}
            <div className="flex-1 overflow-y-auto px-4 py-4 space-y-6 scrollbar-thin scrollbar-thumb-[#444746] scrollbar-track-transparent">
                {messages.map((msg, index) => {
                    const isUser = msg.role === "user";
                    return (
                        <div key={index} className={`flex gap-4 ${isUser ? "flex-row-reverse" : "flex-row"}`}>

                            {/* Avatar */}
                            <div className={`w-8 h-8 rounded-full flex items-center justify-center flex-shrink-0 mt-1 shadow-sm border border-transparent
                                ${isUser ? "bg-[#C4C7C5] text-[#131314]" : "bg-[#1E1F20] text-blue-400 border-[#333537]"}`}>
                                {isUser ? <User size={18} /> : <Sparkles size={16} />}
                            </div>

                            {/* Message Box */}
                            <div className={`flex-1 max-w-[90%]`}>
                                <div className={`inline-block px-5 py-4 leading-relaxed shadow-sm
                                    ${isUser
                                        ? "bg-[#282A2C] text-[#E3E3E3] rounded-[20px] rounded-tr-sm"
                                        : "bg-[#1E1F20] text-[#E3E3E3] rounded-[20px] rounded-tl-sm border border-[#333537]" // AI Box Style
                                    }`}>
                                    <div className="prose prose-invert max-w-none
                                        prose-p:text-[#E3E3E3] prose-p:leading-7
                                        prose-headings:text-white prose-headings:font-semibold prose-headings:mb-2 prose-headings:mt-4
                                        prose-strong:text-white
                                        prose-code:bg-[#000000]/30 prose-code:text-[#A8C7FA] prose-code:px-1.5 prose-code:py-0.5 prose-code:rounded-md prose-code:font-mono prose-code:text-[13px]
                                        prose-pre:bg-[#000000]/50 prose-pre:border prose-pre:border-[#444746] prose-pre:rounded-xl prose-pre:p-3
                                        prose-ul:my-2 prose-li:my-1
                                        ">
                                        <ReactMarkdown>{msg.parts[0].text}</ReactMarkdown>
                                    </div>
                                </div>
                            </div>
                        </div>
                    );
                })}

                {/* Loading State */}
                {isLoading && (
                    <div className="flex gap-4">
                        <div className="w-8 h-8 rounded-full bg-[#1E1F20] border border-[#333537] flex items-center justify-center mt-1">
                            <Sparkles size={16} className="text-blue-400 animate-pulse" />
                        </div>
                        <div className="flex items-center gap-2 text-[#C4C7C5] text-sm py-2 px-4 bg-[#1E1F20] rounded-full border border-[#333537]">
                            <Loader2 size={14} className="animate-spin" />
                            <span>Nirnay is thinking...</span>
                        </div>
                    </div>
                )}
                <div ref={messagesEndRef} />
            </div>

            {/* Input Area */}
            <div className="p-4 bg-[#131314] border-t border-[#333537]">
                <div className="relative max-w-4xl mx-auto bg-[#1E1F20] rounded-[24px] p-2 pl-5 flex items-end gap-2 border border-[#444746]/50 focus-within:bg-[#282A2C] focus-within:border-[#5E5E5E] transition-all duration-300 shadow-lg">
                    <textarea
                        placeholder="Ask Nirnay about your code..."
                        className="flex-1 bg-transparent border-none focus:ring-0 p-2 text-[15px] min-h-[44px] max-h-[140px] resize-none text-[#E3E3E3] placeholder-[#8E918F] scrollbar-hide"
                        rows="1"
                        onKeyDown={(e) => {
                            if (e.key === 'Enter' && !e.shiftKey) {
                                e.preventDefault();
                                handleSubmit(onSubmit)();
                            }
                        }}
                        {...register("message", { required: true })}
                    />
                    <button
                        onClick={handleSubmit(onSubmit)}
                        disabled={isLoading || errors.message}
                        className="w-10 h-10 mb-1 mr-1 rounded-full bg-blue-600 hover:bg-blue-500 text-white disabled:bg-[#444746] disabled:text-[#8E918F] transition-all flex items-center justify-center flex-shrink-0 shadow-md"
                    >
                        {isLoading ? <Loader2 size={18} className="animate-spin" /> : <Send size={18} className="ml-0.5" />}
                    </button>
                </div>
                <div className="text-center mt-3 text-[11px] text-[#8E918F]">
                    Nirnay can make mistakes. Please verify important coding logic.
                </div>
            </div>
        </div>
    );
}

export default ChatAi;