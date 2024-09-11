import React, { useState } from 'react';
import { Chart as ChartJS, CategoryScale, LinearScale, BarElement, Title, Tooltip, Legend } from 'chart.js';
import { Bar } from 'react-chartjs-2';
import logo from './assets/logo.svg';
import './assets/styles/App.css';
import '@chatscope/chat-ui-kit-styles/dist/default/styles.min.css';
import { MainContainer, ChatContainer, MessageList, Message, MessageInput, TypingIndicator } from '@chatscope/chat-ui-kit-react';

const API_KEY = 'sk-proj-KfkkFJ7mxAe1eTjRjY5zT3BlbkFJYhx21Cx5nRjaF8a9EMqf';


ChartJS.register(CategoryScale, LinearScale, BarElement, Title, Tooltip, Legend);

function App() {
  const [typing, setTyping] = useState(false);
  const [messages, setMessages] = useState([
    {
      message: "Hello, I am ChatGPT",
      sender: "ChatGPT",
      direction: "ingoing"
    }
  ]);
  const [userMessageCount, setUserMessageCount] = useState(0);

  const handleSend = async (message) => {
    const newMessage = {
      message: message,
      sender: "User",
      direction: "outgoing"
    };

    const newMessages = [...messages, newMessage];

    setMessages(newMessages);
    setTyping(true);
    setUserMessageCount(userMessageCount + 1);

    await processMessageToChatGPT(newMessages);
  };

  async function processMessageToChatGPT(chatMessages) {
    let apiMessages = chatMessages.map((messageObject) => {
      let role = "";
      if (messageObject.sender === "ChatGPT") {
        role = "assistant";
      } else {
        role = "user";
      }
      return { role: role, content: messageObject.message };
    });

    const systemMessage = {
      role: "system",
      content: "Explain all concepts like I am 10 years old."
    };

    const apiRequestBody = {
      "model": "gpt-3.5-turbo",
      "messages": [
        systemMessage,
        ...apiMessages
      ]
    };

    await fetch("https://api.openai.com/v1/chat/completions", {
      method: "POST",
      headers: {
        "Authorization": "Bearer " + API_KEY,
        "Content-Type": "application/json"
      },
      body: JSON.stringify(apiRequestBody)
    }).then((data) => {
      return data.json();
    }).then((data) => {
      setMessages(
        [...chatMessages, {
          message: data.choices[0].message.content,
          sender: "ChatGPT"
        }]
      );
      setTyping(false);
    });
  }

  const data = {
    labels: ['User Messages'],
    datasets: [
      {
        label: 'Messages Sent',
        data: [userMessageCount],
        backgroundColor: ['rgba(75, 192, 192, 0.2)'],
        borderColor: ['rgba(75, 192, 192, 1)'],
        borderWidth: 1
      }
    ]
  };

  const options = {
    scales: {
      y: {
        ticks: {
          stepSize: 1
        }
      }
    }
  };

  return (
    <div className="App">
      <div className="main-wrapper" style={{ display: 'flex', width: '50%' }}>
        <div className="chat-wrapper" style={{ flex: 1 }}>
          <MainContainer>
            <ChatContainer>
              <MessageList typingIndicator={typing ? <TypingIndicator content="ChatGPT is typing" /> : null}>
                {messages.map((message, i) => {
                  return <Message key={i} model={message} />;
                })}
              </MessageList>
              <MessageInput placeholder='Type Message Here' onSend={handleSend} />
            </ChatContainer>
          </MainContainer>
        </div>
        <div className="chart-wrapper" style={{ width: '300px', marginLeft: '20px' }}>
          <Bar data={data} options={options} />
        </div>
      </div>
    </div>
  );
}

export default App;

