import React, { useState } from 'react';
import { ReactMic } from 'react-mic';
import axios from 'axios';

const ChatApp = () => {
  const OPENAI_API_KEY = 'Your open api key';
  const [isRecording, setIsRecording] = useState(false);
  const [messages, setMessages] = useState([]);
  const [textInput, setTextInput] = useState('');

  const startRecording = () => {
    setIsRecording(true);
  };

  const stopRecording = () => {
    setIsRecording(false);
  };

  const onStop = async (recordedBlob) => {
    console.log('Recorded Blob 2:', recordedBlob);
    const transcript = await transcribeAudio(recordedBlob.blob);
    addMessage('user', transcript);
    await generateBlogPost(transcript);
  };

  const transcribeAudio = async (audioBlob) => {
    const formData = new FormData();
    formData.append('file', audioBlob, 'audio.webm');
    formData.append('model', 'whisper-1');

    try {
      const response = await axios.post('https://api.openai.com/v1/audio/transcriptions', formData, {
        headers: {
          'Authorization': `Bearer ${OPENAI_API_KEY}`,
          'Content-Type': 'multipart/form-data',
        },
      });
      return response.data.text;
    } catch (error) {
      console.error('Error transcribing audio:', error);
      return 'Erreur lors de la transcription';
    }
  };

  const generateBlogPost = async (transcript) => {
    const prompt = `Écris-moi un article de blog à partir de la transcription suivante :`;

    try {
      const response = await axios.post('https://api.openai.com/v1/chat/completions', {
        model: 'gpt-4',
        messages: [
          { role: 'system', content: 'You are a helpful assistant.' },
          { role: 'user', content: `${prompt}\n\nTranscription: ${transcript}` },
        ],
        max_tokens: 500,
      }, {
        headers: {
          'Authorization': `Bearer ${OPENAI_API_KEY}`,
          'Content-Type': 'application/json',
        },
      });

      const blogPost = response.data.choices[0].message.content;
      addMessage('ai', blogPost);
    } catch (error) {
      console.error('Error generating blog post:', error);
      addMessage('ai', 'Erreur lors de la génération de l’article de blog.');
    }
  };

  const sendMessage = async () => {
    if (!textInput.trim()) return;

    addMessage('user', textInput);
    const response = await getAIResponse(textInput);
    addMessage('ai', response);
    setTextInput('');
  };

  const getAIResponse = async (message) => {
    // Mock AI response for now
    return 'Mock AI response to: ' + message;
  };

  const addMessage = (role, content) => {
    setMessages((prevMessages) => [...prevMessages, { role, content }]);
  };

  return (
    <div className="chat-app">
      <div className="chat-history">
        {messages.map((msg, index) => (
          <div key={index} className={`message ${msg.role}`}>
            {msg.content}
          </div>
        ))}
      </div>
      <div className="controls">
        <ReactMic
          record={isRecording}
          className="sound-wave"
          onStop={onStop}
          strokeColor="#000000"
          backgroundColor="#FF4081"
        />
        <button onClick={startRecording}>Enregistrer</button>
        <button onClick={stopRecording}>Arrêter</button>
      </div>
      <div className="text-input">
        <input
          type="text"
          value={textInput}
          onChange={(e) => setTextInput(e.target.value)}
          placeholder="Écrivez un message..."
        />
        <button onClick={sendMessage}>Envoyer</button>
      </div>
    </div>
  );
};

export default ChatApp;