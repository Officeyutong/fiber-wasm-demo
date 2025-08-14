import React, { useEffect, useState } from 'react'
import { Fiber, randomSecretKey } from "@nervosnetwork/fiber-js";
import { Container, Dimmer, Form, Header, Loader, Segment, Tab, TabPane, TextArea } from 'semantic-ui-react';
import DefaultConfig from "./default_config.txt";
import FiberStatus from './FiberStatus';
import OpenChannelField from './OpenChannelField';
import CreateInvoiceField from './CreateInvoiceField';
import SendPaymentWithInvoiceField from './SendPaymentWithInvoiceField';
import { hexStringToUint8Array, uint8ArrayToHexString, useInputValue } from './main';
import SendPaymentField from './SendPaymentField';
enum AppState {
    BeforeInit,
    FiberStarted
}

interface AppStateBeforeInit {
    state: AppState.BeforeInit;
}
interface AppStateFiberStarted {
    state: AppState.FiberStarted;
    fiber: Fiber;
}

const CKB_SECRET_KEY = "CKB_SECRET_KEY";
const FIBER_KEY_PAIR = "FIBER_KEY_PAIR";
const DATABASE_PREFIX = "DATABASE_PREFIX";

// eslint-disable-next-line @typescript-eslint/no-empty-object-type
const App: React.FC<{}> = () => {
    const [appState, setAppState] = useState<AppStateBeforeInit | AppStateFiberStarted>({ state: AppState.BeforeInit });
    const [config, setConfig] = useState<string>(DefaultConfig);
    const [configLoaded, setConfigLoaded] = useState(false);
    const [loading, setLoading] = useState(false);
    const [logLevel, setLogLevel] = useState<"debug" | "info">("info");
    const ckbSecretKey = useInputValue(uint8ArrayToHexString(randomSecretKey()));
    const fiberKeypair = useInputValue(uint8ArrayToHexString(randomSecretKey()));
    const databasePrefix = useInputValue("");
    useEffect(() => {
        if (!configLoaded) {
            (async () => {
                try {
                    setLoading(true);
                    setConfig(await (await fetch(DefaultConfig)).text());
                    setConfigLoaded(true);
                } catch (e) { alert(e) } finally { setLoading(false); }
            })();
        }
    }, [configLoaded]);
    useEffect(() => {
        const fiberKeyPairFromLS = window.localStorage.getItem(FIBER_KEY_PAIR);
        if (fiberKeyPairFromLS !== null) {
            fiberKeypair.set(fiberKeyPairFromLS);
        }
        const ckbSecretFromLS = window.localStorage.getItem(CKB_SECRET_KEY);
        if (ckbSecretFromLS !== null) {
            ckbSecretKey.set(ckbSecretFromLS);
        }
        const databasePrefixFromLS = window.localStorage.getItem(DATABASE_PREFIX);
        if (databasePrefixFromLS !== null) {
            databasePrefix.set(databasePrefixFromLS);
        }
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [configLoaded]);
    const startFiber = async () => {
        try {
            setLoading(true);
            const fiber = new Fiber();
            await fiber.start(
                config,
                hexStringToUint8Array(fiberKeypair.value),
                hexStringToUint8Array(ckbSecretKey.value),
                undefined,
                logLevel,
                databasePrefix.value
            );
            window.localStorage.setItem(FIBER_KEY_PAIR, fiberKeypair.value);
            window.localStorage.setItem(CKB_SECRET_KEY, ckbSecretKey.value);
            window.localStorage.setItem(DATABASE_PREFIX, databasePrefix.value);
            setAppState({ state: AppState.FiberStarted, fiber });

        } catch (e) {
            alert(e);
            console.error(e);
        } finally {
            setLoading(false);
        }
    };
    return <Container style={{ marginTop: "50px" }}>
        <Header as="h1">
            Fiber Wasm Demo
        </Header>
        {loading && <Dimmer page active><Loader></Loader></Dimmer>}


        {appState.state === AppState.BeforeInit &&
            <Segment stacked>
                <Form>
                    <Form.Field>
                        <label>Fiber configuration</label>
                        <TextArea
                            value={config}
                            onChange={(evt) => setConfig(evt.target.value)}
                            rows={30}
                        ></TextArea>
                    </Form.Field>
                    <Form.Group inline>
                        <label>Log level</label>
                        <Form.Radio label="Debug" checked={logLevel === "debug"} onClick={() => setLogLevel("debug")}></Form.Radio>
                        <Form.Radio label="Info" checked={logLevel === "info"} onClick={() => setLogLevel("info")}></Form.Radio>
                    </Form.Group>
                    <Form.Field>
                        <label>Fiber keypair</label>
                        <Form.Input {...fiberKeypair}></Form.Input>
                    </Form.Field>
                    <Form.Field>
                        <label>CKB secret key</label>
                        <Form.Input {...ckbSecretKey}></Form.Input>
                    </Form.Field>
                    <Form.Field>
                        <label>Database prefix</label>
                        <Form.Input {...databasePrefix}></Form.Input>
                    </Form.Field>

                    <Form.Button color="green" onClick={startFiber}>
                        Start fiber
                    </Form.Button>
                </Form>
            </Segment>
        }
        {appState.state === AppState.FiberStarted && <>
            <Tab menu={{ pointing: true }} panes={[
                {
                    menuItem: "Open Channel",
                    render: () => <TabPane attached={false}><OpenChannelField fiber={appState.fiber} setLoading={setLoading}></OpenChannelField></TabPane>
                },
                {
                    menuItem: "New Invoice",
                    render: () => <TabPane attached={false}><CreateInvoiceField fiber={appState.fiber} setLoading={setLoading}></CreateInvoiceField></TabPane>
                },
                {
                    menuItem: "Send Payment with Invoice",
                    render: () => <TabPane attached={false}><SendPaymentWithInvoiceField fiber={appState.fiber} setLoading={setLoading}></SendPaymentWithInvoiceField></TabPane>
                },
                {
                    menuItem: "Send Payment",
                    render: () => <TabPane attached={false}><SendPaymentField fiber={appState.fiber} setLoading={setLoading}></SendPaymentField></TabPane>
                },

            ]}></Tab>
            <FiberStatus fiber={appState.fiber} setLoading={setLoading}></FiberStatus>
        </>}
    </Container>
}

export default App
