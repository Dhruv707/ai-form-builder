import FormRenderer from "./FormRenderer";

const LivePreview = ({ schema, errorsByName }) => {

  return (
    <div style={{ marginTop: 36 }}>
      <h2 style={{ textAlign: "center" }}>Live Preview</h2>
      <div style={{ width: "80%", margin: "0 auto" }}>
        <FormRenderer schema={schema} errorsByName={errorsByName} />
      </div>
    </div>
  );
};

export default LivePreview;
