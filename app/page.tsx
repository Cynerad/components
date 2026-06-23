"use client";

import { Button } from "@/components/ui/button";
import Container from "@/components/ui/container";
import { Rating } from "@/registry/ui/rating";

export default function Home() {
  return (
    <Container>
      <div className="max-w-[400px]">
        <form
          onSubmit={(event) => {
            event.preventDefault();
            const data = new FormData(event.currentTarget);
            console.log(data.get("ratings-product"));
          }}
        >
          <Rating name="ratings-product" variant="default" />
          <Button type="submit">submit</Button>
        </form>
      </div>
    </Container>
  );
}
