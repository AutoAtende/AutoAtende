import React, { useState, useEffect } from 'react';

const MessageReaction = ({ message, classes }) => {
  const [reactions, setReactions] = useState([]);

  useEffect(() => {
    console.log('Reações da mensagem:', message.reactions);
    
    if (message.reactions && Array.isArray(message.reactions)) {
      // Agrupar reações por tipo
      const groupedReactions = message.reactions.reduce((acc, reaction) => {
        if (!acc[reaction.type]) {
          acc[reaction.type] = {
            type: reaction.type,
            count: 0,
            users: []
          };
        }
        acc[reaction.type].count++;
        acc[reaction.type].users.push(reaction.userId);
        return acc;
      }, {});

      setReactions(Object.values(groupedReactions));
    }
  }, [message.reactions]);

  if (!reactions.length) return null;

  return (
    <div className={classes.reactionWrapper}>
      {reactions.map((reaction, index) => (
        <div 
          key={`${reaction.type}-${index}`} 
          className={classes.reactionBubble}
          title={`${reaction.count} reação(ões)`}
        >
          <span className={classes.reactionEmoji}>{reaction.type}</span>
          {reaction.count > 1 && (
            <span className={classes.reactionCount}>{reaction.count}</span>
          )}
        </div>
      ))}
    </div>
  );
};

export default MessageReaction;