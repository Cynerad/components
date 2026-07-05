"use client";

import { Container } from "@/components/ui/container";
import { CompareSlider, CompareSliderAfter, CompareSliderBefore, CompareSliderHandle } from "@/registry/ui/compare-slider";

export default function Home() {
  return (
    <Container>
      <CompareSlider defaultValue={50} className="aspect-video w-full rounded-lg">
        <CompareSliderAfter>
          <img
            src="https://raw.githubusercontent.com/nerdyman/stuff/main/libs/react-compare-slider/docs/hero.gif"
            alt="After"
            className="h-full w-full object-cover"
          />
        </CompareSliderAfter>
        <CompareSliderBefore>
          <img
            src="https://encrypted-tbn0.gstatic.com/images?q=tbn:ANd9GcTbblKnALScxPFvoHuWD7ooqcySC7GKQquIqwuuTqfGug&s"
            alt="Before"
            className="h-full w-full object-cover"
          />
        </CompareSliderBefore>
        <CompareSliderHandle />
      </CompareSlider>
    </Container>
  );
}
