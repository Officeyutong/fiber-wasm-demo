import type { Fiber, GraphChannelsResult, GraphNodesResult, HexString, ListChannelsResult, ListPeerResult, NodeInfoResult } from "@nervosnetwork/fiber-js";
import { Fragment, useEffect, useState } from "react";
import { Button, Header, Segment, Table } from "semantic-ui-react";
import ViewDetailModal from "./ViewDetailModal";
import hljs from "highlight.js";

const FiberStatus: React.FC<{ fiber: Fiber; setLoading: (f: boolean) => void; address: string; }> = ({ fiber, setLoading, address }) => {

    const [peers, setPeers] = useState<ListPeerResult>();
    const [channelsOfPeers, setChannelsOfPeers] = useState<Map<string, ListChannelsResult> | null>(null);
    const [showingDetail, setShowingDetail] = useState<null | string>(null);
    const [nodeInfo, setNodeInfo] = useState<NodeInfoResult | null>(null);
    const [graphNodes, setGraphNodes] = useState<GraphNodesResult | null>(null);
    const [graphChannels, setGraphChannels] = useState<GraphChannelsResult | null>(null);

    useEffect(() => {
        const token = setInterval(async () => {
            try {
                const peers = await fiber.listPeers();
                setPeers(peers);
                setNodeInfo(await fiber.nodeInfo());
                setGraphNodes(await fiber.graphNodes({ limit: "0x1000" }));
                setGraphChannels(await fiber.graphChannels({ limit: "0x10000" }));

            } catch (e) { alert(e) }
        }, 1000);
        return () => clearInterval(token);
    });
    useEffect(() => {
        (async () => {
            const result = new Map();
            try {
                if (peers?.peers) {
                    for (const peer of peers.peers) {
                        result.set(peer.peer_id, await fiber.listChannels({ peer_id: peer.peer_id, include_closed: false }));
                    }
                }
            } catch (e) {
                alert(e);
            }
            // console.log(result);
            setChannelsOfPeers(result);
        })();
    }, [fiber, peers]);
    const shutdownChannel = async (channelId: HexString) => {
        try {
            setLoading(true);
            await fiber.shutdownChannel({
                channel_id: channelId,
                fee_rate: "0x3FC",
                close_script: {
                    "code_hash": "0x9bd7e06f3ecf4be0f2fcd2188b23f1b9fcc88e5d4b65a8637b17723bbda3cce8",
                    "hash_type": "type",
                    "args": "0xcc015401df73a3287d8b2b19f0cc23572ac8b14d"
                },
                // force: true
            })
        } catch (e) { alert(e) } finally {
            setLoading(false);
        }
    }
    return <>
        {showingDetail !== null && <ViewDetailModal
            content={showingDetail}
            onClose={() => setShowingDetail(null)}
        ></ViewDetailModal>}
        <Header as="h2">
            Status
        </Header>
        <Segment stacked>
            <Header as="h3">CKB Address of this node</Header>
            {address}
            <Header as="h3">Connected peers</Header>
            <Table>
                <Table.Header>
                    <Table.Row>
                        <Table.HeaderCell>Peer ID</Table.HeaderCell>
                        <Table.HeaderCell>Public key</Table.HeaderCell>
                        <Table.HeaderCell>Address</Table.HeaderCell>
                    </Table.Row>
                </Table.Header>
                <Table.Body>
                    {peers && <>
                        {peers.peers.map(line => <Table.Row key={line.peer_id}>
                            <Table.Cell style={{ wordBreak: "break-all" }}>{line.peer_id}</Table.Cell>
                            <Table.Cell style={{ wordBreak: "break-all" }}>{line.pubkey}</Table.Cell>
                            <Table.Cell style={{ wordBreak: "break-all" }}>
                                {line.address}
                            </Table.Cell>
                        </Table.Row>)}
                    </>}
                </Table.Body>
            </Table>
            {channelsOfPeers && (() => {
                const result = [];
                for (const [key, value] of channelsOfPeers.entries()) {
                    result.push(<Fragment key={key}>
                        <Header as="h3">Channels of {key}</Header>
                        <div style={{ overflowX: "scroll" }}>
                            <Table>
                                <Table.Header>
                                    <Table.Row>
                                        <Table.HeaderCell>
                                            Channel ID
                                        </Table.HeaderCell>
                                        <Table.HeaderCell>
                                            Channel outpoint
                                        </Table.HeaderCell>
                                        <Table.HeaderCell>
                                            Enabled
                                        </Table.HeaderCell>
                                        <Table.HeaderCell>State</Table.HeaderCell>
                                        <Table.HeaderCell>Operations</Table.HeaderCell>
                                    </Table.Row>
                                </Table.Header>
                                <Table.Body>
                                    {value.channels.map(line => <Table.Row key={line.channel_id}>
                                        <Table.Cell>
                                            {line.channel_id}
                                        </Table.Cell>
                                        <Table.Cell>
                                            {line.channel_outpoint}
                                        </Table.Cell>
                                        <Table.Cell>
                                            {String(line.enabled)}
                                        </Table.Cell>
                                        <Table.Cell>
                                            {line.state.state_name}({line.state.state_flags})
                                        </Table.Cell>
                                        <Table.Cell>
                                            <Button onClick={() => setShowingDetail(JSON.stringify(line, undefined, 4))} size="small" color="green">View details</Button>
                                            <Button onClick={() => shutdownChannel(line.channel_id)} size="small" color="red">Shutdown</Button>

                                        </Table.Cell>
                                    </Table.Row>)}
                                </Table.Body>
                            </Table>
                        </div>
                    </Fragment>)
                }
                return result;
            })()}

            {graphNodes !== null && <>
                <Header as="h3">Graph Nodes</Header>
                <Table>
                    <Table.Header>
                        <Table.Row>
                            <Table.HeaderCell>Node name</Table.HeaderCell>
                            <Table.HeaderCell>Node ID</Table.HeaderCell>
                            <Table.HeaderCell>Operations</Table.HeaderCell>
                        </Table.Row>
                    </Table.Header>
                    <Table.Body>
                        {graphNodes.nodes.map(item => <Table.Row key={item.node_id}>
                            <Table.Cell>{item.node_name}</Table.Cell>
                            <Table.Cell>{item.node_id}</Table.Cell>
                            <Table.Cell><Button size="small" onClick={() => setShowingDetail(JSON.stringify(item, undefined, 4))}>Details</Button></Table.Cell>

                        </Table.Row>)}
                    </Table.Body>
                </Table>
            </>}
            {graphChannels !== null && <>
                <Header as="h3">Graph Channels</Header>
                <div style={{ overflowX: "scroll" }}>
                    <Table>
                        <Table.Header>
                            <Table.Row>
                                <Table.HeaderCell>Node 1</Table.HeaderCell>
                                <Table.HeaderCell>Node 2</Table.HeaderCell>
                                <Table.HeaderCell>Capacity</Table.HeaderCell>
                                <Table.HeaderCell>Chain hash</Table.HeaderCell>
                                <Table.HeaderCell>Operations</Table.HeaderCell>
                            </Table.Row>
                        </Table.Header>
                        <Table.Body>
                            {graphChannels.channels.map((item, idx) => <Table.Row key={idx}>
                                <Table.Cell>{item.node1}</Table.Cell>
                                <Table.Cell>{item.node2}</Table.Cell>
                                <Table.Cell>{item.capacity}</Table.Cell>
                                <Table.Cell>{item.chain_hash}</Table.Cell>
                                <Table.Cell><Button size="small" onClick={() => setShowingDetail(JSON.stringify(item, undefined, 4))}>Details</Button></Table.Cell>

                            </Table.Row>)}
                        </Table.Body>
                    </Table>
                </div>
            </>}

            {nodeInfo !== null && <>
                <Header as="h3">Node Info</Header>
                <pre dangerouslySetInnerHTML={{ __html: hljs.highlight(JSON.stringify(nodeInfo, undefined, 4), { language: "json" }).value }}></pre>
            </>}
        </Segment>
    </>
};

export default FiberStatus;
