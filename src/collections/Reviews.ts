import { isSuperAdmin } from "@/lib/access";
import type { CollectionConfig } from "payload";

export const Reviews: CollectionConfig = {
  slug: "reviews",
  access: {
    read: ({ req }) => {
      if (isSuperAdmin(req.user)) return true;
      const tenantId = req.user?.tenants?.[0]?.tenant;
      if (!tenantId) return false;
      return {
        tenant: {
          equals: typeof tenantId === "string" ? tenantId : tenantId.id,
        },
      };
    },
    create: ({ req }) => isSuperAdmin(req.user),
    update: ({ req }) => isSuperAdmin(req.user),
    delete: ({ req }) => isSuperAdmin(req.user),
  },
  admin: {
    useAsTitle: "description",
  },
  fields: [
    {
      name: "tenant",
      type: "relationship",
      relationTo: "tenants",
      required: true,
      index: true,
      admin: {
        position: "sidebar",
        readOnly: true,
      },
    },
    {
      name: "description",
      type: "textarea",
      required: true,
    },
    {
      name: "rating",
      type: "number",
      required: true,
      min: 1,
      max: 5,
    },
    {
      name: "product",
      type: "relationship",
      relationTo: "products",
      hasMany: false,
      required: true,
      index: true,
    },
    {
      name: "user",
      type: "relationship",
      relationTo: "users",
      hasMany: false,
      required: true,
      index: true,
    },
  ],
};
