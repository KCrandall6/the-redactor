import React, { useEffect, useState } from 'react';
import { Spinner } from 'react-bootstrap';
import DocViewer, { DocViewerRenderers } from "@cyntler/react-doc-viewer";

const DocViewerComponent = ({ pdf }) => {
  const [docs, setDocs] = useState([]);

  useEffect(() => {
    if (pdf) {
      // Convert the ArrayBuffer to a Blob
      const blob = new Blob([pdf], { type: 'application/pdf' });

      // Create a URL for the Blob
      const pdfUrl = URL.createObjectURL(blob);

      // Update the state with the new PDF document
      setDocs([{ uri: pdfUrl }]);
    }
  }, [pdf]);

  if (!pdf) {
    return <Spinner animation="border" role="status" />;
  }

  return (
    <>
      <DocViewer
        pluginRenderers={DocViewerRenderers}
        documents={docs}
      />
    </>
  );
};

export default DocViewerComponent;
