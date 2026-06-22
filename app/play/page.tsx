"use client"

import Container from "@/components/ui/container"
import ImageUploader from "@/components/ui/image-uploader"
export default function PlayPage() {
  return (
    <Container>
      <ImageUploader name="product-image"/>
    </Container>
  );
}
