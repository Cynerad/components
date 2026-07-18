"use client";

import {
  banner,
  BannerActions,
  BannerButton,
  BannerClose,
  BannerContainer,
  BannerContent,
  BannerDescription,
  BannerIcon,
  Banners,
  BannerTitle,
} from "@/registry/ui/banner";
import { Info } from "lucide-react";

import { useEffect, useState } from "react";

export default function Home() {
  useEffect(() => {
    banner({
      content: (
        <>
          <BannerContainer>
            <BannerIcon>
              <Info />
            </BannerIcon>
            <BannerContent>
              <BannerTitle>test it </BannerTitle>
              <BannerDescription>fjalsdjfasdk test it right kfldsjaf</BannerDescription>
            </BannerContent>
          </BannerContainer>
          <BannerActions>
            <BannerButton onOpenDismiss={false}>Updated At</BannerButton>
            <BannerClose />
          </BannerActions>
        </>
      ),
      variant: "default",
    });
  }, []);
  return (
    <div className="h-[200vh]">
      <Banners strategy="sticky" side="bottom" />
    </div>
  );
}
