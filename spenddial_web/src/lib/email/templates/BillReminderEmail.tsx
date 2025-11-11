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

interface BillReminderEmailProps {
  billName: string;
  amount: number;
  dueDate: Date;
}

export const BillReminderEmail = ({
  billName,
  amount,
  dueDate,
}: BillReminderEmailProps) => {
  const daysUntilDue = Math.ceil(
    (dueDate.getTime() - Date.now()) / (1000 * 60 * 60 * 24)
  );

  return (
    <Html>
      <Head />
      <Preview>{billName} is due in {daysUntilDue} days</Preview>
      <Body style={main}>
        <Container style={container}>
          <Heading style={h1}>📅 Bill Reminder</Heading>
          <Section style={billBox}>
            <Text style={billName}>{billName}</Text>
            <Text style={billAmount}>${amount.toFixed(2)}</Text>
            <Text style={billDue}>
              Due {dueDate.toLocaleDateString("en-US", {
                weekday: "long",
                month: "long",
                day: "numeric",
              })}
            </Text>
            <Text style={billDaysLeft}>
              {daysUntilDue === 0
                ? "Due today!"
                : daysUntilDue === 1
                ? "Due tomorrow"
                : `${daysUntilDue} days remaining`}
            </Text>
          </Section>
          <Text style={text}>
            Don't forget to make this payment on time to avoid late fees.
          </Text>
          <Section style={buttonContainer}>
            <Button style={button} href={`${process.env.NEXT_PUBLIC_APP_URL}/bills`}>
              View All Bills
            </Button>
          </Section>
          <Text style={footer}>SpendDial - Bill tracking & reminders</Text>
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

const billBox = {
  backgroundColor: "#f8f9fa",
  border: "2px solid #0070f3",
  borderRadius: "12px",
  padding: "30px",
  margin: "20px 40px",
  textAlign: "center" as const,
};

const billName = {
  color: "#333",
  fontSize: "22px",
  fontWeight: "bold",
  margin: "0 0 10px 0",
};

const billAmount = {
  color: "#0070f3",
  fontSize: "36px",
  fontWeight: "bold",
  margin: "10px 0",
};

const billDue = {
  color: "#666",
  fontSize: "16px",
  margin: "10px 0 5px 0",
};

const billDaysLeft = {
  color: "#dc3545",
  fontSize: "14px",
  fontWeight: "bold",
  margin: "5px 0 0 0",
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
