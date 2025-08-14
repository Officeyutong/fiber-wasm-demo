import { Button, Modal } from "semantic-ui-react"
import { useMemo } from "react";
import hljs from 'highlight.js/lib/core';

const ViewDetailModal: React.FC<{ content: string; onClose: () => void; }> = ({ content, onClose }) => {

    const rendered = useMemo(() => {
        return hljs.highlight(content, { language: "json" }).value;
    }, [content]);
    return <Modal open>
        <Modal.Header>View details</Modal.Header>
        <Modal.Content>
            <pre dangerouslySetInnerHTML={{ __html: rendered }}></pre>
        </Modal.Content>
        <Modal.Actions>
            <Button color="red" onClick={onClose}>Close</Button>
        </Modal.Actions>
    </Modal>
}

export default ViewDetailModal;
