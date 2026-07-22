"use client";

import { Container } from "@/components/ui/container";
import {
  Notification,
  NotificationContent,
  NotificationHeader,
  NotificationIndicator,
  NotificationItem,
  NotificationItemContent,
  NotificationItemDescription,
  NotificationItemTimestamp,
  NotificationItemTitle,
  NotificationItemTrailing,
  NotificationItemTrigger,
  NotificationSeparator,
  NotificationTrigger,
} from "@/registry/ui/notification";

import { BellIcon, Dot } from "lucide-react";

export default function Home() {
  return (
    <Container className="h-[200vh]">
      <Notification>
        <NotificationTrigger>
          <BellIcon aria-hidden="true" size={16} />
          <NotificationIndicator />
        </NotificationTrigger>
        <NotificationContent>
          <NotificationHeader>
            <div className="font-semibold text-sm">Notifications</div>
            <button className="font-medium text-xs hover:underline" type="button">
              Mark all as read
            </button>
          </NotificationHeader>

          <NotificationSeparator />

          <NotificationItem>
            <NotificationItemTrigger>
              <NotificationItemContent>
                <NotificationItemTitle>this is simple title. </NotificationItemTitle>
                <NotificationItemDescription>just description</NotificationItemDescription>
              </NotificationItemContent>
              <NotificationItemTimestamp>15 minutes ago</NotificationItemTimestamp>
            </NotificationItemTrigger>
            <NotificationItemTrailing>
              <Dot />
            </NotificationItemTrailing>
          </NotificationItem>
        </NotificationContent>
      </Notification>
    </Container>
  );
}
