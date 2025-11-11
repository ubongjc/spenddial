import { Body, Container, Head, Heading, Html, Preview, Text } from "@react-email/components";

interface UnusualActivityEmailProps {
  transaction: { merchant: string; amount: number; date: Date };
}

export const UnusualActivityEmail = ({ transaction }: UnusualActivityEmailProps) => (
  <Html>
    <Head />
    <Preview>Unusual activity detected</Preview>
    <Body>
      <Container>
        <Heading>⚠️ Unusual Activity Detected</Heading>
        <Text>
          We noticed an unusual transaction: ${transaction.amount} at {transaction.merchant}
        </Text>
      </Container>
    </Body>
  </Html>
);
