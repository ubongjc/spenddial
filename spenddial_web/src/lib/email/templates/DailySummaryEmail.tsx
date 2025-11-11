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

interface DailySummaryEmailProps {
  spent: number;
  remaining: number;
  topCategories: Array<{ name: string; amount: number }>;
}

export const DailySummaryEmail = ({
  spent,
  remaining,
  topCategories,
}: DailySummaryEmailProps) => (
  <Html>
    <Head />
    <Preview>Today you spent ${spent.toFixed(2)}</Preview>
    <Body style={main}>
      <Container style={container}>
        <Heading style={h1}>Your Daily Summary 📊</Heading>
        <Section style={statsContainer}>
          <div style={statBox}>
            <Text style={statLabel}>Spent Today</Text>
            <Text style={statValue}>${spent.toFixed(2)}</Text>
          </div>
          <div style={statBox}>
            <Text style={statLabel}>Remaining</Text>
            <Text style={statValue}>${remaining.toFixed(2)}</Text>
          </div>
        </Section>
        <Text style={text}>
          <strong>Top Spending Categories:</strong>
        </Text>
        {topCategories.map((category) => (
          <Section key={category.name} style={categoryItem}>
            <Text style={categoryName}>{category.name}</Text>
            <Text style={categoryAmount}>${category.amount.toFixed(2)}</Text>
          </Section>
        ))}
        <Section style={buttonContainer}>
          <Button style={button} href={`${process.env.NEXT_PUBLIC_APP_URL}/dashboard`}>
            View Full Report
          </Button>
        </Section>
        <Text style={footer}>SpendDial - Daily spending insights</Text>
      </Container>
    </Body>
  </Html>
);

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

const statsContainer = {
  display: "flex",
  justifyContent: "space-around",
  padding: "20px 40px",
};

const statBox = {
  textAlign: "center" as const,
};

const statLabel = {
  color: "#666",
  fontSize: "14px",
  margin: "0 0 8px 0",
};

const statValue = {
  color: "#0070f3",
  fontSize: "28px",
  fontWeight: "bold",
  margin: "0",
};

const text = {
  color: "#333",
  fontSize: "16px",
  lineHeight: "26px",
  padding: "0 40px",
  marginTop: "20px",
};

const categoryItem = {
  display: "flex",
  justifyContent: "space-between",
  padding: "12px 40px",
  borderBottom: "1px solid #eee",
};

const categoryName = {
  color: "#333",
  fontSize: "16px",
  margin: "0",
};

const categoryAmount = {
  color: "#666",
  fontSize: "16px",
  fontWeight: "bold",
  margin: "0",
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
