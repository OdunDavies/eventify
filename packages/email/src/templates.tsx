import {
  Body,
  Container,
  Head,
  Heading,
  Html,
  Img,
  Link,
  Preview,
  Section,
  Text,
} from "@react-email/components";
import * as React from "react";

interface TicketConfirmationEmailProps {
  attendeeName: string;
  eventTitle: string;
  eventDate: string;
  eventVenue: string;
  orderNumber: string;
  ticketUrl: string;
}

export const TicketConfirmationEmail = ({
  attendeeName,
  eventTitle,
  eventDate,
  eventVenue,
  orderNumber,
  ticketUrl,
}: TicketConfirmationEmailProps) => {
  return (
    <Html>
      <Head />
      <Preview>Your tickets for {eventTitle} are confirmed!</Preview>
      <Body style={main}>
        <Container style={container}>
          <Img
            src="https://yourplatform.com/logo.png"
            width="120"
            height="40"
            alt="EventTix"
            style={logo}
          />
          <Heading style={h1}>Tickets Confirmed!</Heading>
          <Text style={text}>Hi {attendeeName},</Text>
          <Text style={text}>
            Your tickets for <strong>{eventTitle}</strong> are confirmed.
          </Text>
          <Section style={detailsBox}>
            <Text style={detailText}>📅 {eventDate}</Text>
            <Text style={detailText}>📍 {eventVenue}</Text>
            <Text style={detailText}>🆔 Order #{orderNumber}</Text>
          </Section>
          <Section style={ctaSection}>
            <Link href={ticketUrl} style={ctaButton}>
              View My Tickets
            </Link>
          </Section>
          <Text style={footer}>
            Having trouble? Copy this link into your browser:{" "}
            <Link href={ticketUrl}>{ticketUrl}</Link>
          </Text>
        </Container>
      </Body>
    </Html>
  );
};

interface MagicLinkEmailProps {
  email: string;
  magicLink: string;
}

export const MagicLinkEmail = ({ email, magicLink }: MagicLinkEmailProps) => {
  const previewText = `Sign in to EventTix`;

  return (
    <Html>
      <Head />
      <Preview>{previewText}</Preview>
      <Body style={main}>
        <Container style={container}>
          <Img
            src="https://yourplatform.com/logo.png"
            width="120"
            height="40"
            alt="EventTix"
            style={logo}
          />
          <Heading style={h1}>Sign in to EventTix</Heading>
          <Text style={text}>Hi there,</Text>
          <Text style={text}>
            Click the link below to sign in to your account.
          </Text>
          <Section style={ctaSection}>
            <Link href={magicLink} style={ctaButton}>
              Sign In
            </Link>
          </Section>
          <Text style={footer}>
            If you didn&apos;t request this, you can safely ignore this email.
          </Text>
        </Container>
      </Body>
    </Html>
  );
};

interface EventReminderEmailProps {
  attendeeName: string;
  eventTitle: string;
  eventDate: string;
  eventVenue: string;
  ticketUrl: string;
}

export const EventReminderEmail = ({
  attendeeName,
  eventTitle,
  eventDate,
  eventVenue,
  ticketUrl,
}: EventReminderEmailProps) => {
  return (
    <Html>
      <Head />
      <Preview>Reminder: {eventTitle} is coming up!</Preview>
      <Body style={main}>
        <Container style={container}>
          <Heading style={h1}>Don&apos;t Forget!</Heading>
          <Text style={text}>Hi {attendeeName},</Text>
          <Text style={text}>
            <strong>{eventTitle}</strong> is happening soon!
          </Text>
          <Section style={detailsBox}>
            <Text style={detailText}>📅 {eventDate}</Text>
            <Text style={detailText}>📍 {eventVenue}</Text>
          </Section>
          <Section style={ctaSection}>
            <Link href={ticketUrl} style={ctaButton}>
              View My Tickets
            </Link>
          </Section>
        </Container>
      </Body>
    </Html>
  );
};

// Styles
const main = {
  backgroundColor: "#f6f9fc",
  fontFamily:
    '-apple-system,BlinkMacSystemFont,"Segoe UI",Roboto,"Helvetica Neue",Arial,sans-serif',
};

const container = {
  backgroundColor: "#ffffff",
  margin: "0 auto",
  padding: "40px 20px",
  maxWidth: "560px",
};

const logo = {
  margin: "0 auto 20px",
};

const h1 = {
  color: "#1a1a1a",
  fontSize: "28px",
  fontWeight: "700",
  textAlign: "center" as const,
  margin: "30px 0",
};

const text = {
  color: "#333",
  fontSize: "16px",
  lineHeight: "24px",
  margin: "12px 0",
};

const detailsBox = {
  backgroundColor: "#f8fafc",
  borderRadius: "8px",
  padding: "20px",
  margin: "24px 0",
};

const detailText = {
  color: "#475569",
  fontSize: "15px",
  margin: "6px 0",
};

const ctaSection = {
  textAlign: "center" as const,
  margin: "30px 0",
};

const ctaButton = {
  backgroundColor: "#6d28d9",
  borderRadius: "8px",
  color: "#fff",
  fontSize: "16px",
  fontWeight: "600",
  padding: "12px 32px",
  textDecoration: "none",
  display: "inline-block",
};

const footer = {
  color: "#94a3b8",
  fontSize: "12px",
  lineHeight: "20px",
  margin: "20px 0 0",
  wordBreak: "break-all" as const,
};
