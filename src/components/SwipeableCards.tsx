import React, { useState, useEffect } from 'react';
import Card from '@/components/Card'

import { CardData, Props, SwipeEventData } from "@/types";

const SwipeableCards = ({ data, onSwipeLeft, onSwipeRight }: Props) => {
  const [cards, setCards] = useState<CardData[]>(data);
  const [currentCard, setCurrentCard] = useState<CardData>();

  useEffect(() => {
    setCurrentCard(cards[0]);
  }, [cards]);

  const handleSwipeLeft = () => {
    if (onSwipeLeft) {
      onSwipeLeft(currentCard?.id!);
    }
    removeCurrentCard();
  };

  const handleSwipeRight = () => {
    if (onSwipeRight) {
      onSwipeRight(currentCard?.id!);
    }
    removeCurrentCard();
  };

  const removeCurrentCard = () => {    
    setCards((cards) => cards.slice(1));
    if (cards.length < 2) {
      setCards(data);
    }
  };

  const handleSwipeStart = (eventData: SwipeEventData) => {
    console.log(eventData)
  }

  const handleTap = () => {
    console.log("eventData")
  }
 

  return (
    <>
      {cards.length > 0 ? (
        <div className="relative flex flex-col">
          <pre className="h-4">({currentCard?.id})</pre>
          {cards.map((card) => (
            <Card
              key={card.id}
              card={card}
              onSwipeLeft={handleSwipeLeft}
              onSwipeRight={handleSwipeRight}
              onSwipeStart={handleSwipeStart}
              current={currentCard?.id === card.id} 
              onTap={handleTap}            />
          ))}
        </div>
      ) : (
        <div className="text-center text-gray-500">No more cards.</div>
      )}
    </>
  );
};

export default SwipeableCards;

