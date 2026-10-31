interface CardContentProps {
  text: string;
}

const CardContent = ({ text }: CardContentProps) => {
  return (
    <div className="absolute inset-x-0 bottom-0 bg-gradient-to-t from-black/75 to-transparent px-6 pb-6 pt-16 text-center font-sans text-3xl font-bold tracking-wide text-white">
      <p>{text}</p>
    </div>
  );
};

export default CardContent;
