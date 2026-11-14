interface CardContentProps {
  text: string;
  pos: string;
  level: string;
}

const CardContent = ({ text, pos, level }: CardContentProps) => {
  return (
    <div className="absolute inset-x-0 bottom-0 bg-gradient-to-t from-black/75 to-transparent px-6 pb-6 pt-16 text-center font-sans text-white">
      <p className="text-3xl font-bold tracking-wide">{text}</p>
      <p className="mt-1 text-sm text-white/80">
        <i>{pos}</i> · {level}
      </p>
    </div>
  );
};

export default CardContent;
