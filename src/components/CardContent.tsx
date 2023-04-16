interface CardContentProps {
  text: string;
}

const CardContent = ({ text }: CardContentProps) => {
  return (
    <div className="card-content font-sans text-2xl text-center text-cyan-50 relative z-10">
      <p>{text}</p>
    </div>
  );
};

export default CardContent;
