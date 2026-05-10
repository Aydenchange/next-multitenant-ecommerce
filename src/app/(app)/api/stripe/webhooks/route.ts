import type { Stripe } from "stripe";
import { getPayload } from "payload";
import config from "@payload-config";
import { NextResponse } from "next/server";

import { stripe } from "@/lib/stripe";

import { ExpandedLineItem } from "@/modules/checkout/types";
import { logEvent, serializeError } from "@/lib/observability";
import { getServerEnv } from "@/lib/env";

export async function POST(req: Request) {
  let event: Stripe.Event;
  const env = getServerEnv();

  try {
    event = stripe.webhooks.constructEvent(
      await (await req.blob()).text(),
      req.headers.get("stripe-signature") as string,
      env.STRIPE_WEBHOOK_SECRET,
    );
  } catch (error) {
    const errorMessage =
      error instanceof Error ? error.message : "Unknown error";

    logEvent("warn", "Stripe webhook signature verification failed", {
      error: serializeError(error),
    });
    return NextResponse.json(
      { message: `Webhook Error: ${errorMessage}` },
      { status: 400 },
    );
  }

  const permittedEvents: string[] = [
    "checkout.session.completed",
    "account.updated",
  ];

  const payload = await getPayload({ config });
  const existingEvent = await payload.find({
    collection: "webhook-events",
    limit: 1,
    pagination: false,
    where: {
      eventId: {
        equals: event.id,
      },
    },
  });
  const existingEventDoc = existingEvent.docs[0];

  if (existingEventDoc?.status === "processed") {
    return NextResponse.json({ message: "Already processed" }, { status: 200 });
  }

  const webhookEvent =
    existingEventDoc ??
    (await payload.create({
      collection: "webhook-events",
      data: {
        eventId: event.id,
        type: event.type,
        status: "processing",
        stripeAccountId: event.account,
      },
    }));

  if (permittedEvents.includes(event.type)) {
    let data;

    try {
      switch (event.type) {
        case "checkout.session.completed":
          data = event.data.object as Stripe.Checkout.Session;

          await payload.update({
            collection: "webhook-events",
            id: webhookEvent.id,
            data: {
              checkoutSessionId: data.id,
              status: "processing",
            },
          });

          if (!data.metadata?.userId) {
            throw new Error("User ID is required");
          }

          const user = await payload.findByID({
            collection: "users",
            id: data.metadata.userId,
          });

          if (!user) {
            throw new Error("User not found");
          }

          const expandedSession = await stripe.checkout.sessions.retrieve(
            data.id,
            {
              expand: ["line_items.data.price.product"],
            },
            {
              stripeAccount: event.account,
            },
          );

          if (
            !expandedSession.line_items?.data ||
            !expandedSession.line_items.data.length
          ) {
            throw new Error("No line items found");
          }

          const lineItems = expandedSession.line_items
            .data as ExpandedLineItem[];

          for (const item of lineItems) {
            const product = await payload.findByID({
              collection: "products",
              id: item.price.product.metadata.id,
              depth: 0,
            });

            if (!product?.tenant) {
              throw new Error("Product or product tenant not found");
            }

            const tenantId =
              typeof product.tenant === "string"
                ? product.tenant
                : product.tenant.id;

            const tenant = await payload.findByID({
              collection: "tenants",
              id: tenantId,
              depth: 0,
            });

            if (event.account && tenant.stripeAccountId !== event.account) {
              throw new Error("Stripe account does not match product tenant");
            }

            const existingOrder = await payload.find({
              collection: "orders",
              limit: 1,
              pagination: false,
              where: {
                and: [
                  {
                    stripeCheckoutSessionId: {
                      equals: data.id,
                    },
                  },
                  {
                    product: {
                      equals: product.id,
                    },
                  },
                ],
              },
            });

            if (existingOrder.docs[0]) {
              continue;
            }

            await payload.create({
              collection: "orders",
              data: {
                tenant: tenant.id,
                stripeCheckoutSessionId: data.id,
                stripeAccountId: event.account,
                user: user.id,
                product: product.id,
                name: product.name,
              },
            });
          }
          break;
        case "account.updated":
          data = event.data.object as Stripe.Account;

          await payload.update({
            collection: "tenants",
            where: {
              stripeAccountId: {
                equals: data.id,
              },
            },
            data: {
              stripeDetailsSubmitted: data.details_submitted,
            },
          });

          break;
        default:
          throw new Error(`Unhandled event: ${event.type}`);
      }

      await payload.update({
        collection: "webhook-events",
        id: webhookEvent.id,
        data: {
          status: "processed",
          processedAt: new Date().toISOString(),
          error: null,
        },
      });
    } catch (error) {
      await payload.update({
        collection: "webhook-events",
        id: webhookEvent.id,
        data: {
          status: "failed",
          error: error instanceof Error ? error.message : String(error),
        },
      });

      logEvent("error", "Stripe webhook handler failed", {
        eventId: event.id,
        type: event.type,
        stripeAccountId: event.account,
        error: serializeError(error),
      });

      return NextResponse.json(
        { message: "Webhook handler failed" },
        { status: 500 },
      );
    }
  } else {
    await payload.update({
      collection: "webhook-events",
      id: webhookEvent.id,
      data: {
        status: "skipped",
        processedAt: new Date().toISOString(),
      },
    });
  }

  return NextResponse.json({ message: "Received" }, { status: 200 });
}
