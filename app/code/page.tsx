import { CodeBlockCommand } from "@/components/ui/code/code-block-command";
import Container from "@/components/ui/container";
import { CodeBlock } from "@/registry/code/code-block";
import { CodeGroup } from "@/registry/code/code-group";
import { Preview } from "@/registry/ui/preview";

export default function CodePage() {
  return (
    <Container>
      <CodeBlockCommand npm="npm install shadcn" pnpm="test somthing " className="w-full" />

      <CodeBlock code="import {shadccn{ f" language="typescript" fileName="test.ts" />

      <CodeGroup
        codes={[
          { code: "import test somthing ", language: "typescript", fileName: "test.ts", icon: "file" },
          { code: "echo `hello`", language: "php", fileName: "test.ts", icon: "file" },
        ]}
      />

      <Preview>
        <CodeBlock code="import {shadccn{ f" language="typescript" fileName="test.ts" />
      </Preview>
    </Container>
  );
}
