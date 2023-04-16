import React, { useState, useEffect } from "react";
import { useSwipeable, SwipeEventData } from "react-swipeable";
import Image from "next/image";

import CardContent from "./CardContent";

import { CardProps } from "./types";


const Card = ({
  card,
  onSwipeLeft,
  onSwipeRight,
  onSwipeStart,
  onTap,
  current,
}: CardProps) => {
  const [rotateDeg, setRotateDeg] = useState(0);

  useEffect(() => {
    setRotateDeg(0);
  }, [card]);

  const handleRotation = (deltaX: number) => {
    const maxRotation = 50;
    const percentage = Math.min(Math.abs(deltaX) / 400, 1);
    
    const rotation = maxRotation * percentage;

    //console.log(percentage, deltaX)
    setRotateDeg(deltaX < 0 ? -rotation : rotation);
  };

  const onSwiping = (eventData: SwipeEventData) => {
    const { 
      event,          // source event
      initial,        // initial swipe [x,y]
      first,          // true for the first event of a tracked swipe
      deltaX,         // x offset (current.x - initial.x)
      deltaY,         // y offset (current.y - initial.y)
      absX,           // absolute deltaX
      absY,           // absolute deltaY
      velocity,       // √(absX^2 + absY^2) / time - "absolute velocity" (speed)
      vxvy,           // [ deltaX/time, deltaY/time] - velocity per axis
      dir,            // direction of swipe (Left|Right|Up|Down)
    } = eventData;

    //console.log(eventData)


    handleRotation(deltaX)
  }


  const handlers = useSwipeable({
    onSwipedLeft: onSwipeLeft,
    onSwipedRight: onSwipeRight,
    onSwiping: onSwiping,
    onSwipeStart: onSwipeStart,
    onTap: onTap,

    preventScrollOnSwipe: true,
    //swipeDuration: 100,
    trackMouse: true,
    delta: 50,
  });                            
  return (
    <>
    <div
       {...handlers}
      className={`card-container absolute top-4 w-full ${
        current ? "" : "hidden"
      } rotate0-${rotateDeg}`}
      
    >
      <div
        className="card relative origin-bottom touch-none" 
        style={{ transform: `rotate(${rotateDeg}deg)` }}>
        <Image
          className="object-cover rounded-lg"
          src={card.image}
          alt={card.text}
          width={400}
          height={600}
          priority
        />
        
      </div>
      <CardContent text={card.text} />
    </div>
    
    </>
  );
};//transformOrigin: 'bottom center', 

export default Card;
