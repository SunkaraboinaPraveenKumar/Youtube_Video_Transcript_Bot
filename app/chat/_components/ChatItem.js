import { Prism as SyntaxHighlighter } from 'react-syntax-highlighter';
import { coldarkDark } from 'react-syntax-highlighter/dist/esm/styles/prism';
import { useState, useEffect } from 'react';
import { toast } from 'sonner';
import { Copy } from 'lucide-react';

function extractCodeFromString(message) {
  if (message.includes('```')) {
    const blocks = message.split('```');
    return blocks.filter(block => block.trim() !== ''); // Filter out empty blocks
  }
  return [];
}

function isCodeBlock(str) {
  return /[=\[\]{}#;/]/.test(str) || str.includes('//');
}

const parseContent = (content) => {
  const regexLink = /(https?:\/\/[^\s]+)/g; // Regex for URLs
  const regexBold = /\*\*(.*?)\*\*/g;
  const regexList = /(\* .*?)(?=\* |$)/g;
  const regexInlineCode = /`(.*?)`/g;

  const elements = [];
  const lines = content.split('\n');

  lines.forEach((line, index) => {
    let lineContent = [];
    let lastIndex = 0;

    // Highlight links and make them clickable
    line.replace(regexLink, (match, offset) => {
      if (offset > lastIndex) {
        lineContent.push(line.slice(lastIndex, offset));
      }
      lineContent.push(
        <a
          href={match}
          target="_blank"
          rel="noopener noreferrer"
          style={{
            color: '#b3d9ff',
            textDecoration: 'none',
            transition: 'color 0.3s ease',
          }}
          onMouseEnter={(e) => (e.target.style.color = '#b3d9ff')}
          onMouseLeave={(e) => (e.target.style.color = '#b3d9ff')}
          key={match} // Ensure the key is unique
        >
          {match}
        </a>
      );
      lastIndex = offset + match.length;
    });

    // Handle bold text
    line.replace(regexBold, (match, p1, offset) => {
      if (offset > lastIndex) {
        lineContent.push(line.slice(lastIndex, offset));
      }
      lineContent.push(<strong key={`bold-${offset}`}>{p1}</strong>); // Unique key for bold
      lastIndex = offset + match.length;
    });

    // Handle inline code
    line.replace(regexInlineCode, (match, p1, offset) => {
      if (offset > lastIndex) {
        lineContent.push(line.slice(lastIndex, offset));
      }
      lineContent.push(<code key={`code-${offset}`}>{p1}</code>); // Unique key for inline code
      lastIndex = offset + match.length;
    });

    if (lastIndex < line.length) {
      lineContent.push(line.slice(lastIndex));
    }

    elements.push(
      <p key={`line-${index}`} style={{ margin: '0.5rem 0' }}>
        {lineContent.length > 0 ? lineContent : line}
      </p>
    );
  });

  return elements;
};

const ChatItem = ({ content, role }) => {
  const messageBlocks = extractCodeFromString(content);

  const [isSmallScreen, setIsSmallScreen] = useState(false);

  useEffect(() => {
    const handleResize = () => {
      setIsSmallScreen(window.innerWidth <= 600);
    };
    handleResize(); // Initial check
    window.addEventListener('resize', handleResize);
    return () => window.removeEventListener('resize', handleResize);
  }, []);

  const containerStyle = {
    display: 'flex',
    flexDirection: 'column',
    borderRadius: '8px',
    maxWidth: '100%',
    overflowWrap: 'break-word',
    wordBreak: 'break-word',
  };

  return (
    <div style={containerStyle}>
      <div style={{ display: 'flex', gap: '16px', alignItems: 'flex-start' }}>
        <div style={{ width: '100%', overflowX: 'auto' }}>
          {messageBlocks.length === 0 ? (
            <div style={{ fontSize: isSmallScreen ? '14px' : '17px', lineHeight: '1.5' }}>
              {parseContent(content)}
            </div>
          ) : (
            messageBlocks.map((block, index) =>
              isCodeBlock(block) ? (
                <div key={`code-block-${index}`} style={{ position: 'relative' }}>
                  <SyntaxHighlighter
                    style={coldarkDark}
                    language="javascript"
                    customStyle={{
                      fontSize: isSmallScreen ? '12px' : '14px',
                      whiteSpace: 'pre-wrap',
                      overflowX: 'auto',
                      padding: '8px',
                      borderRadius: '8px',
                      backgroundColor: '#2d2d2d',
                    }}
                    className='scrollbar-thin scrollbar-thumb-gray-300 scrollbar-track-gray-800'
                  >
                    {block}
                  </SyntaxHighlighter>
                  <button
                    onClick={() => {
                      navigator.clipboard.writeText(block);
                      toast('Code Copied to clipboard!');
                    }}
                    className="absolute top-2 right-2 p-2 bg-gray-700 rounded-full hover:bg-gray-600 text-white"
                    style={{
                      position: 'absolute',
                      top: '8px',
                      right: '8px',
                      zIndex: 10,
                    }}
                  >
                    <Copy size={16} />
                  </button>
                </div>
              ) : (
                <div key={`text-block-${index}`} style={{ fontSize: isSmallScreen ? '14px' : '17px', lineHeight: '1.5' }}>
                  {parseContent(block)}
                </div>
              )
            )
          )}
        </div>
      </div>
    </div>
  );
};

export default ChatItem;
