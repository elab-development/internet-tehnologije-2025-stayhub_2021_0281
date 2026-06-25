import Image from "next/image";

type AppCardProps = {
  image: string;
  title: string;
  text: string;
};

export default function AppCard({ image, title, text }: AppCardProps) {
  // Kartica prikazuje sliku, naslov i opis.
  return (
    <div className="app-card">
      <Image src={image} alt={title} width={600} height={400} />
      <div className="app-card-body">
        <h3>{title}</h3>
        <p>{text}</p>
      </div>
    </div>
  );
}