import { randomSecretKey, type Fiber, type HashAlgorithm, type HexString, type InvoiceResult } from "@nervosnetwork/fiber-js";
import { useState } from "react";
import { Form, Message } from "semantic-ui-react";
import { uint8ArrayToHexString, useInputValue } from "./main";

const CreateInvoiceField: React.FC<{ fiber: Fiber; setLoading: (f: boolean) => void; }> = ({ fiber, setLoading }) => {

    const [result, setResult] = useState<InvoiceResult | null>(null);
    const amount = useInputValue("0x5f5e100");
    const description = useInputValue("Test invoice");
    const paymentPreimage = useInputValue(uint8ArrayToHexString(randomSecretKey()));
    const expiry = useInputValue("0xe10");
    const hashAlgorithm = useInputValue("sha256");

    const createInvoice = async () => {
        try {
            setLoading(true);
            setResult(await fiber.newInvoice({
                amount: amount.value as HexString,
                description: description.value,
                payment_preimage: paymentPreimage.value as HexString,
                expiry: expiry.value as HexString,
                hash_algorithm: hashAlgorithm.value as HashAlgorithm,
                currency: "Fibt"
            }));

        } catch (e) {
            alert(e);
        } finally {
            setLoading(false);
        }
    }
    return <>
        {result !== null && <Message>
            <Message.Header>
                Invoice Result
            </Message.Header>
            <Message.Content style={{ wordBreak: "break-all" }}>
                {JSON.stringify(result)}
            </Message.Content>
        </Message>}
        <Form>
            <Form.Field>
                <label>Amount</label>
                <Form.Input {...amount}></Form.Input>
            </Form.Field>
            <Form.Field>
                <label>Description</label>
                <Form.Input {...description}></Form.Input>
            </Form.Field>
            <Form.Field>
                <label>Payment Preimage</label>
                <Form.Input {...paymentPreimage}></Form.Input>
            </Form.Field>
            <Form.Field>
                <label>Expiry</label>
                <Form.Input {...expiry}></Form.Input>
            </Form.Field>
            <Form.Field>
                <label>Hash Algorithm</label>
                <Form.Input {...hashAlgorithm}></Form.Input>
            </Form.Field>
            <Form.Button color="green" onClick={createInvoice}>New Invoice</Form.Button>
        </Form>
    </>
}


export default CreateInvoiceField;
