import {
  Body,
  Button,
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

interface WelcomeEmailProps {
  name: string;
}

export const WelcomeEmail = ({ name }: WelcomeEmailProps) => (
  <Html>
    <Head />
    <Preview>Welcome to SpendDial - Your daily budget at a glance</Preview>
    <Body style={main}>
      <Container style={container}>
        <Heading style={h1}>Welcome to SpendDial! 🎉</Heading>
        <Text style={text}>Hi {name},</Text>
        <Text style={text}>
          We're thrilled to have you on board! SpendDial helps you understand
          exactly how much you can spend today without overspending.
        </Text>
        <Section style={buttonContainer}>
          <Button style={button} href={`${process.env.NEXT_PUBLIC_APP_URL}/onboarding`}>
            Get Started
          </Button>
        </Section>
        <Text style={text}>
          <strong>Here's what you can do:</strong>
        </Text>
        <Text style={text}>
          ✓ Connect your bank accounts securely
          <br />
          ✓ Track spending in real-time
          <br />
          ✓ Set up recurring bills
          <br />
          ✓ Get daily budget recommendations
          <br />
          ✓ Receive smart spending alerts
        </Text>
        <Text style={text}>
          Need help? Reply to this email or visit our{" "}
          <Link href={`${process.env.NEXT_PUBLIC_APP_URL}/help`} style={link}>
            Help Center
          </Link>
          .
        </Text>
        <Text style={footer}>
          SpendDial - Know exactly how much you can spend today
        </Text>
      </Container>
    </Body>
  </Html>
);

const main = {
  backgroundColor: "#f6f9fc",
  fontFamily:
    '-apple-system,BlinkMacSystemFont,"Segoe UI",Roboto,"Helvetica Neue",Ubuntu,sans-serif',
};

const container = {
  backgroundColor: "#ffffff",
  margin: "0 auto",
  padding: "20px 0 48px",
  marginBottom: "64px",
};

const h1 = {
  color: "#333",
  fontSize: "24px",
  fontWeight: "bold",
  margin: "40px 0",
  padding: "0",
  textAlign: "center" as const,
};

const text = {
  color: "#333",
  fontSize: "16px",
  lineHeight: "26px",
  padding: "0 40px",
};

const buttonContainer = {
  padding: "27px 0",
  textAlign: "center" as const,
};

const button = {
  backgroundColor: "#0070f3",
  borderRadius: "8px",
  color: "#fff",
  fontSize: "16px",
  textDecoration: "none",
  textAlign: "center" as const,
  display: "block",
  width: "200px",
  padding: "12px 0",
  margin: "0 auto",
};

const link = {
  color: "#0070f3",
  textDecoration: "underline",
};

const footer = {
  color: "#898989",
  fontSize: "12px",
  lineHeight: "16px",
  padding: "0 40px",
  textAlign: "center" as const,
  marginTop: "40px",
};
