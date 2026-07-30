import { Shader, Swirl, ChromaFlow, FlutedGlass, FilmGrain } from "shaders/react";
import RollButton from "./RollButton";

export default function Hero() {
  return (
    <section className="relative flex min-h-screen flex-col overflow-hidden bg-[#EFEFEF]">
      <div className="pointer-events-none absolute inset-0 z-10">
        <Shader className="h-full w-full" style={{ width: "100%", height: "100%" }}>
          <Swirl colorA="#ffffff" colorB="#f0f0f0" detail={1.7} />
          <ChromaFlow
            baseColor="#ffffff"
            downColor="#ff5f03"
            leftColor="#ff5f03"
            rightColor="#ff5f03"
            upColor="#ff5f03"
            momentum={13}
            radius={3.5}
          />
          <FlutedGlass
            aberration={0.61}
            angle={31}
            frequency={8}
            highlight={0.12}
            highlightSoftness={0}
            lightAngle={-90}
            refraction={4}
            shape="rounded"
            softness={1}
            speed={0.15}
          />
          <FilmGrain strength={0.05} />
        </Shader>
      </div>

      <div className="flex-1" />

      <div className="relative z-20 mx-auto w-full max-w-[1440px] px-5 pb-14 sm:px-8 sm:pb-16 lg:px-12 lg:pb-20">
        <h1 className="text-[clamp(1.75rem,7vw,4.2rem)] font-medium leading-[1.08] tracking-[-0.03em] text-gray-900 sm:text-[clamp(2.5rem,5vw,4.2rem)]">
          Creative ventures, backed to grow.
        </h1>

        <p className="mt-5 max-w-xl text-[15px] leading-relaxed text-gray-600 sm:mt-6 sm:text-[16px]">
          MEMMIC is AmanorX Holdings' evaluation, management, marketplace and
          investment company for media and creative across Pakistan.
        </p>

        <div className="mt-8 flex flex-col gap-4 sm:mt-12 sm:flex-row sm:items-center sm:gap-5">
          <RollButton
            label="Start a project"
            buttonClassName="bg-[#111827] hover:bg-[#1f2937] text-white text-[13px] sm:text-[14px] font-medium rounded-full pl-5 sm:pl-6 pr-2 py-2 gap-10 sm:gap-14"
            circleClassName="bg-white w-7 h-7 sm:w-8 sm:h-8"
            arrowClassName="text-[#111827]"
          />
        </div>
      </div>
    </section>
  );
}
