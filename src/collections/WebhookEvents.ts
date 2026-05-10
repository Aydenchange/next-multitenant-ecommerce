import { isSuperAdmin } from "@/lib/access";
import type { CollectionConfig } from "payload";

export const WebhookEvents: CollectionConfig = {
  slug: "webhook-events",
  access: {
    read: ({ req }) => isSuperAdmin(req.user),
    create: ({ req }) => isSuperAdmin(req.user),
    update: ({ req }) => isSuperAdmin(req.user),
    delete: ({ req }) => isSuperAdmin(req.user),
  },
  admin: {
    useAsTitle: "eventId",
    hidden: ({ user }) => !isSuperAdmin(user),
  },
  fields: [
    {
      name: "eventId",
      type: "text",
      required: true,
      unique: true,
      index: true,
    },
    {
      name: "type",
      type: "text",
      required: true,
      index: true,
    },
    {
      name: "status",
      type: "select",
      required: true,
      defaultValue: "processing",
      options: ["processing", "processed", "failed", "skipped"],
      index: true,
    },
    {
      name: "stripeAccountId",
      type: "text",
      index: true,
    },
    {
      name: "checkoutSessionId",
      type: "text",
      index: true,
    },
    {
      name: "error",
      type: "textarea",
    },
    {
      name: "processedAt",
      type: "date",
    },
  ],
};
