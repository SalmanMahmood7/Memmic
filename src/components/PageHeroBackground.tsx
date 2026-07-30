export default function PageHeroBackground({ image }: { image: string }) {
  return (
    <>
      <div
        className="pointer-events-none absolute inset-0 grayscale"
        style={{
          backgroundImage: `url(${image})`,
          backgroundSize: "cover",
          backgroundPosition: "center",
          opacity: 0.35,
          maskImage: "linear-gradient(to left, black 20%, transparent 65%)",
          WebkitMaskImage:
            "linear-gradient(to left, black 20%, transparent 65%)",
        }}
        aria-hidden="true"
      />
      <div
        className="pointer-events-none absolute inset-0 bg-gradient-to-t from-white via-transparent to-white/40"
        aria-hidden="true"
      />
    </>
  );
}
