import type { Fiber, OpenChannelResult } from "@nervosnetwork/fiber-js";
import { useState } from "react";
import { Form, Message } from "semantic-ui-react"

const OpenChannelField: React.FC<{ fiber: Fiber; setLoading: (f: boolean) => void; }> = ({ fiber, setLoading }) => {
    const [peerId, setPeerId] = useState("");
    const [fundingAmount, setFundingAmount] = useState("0x174876e800");
    const [isPublic, setIsPublic] = useState(false);
    const [result, setResult] = useState<OpenChannelResult | null>(null);
    const openChannel = async () => {
        if (!fundingAmount.startsWith("0x")) {
            alert("Funding amount must starts with 0x");
            return;
        }
        try {
            setResult(null);
            setLoading(true);
            const result = await fiber.openChannel({
                peer_id: peerId,
                funding_amount: fundingAmount as `0x${string}`,
                public: isPublic
            });
            setResult(result);
        } catch (e) { alert(e); } finally {
            setLoading(false);
        }
    };

    return <>
        {result && <Message>
            <Message.Header>Channel Create Result</Message.Header>
            <Message.Content>{JSON.stringify(result)}</Message.Content>
        </Message>}
        <Form>
            <Form.Field>
                <label>Peer ID</label>
                <Form.Input value={peerId} onChange={(e) => setPeerId(e.target.value)}></Form.Input>
            </Form.Field>
            <Form.Field>
                <label>Funding amount</label>
                <Form.Input placeholder="0x12345678" value={fundingAmount} onChange={(e) => setFundingAmount(e.target.value)}></Form.Input>
            </Form.Field>
            <Form.Field>
                <label>Public</label>
                <Form.Checkbox label="Set this channel to be public" checked={isPublic} onClick={() => setIsPublic(s => !s)}></Form.Checkbox>
            </Form.Field>
            <Form.Button color="green" onClick={openChannel}>Open channel</Form.Button>
        </Form>
    </>
};

export default OpenChannelField;
