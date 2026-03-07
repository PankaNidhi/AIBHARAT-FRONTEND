import { useState, useEffect, useRef } from 'react';
import { Send, MessageCircle, X, Minimize2, Maximize2, Zap } from 'lucide-react';
import EmissionsService, { FacilitySummary } from '../services/EmissionsService';
import { API_CONFIG } from '../config/api';
import BedrockChatbotService from '../services/BedrockChatbotService';
import { useProjectContext } from '../contexts/ProjectContext';

interface Message {
  id: string;
  type: 'user' | 'bot';
  content: string;
  timestamp: Date;
  analysis?: {
    sentiment: string;
    urgency: string;
    questionType: string;
    recommendations: string[];
  };
}

const SystemChatbot = () => {
  const { projects } = useProjectContext();
  const [isOpen, setIsOpen] = useState(false);
  const [isMinimized, setIsMinimized] = useState(false);
  const [messages, setMessages] = useState<Message[]>([
    {
      id: '1',
      type: 'bot',
      content: 'Hello! I\'m your AI Climate Control Assistant powered by AWS Bedrock. I analyze your facility data, emissions, projects, and alerts to provide intelligent insights. Ask me about your system status, emissions, projects, alerts, or any decarbonization strategies.',
      timestamp: new Date(),
    },
  ]);
  const [input, setInput] = useState('');
  const [loading, setLoading] = useState(false);
  const [systemData, setSystemData] = useState<FacilitySummary | null>(null);
  const messagesEndRef = useRef<HTMLDivElement>(null);

  // Fetch system data
  useEffect(() => {
    const fetchSystemData = async () => {
      const data = await EmissionsService.getFacilitySummary();
      setSystemData(data);
    };

    fetchSystemData();
    const interval = setInterval(fetchSystemData, API_CONFIG.REFRESH_INTERVAL);
    return () => clearInterval(interval);
  }, []);

  // Auto-scroll to latest message
  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages]);

  const handleSendMessage = async () => {
    if (!input.trim()) return;

    const userInput = input;

    // Add user message
    const userMessage: Message = {
      id: Date.now().toString(),
      type: 'user',
      content: userInput,
      timestamp: new Date(),
    };

    setMessages((prev) => [...prev, userMessage]);
    setInput('');
    setLoading(true);

    try {
      // Use Bedrock chatbot service with full application context
      const response = await BedrockChatbotService.sendMessage(userInput, systemData, projects);
      
      const botResponse: Message = {
        id: (Date.now() + 1).toString(),
        type: 'bot',
        content: response.textResponse,
        timestamp: new Date(),
        analysis: response.analysis,
      };
      setMessages((prev) => [...prev, botResponse]);
    } catch (error) {
      console.error('Error processing message:', error);
      const errorResponse: Message = {
        id: (Date.now() + 1).toString(),
        type: 'bot',
        content: 'I encountered an issue connecting to the AI service. I\'m using a local knowledge base to help you. Please try again or ask a simpler question.',
        timestamp: new Date(),
      };
      setMessages((prev) => [...prev, errorResponse]);
    } finally {
      setLoading(false);
    }
  };

  if (!isOpen) {
    return (
      <button
        onClick={() => setIsOpen(true)}
        className="fixed bottom-6 right-6 w-14 h-14 bg-gradient-to-r from-blue-600 to-blue-700 text-white rounded-full shadow-lg hover:shadow-xl hover:scale-110 transition-all flex items-center justify-center z-40"
        title="Open AI Assistant"
      >
        <MessageCircle size={24} />
      </button>
    );
  }

  return (
    <div className={`fixed bottom-6 right-6 w-96 bg-white rounded-lg shadow-2xl border border-gray-200 z-50 flex flex-col transition-all ${isMinimized ? 'h-14' : 'h-[600px]'}`}>
      {/* Header */}
      <div className="bg-gradient-to-r from-blue-600 to-blue-700 text-white p-4 rounded-t-lg flex items-center justify-between">
        <div className="flex items-center space-x-2">
          <Zap size={20} className="animate-pulse" />
          <div>
            <h3 className="font-semibold">AI Climate Assistant</h3>
            <p className="text-xs text-blue-100">Powered by AWS Bedrock</p>
          </div>
        </div>
        <div className="flex items-center space-x-2">
          <button
            onClick={() => setIsMinimized(!isMinimized)}
            className="hover:bg-blue-500 p-1 rounded transition-colors"
          >
            {isMinimized ? <Maximize2 size={18} /> : <Minimize2 size={18} />}
          </button>
          <button
            onClick={() => setIsOpen(false)}
            className="hover:bg-blue-500 p-1 rounded transition-colors"
          >
            <X size={18} />
          </button>
        </div>
      </div>

      {!isMinimized && (
        <>
          {/* Messages */}
          <div className="flex-1 overflow-y-auto p-4 space-y-4 bg-gray-50">
            {messages.map((message) => (
              <div
                key={message.id}
                className={`flex ${message.type === 'user' ? 'justify-end' : 'justify-start'}`}
              >
                <div
                  className={`max-w-xs px-4 py-3 rounded-lg ${
                    message.type === 'user'
                      ? 'bg-blue-600 text-white rounded-br-none'
                      : 'bg-gray-200 text-gray-900 rounded-bl-none'
                  }`}
                >
                  <p className="text-sm whitespace-pre-wrap">{message.content}</p>
                  
                  {/* Show analysis for bot messages */}
                  {message.type === 'bot' && message.analysis && (
                    <div className="mt-2 pt-2 border-t border-gray-300 text-xs space-y-1">
                      <div className="flex items-center space-x-2">
                        <span className="font-semibold">Sentiment:</span>
                        <span className={`px-2 py-0.5 rounded ${
                          message.analysis.sentiment === 'positive' ? 'bg-green-100 text-green-700' :
                          message.analysis.sentiment === 'negative' ? 'bg-red-100 text-red-700' :
                          'bg-gray-100 text-gray-700'
                        }`}>
                          {message.analysis.sentiment}
                        </span>
                      </div>
                      <div className="flex items-center space-x-2">
                        <span className="font-semibold">Urgency:</span>
                        <span className={`px-2 py-0.5 rounded ${
                          message.analysis.urgency === 'critical' ? 'bg-red-100 text-red-700' :
                          message.analysis.urgency === 'high' ? 'bg-orange-100 text-orange-700' :
                          'bg-blue-100 text-blue-700'
                        }`}>
                          {message.analysis.urgency}
                        </span>
                      </div>
                      {message.analysis.recommendations.length > 0 && (
                        <div className="mt-2">
                          <span className="font-semibold">Recommendations:</span>
                          <ul className="list-disc list-inside mt-1 space-y-0.5">
                            {message.analysis.recommendations.map((rec, idx) => (
                              <li key={idx} className="text-xs">{rec}</li>
                            ))}
                          </ul>
                        </div>
                      )}
                    </div>
                  )}
                  
                  <p className={`text-xs mt-2 ${message.type === 'user' ? 'text-blue-100' : 'text-gray-600'}`}>
                    {message.timestamp.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                  </p>
                </div>
              </div>
            ))}
            {loading && (
              <div className="flex justify-start">
                <div className="bg-gray-200 text-gray-900 px-4 py-2 rounded-lg rounded-bl-none">
                  <div className="flex space-x-2">
                    <div className="w-2 h-2 bg-gray-600 rounded-full animate-bounce"></div>
                    <div className="w-2 h-2 bg-gray-600 rounded-full animate-bounce" style={{ animationDelay: '0.1s' }}></div>
                    <div className="w-2 h-2 bg-gray-600 rounded-full animate-bounce" style={{ animationDelay: '0.2s' }}></div>
                  </div>
                </div>
              </div>
            )}
            <div ref={messagesEndRef} />
          </div>

          {/* Input */}
          <div className="border-t border-gray-200 p-4 bg-white rounded-b-lg">
            <div className="flex space-x-2">
              <input
                type="text"
                value={input}
                onChange={(e) => setInput(e.target.value)}
                onKeyPress={(e) => e.key === 'Enter' && handleSendMessage()}
                placeholder="Ask about emissions, projects, alerts..."
                className="flex-1 px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-600 text-sm"
              />
              <button
                onClick={handleSendMessage}
                disabled={loading || !input.trim()}
                className="bg-blue-600 text-white p-2 rounded-lg hover:bg-blue-700 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
              >
                <Send size={18} />
              </button>
            </div>
          </div>
        </>
      )}
    </div>
  );
};

export default SystemChatbot;
