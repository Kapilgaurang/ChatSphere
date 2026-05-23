import {
  useEffect,
  useState,
  useRef,
} from 'react'

import io from 'socket.io-client'

import EmojiPicker from 'emoji-picker-react'

const socket = io('http://localhost:5000')

function App() {
  const [username, setUsername] = useState('')
  const [joined, setJoined] = useState(false)

  const [message, setMessage] = useState('')
  const [messages, setMessages] = useState([])

  const [image, setImage] = useState(null)

  const [typingUser, setTypingUser] =
    useState('')

  const [onlineUsers, setOnlineUsers] =
    useState([])

  const [
    showEmojiPicker,
    setShowEmojiPicker,
  ] = useState(false)

  const [darkMode, setDarkMode] =
    useState(true)

  const messagesEndRef = useRef(null)

  // Load old messages
  useEffect(() => {
    fetch('http://localhost:5000/messages')
      .then((res) => res.json())
      .then((data) => setMessages(data))
      .catch((err) =>
        console.log(
          'Fetch Error:',
          err
        )
      )
  }, [])

  // Socket listeners
  useEffect(() => {
    socket.on('receive_message', (data) => {
      setMessages((prev) => [...prev, data])
    })

    socket.on('user_typing', (name) => {
      setTypingUser(name)

      setTimeout(() => {
        setTypingUser('')
      }, 1500)
    })

    socket.on(
      'online_users',
      (users) => {
        setOnlineUsers(users)
      }
    )

    return () => {
      socket.off('receive_message')
      socket.off('user_typing')
      socket.off('online_users')
    }
  }, [])

  // Auto scroll
  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({
      behavior: 'smooth',
    })
  }, [messages])

  // Send message
  const sendMessage = () => {
    if (
      message.trim() === '' &&
      !image
    )
      return

    const newMessage = {
      sender: username,
      text: message,
      time: new Date().toLocaleTimeString(),
      image: image,
    }

    socket.emit(
      'send_message',
      newMessage
    )

    setMessages((prev) => [
      ...prev,
      newMessage,
    ])

    setMessage('')
    setImage(null)
  }

  // Typing
  const handleTyping = (e) => {
    setMessage(e.target.value)

    if (username.trim() !== '') {
      socket.emit(
        'typing',
        username
      )
    }
  }

  // Emoji
  const onEmojiClick = (emojiData) => {
    setMessage(
      (prev) => prev + emojiData.emoji
    )
  }

  // Image Upload
  const handleImage = (e) => {
    const file = e.target.files[0]

    const reader = new FileReader()

    reader.onloadend = () => {
      setImage(reader.result)
    }

    if (file) {
      reader.readAsDataURL(file)
    }
  }

  // Join screen
  if (!joined) {
    return (
      <div
        style={{
          height: '100vh',
          backgroundColor: darkMode
            ? '#0f172a'
            : '#e2e8f0',

          display: 'flex',
          justifyContent: 'center',
          alignItems: 'center',
          fontFamily: 'Arial',
        }}
      >
        <div
          style={{
            backgroundColor: darkMode
              ? '#1e293b'
              : 'white',

            padding: '40px',
            borderRadius: '20px',
            width: '400px',
            textAlign: 'center',
          }}
        >
          <h1
            style={{
              color: darkMode
                ? 'white'
                : '#0f172a',
            }}
          >
            Welcome to ChatSphere 🚀
          </h1>

          <button
            onClick={() =>
              setDarkMode(!darkMode)
            }
            style={{
              marginTop: '10px',
              padding: '8px 14px',
              borderRadius: '8px',
              border: 'none',
              cursor: 'pointer',
              backgroundColor: '#3b82f6',
              color: 'white',
            }}
          >
            {darkMode
              ? '☀ Light'
              : '🌙 Dark'}
          </button>

          <input
            type="text"
            placeholder="Enter your name"
            value={username}
            onChange={(e) =>
              setUsername(e.target.value)
            }
            style={{
              width: '100%',
              padding: '15px',
              borderRadius: '10px',
              border: 'none',
              marginTop: '20px',
              fontSize: '16px',
            }}
          />

          <button
            onClick={() => {
              if (
                username.trim() !== ''
              ) {
                setJoined(true)

                socket.emit(
                  'join',
                  username
                )

                console.log(
                  'Joined as:',
                  username
                )
              }
            }}
            style={{
              width: '100%',
              padding: '15px',
              marginTop: '20px',
              backgroundColor: '#3b82f6',
              color: 'white',
              border: 'none',
              borderRadius: '10px',
              cursor: 'pointer',
              fontWeight: 'bold',
            }}
          >
            Join Chat
          </button>
        </div>
      </div>
    )
  }

  return (
    <div
      style={{
        height: '100vh',
        backgroundColor: darkMode
          ? '#0f172a'
          : '#e2e8f0',

        display: 'flex',
        justifyContent: 'center',
        alignItems: 'center',
        padding: '20px',
        fontFamily: 'Arial',
      }}
    >
      <div
        style={{
          width: '100%',
          maxWidth: '1100px',
          height: '80vh',

          backgroundColor: darkMode
            ? '#1e293b'
            : 'white',

          borderRadius: '20px',
          display: 'flex',
          flexDirection: 'column',
          overflow: 'hidden',
        }}
      >
        {/* Header */}
        <div
          style={{
            backgroundColor: darkMode
              ? '#020617'
              : '#cbd5e1',

            color: darkMode
              ? 'white'
              : '#0f172a',

            padding: '20px',
            borderBottom:
              '1px solid #334155',
          }}
        >
          <div
            style={{
              fontSize: '30px',
              fontWeight: 'bold',
            }}
          >
            ChatSphere
          </div>

          <div
            style={{
              color: '#22c55e',
              fontSize: '14px',
              marginTop: '5px',
            }}
          >
            ● Online
          </div>

          <div
            style={{
              marginTop: '10px',
              fontSize: '14px',
            }}
          >
            Online Users:
            {onlineUsers.length > 0
              ? ` ${onlineUsers.join(
                  ', '
                )}`
              : ' No users online'}
          </div>

          <button
            onClick={() =>
              setDarkMode(!darkMode)
            }
            style={{
              marginTop: '10px',
              padding: '8px 14px',
              borderRadius: '8px',
              border: 'none',
              cursor: 'pointer',
              backgroundColor: '#3b82f6',
              color: 'white',
            }}
          >
            {darkMode
              ? '☀ Light'
              : '🌙 Dark'}
          </button>
        </div>

        {/* Messages */}
        <div
          style={{
            flex: 1,
            padding: '20px',
            overflowY: 'auto',
            display: 'flex',
            flexDirection: 'column',
            backgroundColor: darkMode
              ? '#1e293b'
              : '#f8fafc',
          }}
        >
          {messages.length === 0 && (
            <div
              style={{
                color: '#94a3b8',
                textAlign: 'center',
                marginTop: '50px',
                fontSize: '18px',
              }}
            >
              Start chatting now 🚀
            </div>
          )}

          {messages.map((msg, index) => {
            const isMyMessage =
              msg.sender === username

            return (
              <div
                key={index}
                style={{
                  alignSelf: isMyMessage
                    ? 'flex-end'
                    : 'flex-start',

                  backgroundColor: isMyMessage
                    ? '#3b82f6'
                    : '#475569',

                  color: 'white',
                  padding: '12px 16px',
                  borderRadius: '16px',
                  marginBottom: '12px',
                  maxWidth: '70%',
                }}
              >
                <div
                  style={{
                    fontSize: '13px',
                    marginBottom: '5px',
                    opacity: 0.7,
                  }}
                >
                  {msg.sender}
                </div>

                <div>{msg.text}</div>

                {msg.image && (
                  <img
                    src={msg.image}
                    alt="shared"
                    style={{
                      width: '200px',
                      marginTop: '10px',
                      borderRadius: '10px',
                    }}
                  />
                )}

                <div
                  style={{
                    fontSize: '11px',
                    marginTop: '6px',
                    opacity: 0.8,
                    textAlign: 'right',
                  }}
                >
                  {msg.time}
                </div>
              </div>
            )
          })}

          {typingUser &&
            typingUser !== username && (
              <div
                style={{
                  color: '#94a3b8',
                  fontSize: '14px',
                  marginTop: '10px',
                }}
              >
                {typingUser} is typing...
              </div>
            )}

          <div ref={messagesEndRef}></div>
        </div>

        {/* Input */}
        <div
          style={{
            display: 'flex',
            padding: '20px',
            backgroundColor: darkMode
              ? '#020617'
              : '#cbd5e1',

            borderTop: '1px solid #334155',
            position: 'relative',
          }}
        >
          {/* Emoji Picker */}
          {showEmojiPicker && (
            <div
              style={{
                position: 'absolute',
                bottom: '90px',
                left: '20px',
              }}
            >
              <EmojiPicker
                onEmojiClick={onEmojiClick}
              />
            </div>
          )}

          {/* Emoji Button */}
          <button
            onClick={() =>
              setShowEmojiPicker(
                !showEmojiPicker
              )
            }
            style={{
              marginRight: '10px',
              fontSize: '24px',
              background: 'none',
              border: 'none',
              cursor: 'pointer',
            }}
          >
            😀
          </button>

          {/* Image Upload */}
          <label
            style={{
              cursor: 'pointer',
              fontSize: '24px',
              marginRight: '10px',
            }}
          >
            📷

            <input
              type="file"
              accept="image/*"
              onChange={handleImage}
              style={{
                display: 'none',
              }}
            />
          </label>

          {/* Input */}
          <input
            type="text"
            placeholder="Type your message..."
            value={message}
            onChange={handleTyping}
            onKeyDown={(e) =>
              e.key === 'Enter' &&
              sendMessage()
            }
            style={{
              flex: 1,
              padding: '15px',
              borderRadius: '12px',
              border: 'none',
              outline: 'none',
              fontSize: '16px',
            }}
          />

          {/* Send */}
          <button
            onClick={sendMessage}
            style={{
              marginLeft: '12px',
              padding: '15px 28px',
              backgroundColor: '#3b82f6',
              color: 'white',
              border: 'none',
              borderRadius: '12px',
              cursor: 'pointer',
              fontWeight: 'bold',
            }}
          >
            Send
          </button>
        </div>
      </div>
    </div>
  )
}

export default App