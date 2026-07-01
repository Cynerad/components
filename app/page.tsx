import { Container } from "@/components/ui/container";
import { Status, StatusIndicator, StatusLabel } from "@/registry/ui/status";
export default function Home() {
  return (
    <Container className="min-h-full min-w-full">
      <div className="flex items-center justify-center gap-1">
        <Status variant="success">
          <StatusIndicator />
          <StatusLabel>Online</StatusLabel>
        </Status>

        <Status variant="error">
          <StatusIndicator />
          <StatusLabel>Offline</StatusLabel>
        </Status>

        <Status variant="warning">
          <StatusIndicator />
          <StatusLabel>Away</StatusLabel>
        </Status>

        <Status variant="info">
          <StatusIndicator />
          <StatusLabel>Idle</StatusLabel>
        </Status>

        <Status variant="default">
          <StatusIndicator />
          <StatusLabel>Unknown</StatusLabel>
        </Status>
      </div>
    </Container>
  );
}
