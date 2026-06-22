import Container from "@/components/ui/container";
import TagsInput from "@/registry/ui/tags-input";

export default function Home() {
  return (
    <Container>
      <div className="max-w-[400px]">
        <TagsInput name="tags" />
      </div>
    </Container>
  );
}
