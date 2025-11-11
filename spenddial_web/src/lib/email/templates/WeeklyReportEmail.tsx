import { Body, Container, Head, Heading, Html, Preview, Text } from "@react-email/components";

interface WeeklyReportEmailProps {
  weekSpent: number;
  weekBudget: number;
  insights: string[];
}

export const WeeklyReportEmail = ({ weekSpent, weekBudget, insights }: WeeklyReportEmailProps) => (
  <Html>
    <Head />
    <Preview>Your weekly spending report</Preview>
    <Body>
      <Container>
        <Heading>Weekly Report</Heading>
        <Text>You spent ${weekSpent} this week out of ${weekBudget} budget.</Text>
        {insights.map((insight, i) => (
          <Text key={i}>• {insight}</Text>
        ))}
      </Container>
    </Body>
  </Html>
);
