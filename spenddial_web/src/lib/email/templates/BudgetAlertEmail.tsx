import {
  Body,
  Button,
  Container,
  Head,
  Heading,
  Html,
  Preview,
  Section,
  Text,
} from "@react-email/components";

interface BudgetAlertEmailProps {
  remaining: number;
  budget: number;
}

export const BudgetAlertEmail = ({ remaining, budget }: BudgetAlertEmailProps) => {
  const percentage = (remaining / budget) * 100;
  const isLow = percentage < 25;
  const isCritical = percentage < 10;

  return (
    <Html>
      <Head />
      <Preview>Budget Alert: You have ${remaining.toFixed(2)} remaining today</Preview>
      <Body style={main}>
        <Container style={container}>
          <Heading style={h1}>
            {isCritical ? "⚠️" : "⚡"} Budget Alert
          </Heading>
          <Section style={alertBox(isCritical)}>
            <Text style={alertText}>
              You have <strong>${remaining.toFixed(2)}</strong> remaining today
            </Text>
            <Text style={alertSubtext}>
              That's {percentage.toFixed(0)}% of your ${budget.toFixed(2)} daily budget
            </Text>
          </Section>
          <Text style={text}>
            {isCritical
              ? "You're running very low on your daily budget. Consider skipping optional purchases today."
              : "You're approaching your budget limit. Be mindful of your spending for the rest of the day."}
          </Text>
          <Section style={buttonContainer}>
            <Button style={button} href={`${process.env.NEXT_PUBLIC_APP_URL}/dashboard`}>
              View Dashboard
            </Button>
          </Section>
          <Text style={footer}>
            SpendDial - Daily budget tracking
          </Text>
        </Container>
      </Body>
    </Html>
  );
};

const main = {
  backgroundColor: "#f6f9fc",
  fontFamily: '-apple-system,BlinkMacSystemFont,"Segoe UI",Roboto,"Helvetica Neue",Ubuntu,sans-serif',
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

const alertBox = (isCritical: boolean) => ({
  backgroundColor: isCritical ? "#fee" : "#fff3cd",
  border: `2px solid ${isCritical ? "#dc3545" : "#ffc107"}`,
  borderRadius: "8px",
  padding: "20px",
  margin: "20px 40px",
  textAlign: "center" as const,
});

const alertText = {
  color: "#333",
  fontSize: "20px",
  fontWeight: "bold",
  margin: "0 0 10px 0",
};

const alertSubtext = {
  color: "#666",
  fontSize: "14px",
  margin: "0",
};

const text = {
  color: "#333",
  fontSize: "16px",
  lineHeight: "26px",
  padding: "0 40px",
  marginTop: "20px",
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

const footer = {
  color: "#898989",
  fontSize: "12px",
  lineHeight: "16px",
  padding: "0 40px",
  textAlign: "center" as const,
  marginTop: "40px",
};
