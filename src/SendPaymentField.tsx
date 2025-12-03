import { randomSecretKey, type Fiber, type GetPaymentCommandResult, type HexString } from "@nervosnetwork/fiber-js";
import { useState } from "react";
import { Form, Message } from "semantic-ui-react";
import { uint8ArrayToHexString, useInputValue } from "./main";

const SendPaymentField: React.FC<{ fiber: Fiber; setLoading: (f: boolean) => void; }> = ({ fiber, setLoading }) => {
    const [result, setResult] = useState<GetPaymentCommandResult | null>(null);
    const targetPubkey = useInputValue("");
    const amount = useInputValue("0x174876e800");
    const paymentHash = useInputValue(uint8ArrayToHexString(randomSecretKey()));
    const sendPayment = async () => {
        try {
            setLoading(true);
            setResult(await fiber.sendPayment({
                target_pubkey: targetPubkey.value,
                amount: amount.value as HexString,
                payment_hash: paymentHash.value as HexString,
                keysend: true
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
                <label>Target public key</label>
                <Form.Input {...targetPubkey}></Form.Input>
            </Form.Field>
            <Form.Field>
                <label>Amount</label>
                <Form.Input {...amount}></Form.Input>
            </Form.Field>
            <Form.Field>
                <label>Payment hash</label>
                <Form.Input {...paymentHash}></Form.Input>
            </Form.Field>
            <Form.Button color="green" onClick={sendPayment}>Send payment</Form.Button>
        </Form>
    </>
};

export default SendPaymentField;
