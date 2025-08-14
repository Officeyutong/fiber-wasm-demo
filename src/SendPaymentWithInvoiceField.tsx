import type { Fiber, GetPaymentCommandResult } from "@nervosnetwork/fiber-js";
import { useState } from "react";
import { Form, Message, TextArea } from "semantic-ui-react";

const SendPaymentWithInvoiceField: React.FC<{ fiber: Fiber; setLoading: (f: boolean) => void; }> = ({ fiber, setLoading }) => {
    const [result, setResult] = useState<GetPaymentCommandResult | null>(null);
    const [invoice, setInvoice] = useState("");
    const sendPayment = async () => {
        try {
            setLoading(true);
            setResult(await fiber.sendPayment({
                invoice,
                allow_self_payment: true,
            }));
        } catch (e) { alert(e) } finally { setLoading(false); }
    }

    return <>
        {result && <Message>
            <Message.Header>Send Payment Result</Message.Header>
            <Message.Content style={{ wordBreak: "break-all" }}>{JSON.stringify(result)}</Message.Content>
        </Message>}
        <Form>
            <Form.Field>
                <label>Invoice</label>
                <TextArea value={invoice} onChange={(e) => setInvoice(e.target.value)}></TextArea>
            </Form.Field>
            <Form.Button color="green" onClick={sendPayment}>Send payment</Form.Button>
        </Form>
    </>
};

export default SendPaymentWithInvoiceField;
